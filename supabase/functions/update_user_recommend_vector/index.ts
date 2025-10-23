// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
// Import Supabase client
import { createClient } from "npm:@supabase/supabase-js@2";
import type { Database } from "../../../types/database.types";

console.log("Edge Function 'update-user-recommend-vector' is up.");

// --- Các hàm tính toán Vector ---

/**
 * Cộng hai vector
 */
function addVectors(v1: number[], v2: number[]): number[] {
  // Đảm bảo vector có cùng chiều
  if (v1.length !== v2.length) {
    throw new Error("Vectors must have the same dimension to be added.");
  }
  return v1.map((val, i) => val + v2[i]);
}

/**
 * Nhân vector với một số vô hướng (scalar)
 */
function multiplyVectorByScalar(v: number[], scalar: number): number[] {
  return v.map((val) => val * scalar);
}

/**
 * Chia vector cho một số vô hướng (scalar)
 */
function divideVectorByScalar(v: number[], scalar: number): number[] {
  if (scalar === 0) {
    throw new Error("Cannot divide vector by zero.");
  }
  return v.map((val) => val / scalar);
}

/**
 * Tính độ lớn (magnitude) của vector
 */
function getVectorMagnitude(v: number[]): number {
  // Tính tổng bình phương các phần tử
  const sumOfSquares = v.reduce((acc, val) => acc + val * val, 0);
  // Lấy căn bậc hai
  return Math.sqrt(sumOfSquares);
}

/**
 * Chuẩn hóa L2 (L2 Normalization)
 */
function l2Normalize(v: number[]): number[] {
  const magnitude = getVectorMagnitude(v);
  if (magnitude === 0) {
    // Trả về vector 0 nếu độ lớn là 0
    return v;
  }
  return divideVectorByScalar(v, magnitude);
}

// --- Logic nghiệp vụ ---

/**
 * Tính trọng số dựa trên tiến độ đọc
 */
function getWeightFromProgress(progress: number): number {
  if (progress >= 0.7) return 0.6;
  if (progress < 0.3) return 0.2;
  return 0.4;
}

// --- Xử lý Request ---

Deno.serve(async (req) => {
  // Xử lý CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers":
          "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  try {
    // 1. Lấy user_id từ body
    const { user_id } = await req.json();
    if (!user_id) {
      throw new Error("user_id is required in the request body.");
    }

    // 2. Tạo Supabase Admin Client
    // Cần Service Role Key để cập nhật bảng 'users'
    const supabaseAdmin = createClient<Database>(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // 3. Lấy Top 10 Favorites (Giống CTE 'favs')
    const { data: favsData, error: favsError } = await supabaseAdmin
      .from("favorite_stories")
      .select("story_id")
      .eq("user_id", user_id)
      .order("created_at", { ascending: false })
      .limit(10);

    if (favsError) throw favsError;

    const favs = favsData.map((f) => ({
      story_id: f.story_id,
      weight: 1.0,
    }));

    // 4. Lấy Top 10 Reads (Giống CTE 'reads')
    const { data: readsData, error: readsError } = await supabaseAdmin
      .from("reading_history")
      .select("story_id, progress")
      .eq("user_id", user_id)
      .order("read_at", { ascending: false })
      .limit(10);

    if (readsError) throw readsError;

    const reads = readsData.map((r) => ({
      story_id: r.story_id,
      weight: getWeightFromProgress(r.progress || 0),
    }));

    // 5. Combine và Lấy Top 10 (Giống CTE 'unioned' & 'limited')
    const allActivities = [...favs, ...reads];
    allActivities.sort((a, b) => b.weight - a.weight); // Sắp xếp theo weight giảm dần
    const topActivities = allActivities.slice(0, 10);

    if (topActivities.length === 0) {
      // Không có hoạt động, không cần làm gì
      return new Response(
        JSON.stringify({ message: "No recent activity for this user." }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    // 6. Lấy story_ids và fetch embeddings
    const storyIds = [...new Set(topActivities.map((a) => a.story_id || ""))];
    const { data: stories, error: storiesError } = await supabaseAdmin
      .from("stories")
      .select("id, embedding")
      .in("id", storyIds)
      .not("embedding", "is", null);

    if (storiesError) throw storiesError;

    // Tạo map để tra cứu embedding
    const embeddingMap = new Map<string, number[]>();
    for (const story of stories) {
      try {
        // embedding từ pgvector về là string "[0.1, 0.2, ...]"
        const vector = JSON.parse(story.embedding || "[]");
        if (Array.isArray(vector)) {
          embeddingMap.set(story.id, vector);
        }
      } catch (e) {
        console.warn(
          `Could not parse embedding for story ${story.id}: ${
            e instanceof Error ? e.message : "Unknown error"
          }`
        );
      }
    }

    // 7. Tính toán Vector Trung bình Có trọng số (Weighted Average)
    let aggregatedVector: number[] | null = null;
    let vectorCount = 0;

    for (const activity of topActivities) {
      const embedding = embeddingMap.get(activity.story_id || "");

      if (embedding) {
        // Nhân vector với trọng số
        const weightedVector = multiplyVectorByScalar(
          embedding,
          activity.weight
        );

        // Cộng dồn vector
        if (aggregatedVector) {
          aggregatedVector = addVectors(aggregatedVector, weightedVector);
        } else {
          // Khởi tạo cho vector đầu tiên
          aggregatedVector = weightedVector;
        }
        vectorCount++;
      }
    }

    if (!aggregatedVector || vectorCount === 0) {
      return new Response(
        JSON.stringify({
          message: "No valid embeddings found for recent activity.",
        }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    // Lấy trung bình (SUM(vector) / COUNT)
    const averageVector = divideVectorByScalar(aggregatedVector, vectorCount);

    // 8. Chuẩn hóa L2
    const normalizedVector = l2Normalize(averageVector);

    // 9. Cập nhật bảng 'users'
    // Chuyển lại thành string để lưu vào CSDL
    const vectorString = JSON.stringify(normalizedVector);

    const { error: updateError } = await supabaseAdmin
      .from("users")
      .update({ recommend_vector: vectorString })
      .eq("id", user_id);

    if (updateError) throw updateError;

    // 10. Trả về kết quả
    return new Response(
      JSON.stringify({
        success: true,
        message: `Updated recommend_vector for user ${user_id}`,
      }),
      {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
});
