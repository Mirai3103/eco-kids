

## 1️⃣ Định nghĩa chính xác

Giả sử có hai chuỗi văn bản:

* ( S_1 )
* ( S_2 )

Sau khi **chuẩn hoá** (lowercase, bỏ dấu):

[
S'_1 = \text{normalize}(S_1), \quad
S'_2 = \text{normalize}(S_2)
]

---

## 2️⃣ Tạo tập trigram

PostgreSQL **pad chuỗi bằng 2 ký tự trắng ở đầu và 1 ở cuối**, sau đó sinh các trigram.

Với chuỗi ( S' ) có độ dài ( n ):

[
\text{Trigrams}(S') = {, S'[i..i+2] \mid 0 \le i \le n ,}
]

📌 Padding giúp:

* so khớp **đầu chuỗi**
* không bỏ sót ký tự biên

---

## 3️⃣ Ví dụ cụ thể

### Chuỗi:

```text
S1 = "on o"
S2 = "con tho"
```

### Sau padding:

```text
"  on o "
"  con tho "
```

### Tập trigram:

[
T_1 = {,"  o", " on", "on ", "n o", " o ",}
]

[
T_2 = {,"  c", " co", "con", "on ", "n t", " th", "tho", "ho ",}
]

---

## 4️⃣ Công thức similarity (Jaccard coefficient)

PostgreSQL sử dụng **Jaccard similarity**:

[
\text{similarity}(S_1, S_2)
===========================

\frac{|T_1 \cap T_2|}
{|T_1 \cup T_2|}
]

Trong đó:

* ( |T_1 \cap T_2| ): số trigram **giống nhau**
* ( |T_1 \cup T_2| ): tổng số trigram **không trùng lặp**

---

## 5️⃣ Áp dụng vào ví dụ

### Giao nhau:

[
T_1 \cap T_2 = {,"on ",}
\Rightarrow |T_1 \cap T_2| = 1
]

### Hợp:

[
|T_1 \cup T_2| = 5 + 8 - 1 = 12
]

### Similarity:

[
\text{similarity} = \frac{1}{12} \approx 0.083
]

👉 Giá trị **nhỏ nhưng > 0**, nên:

* **FTS → fail**
* **Trigram → vẫn nhận diện được**

---

## 6️⃣ Ngưỡng (Threshold) hoạt động thế nào?

PostgreSQL định nghĩa:

[
S_1 % S_2
\iff
\text{similarity}(S_1, S_2) \ge \tau
]

Trong đó:

* ( \tau ) = `pg_trgm.similarity_threshold`
* thường nằm trong `[0.2, 0.35]`

Ví dụ:

```sql
SELECT set_limit(0.25);
```

---

## 7️⃣ Vì sao thiếu / sai ký tự vẫn match?

* Thiếu âm đầu → mất 1–2 trigram đầu
* Phần còn lại **vẫn chồng lắp**
* Similarity giảm **tuyến tính**, không về 0 ngay

Đây là lý do Trigram **chịu typo rất tốt**.

---

## 8️⃣ So sánh nhanh với Levenshtein (để phản biện)

| Thuật toán  | Công thức              | Tính chất             |
| ----------- | ---------------------- | --------------------- |
| Levenshtein | số phép edit tối thiểu | nhạy cảm, không index |
| Trigram     | Jaccard coefficient    | fuzzy + index được    |

---

## 9️⃣ Cách viết “chuẩn chỉnh” trong luận văn

> *Given two normalized strings, trigram similarity decomposes each string into overlapping sequences of three characters and computes their similarity using the Jaccard coefficient, defined as the ratio between the number of shared trigrams and the total number of unique trigrams.*

---

## 10️⃣ Kết luận 1 câu (rất nên dùng)

> **Trigram similarity đo mức độ giống nhau của hai chuỗi bằng tỷ lệ chồng lắp giữa các trigram, cho phép hệ thống nhận diện các chuỗi bị thiếu hoặc sai ký tự mà không yêu cầu khớp chính xác.**

---

Nếu bạn muốn:

* mình **viết công thức LaTeX hoàn chỉnh**
* hoặc **vẽ hình minh hoạ thuật toán (Figure)** cho luận văn

👉 nói mình biết nhé
