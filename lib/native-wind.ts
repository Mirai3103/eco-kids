import { Image } from "expo-image";
import { MotiText, MotiView } from "moti";
import { cssInterop } from "nativewind";
import { SafeAreaView } from "react-native-safe-area-context";
cssInterop(SafeAreaView, {
  className: {
    target: "style",
  },
});
cssInterop(MotiView, {
  className: {
    target: "style",
  },
});
cssInterop(MotiText, {
  className: {
    target: "style",
  },
});
cssInterop(Image, {
  className: {
    target: "style",
  },
});
