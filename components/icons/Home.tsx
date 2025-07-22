import * as React from "react";
import Svg, { Path, SvgProps } from "react-native-svg";
interface HomeIconProps extends SvgProps {
  size?: number;
  topFill?: string;
  bottomFill?: string;
}
function HomeIcon({
  size = 24,
  topFill = "#000",
  bottomFill = "#000",
  ...props
}: HomeIconProps) {
  return (
    <Svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <Path
        fill={topFill}
        d="M11.47 3.841a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.061l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 101.061 1.06l8.69-8.689z"
      />
      <Path
        fill={bottomFill}
        d="M12 5.432l8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75V21a.75.75 0 01-.75.75H5.625a1.875 1.875 0 01-1.875-1.875v-6.198a2.29 2.29 0 00.091-.086L12 5.432z"
      />
    </Svg>
  );
}

export default HomeIcon;
