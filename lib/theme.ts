// theme.ts
const palette = {
  green: {
    100: "#CAFEC3",
    200: "#5EF02C",
    300: "#4BC422",
    400: "#399918",
    500: "#28710F",
    600: "#184B07",
    700: "#092802",
  },
  blue: {
    100: "#EEF0FE",
    200: "#CDD2FB",
    300: "#9CABF7",
    400: "#667FF3",
    500: "#2857E0",
    600: "#183999",
    700: "#091D58",
  },
  red: {
    100: "#FCDCE0",
    200: "#F8A6B1",
    300: "#F5657F",
    400: "#D72654",
    500: "#991839",
    600: "#5F0B20",
    700: "#2A020A",
  },
  gray: {
    100: "#EFF1EF",
    200: "#CDD5CD",
    300: "#A7ADA7",
    400: "#828782",
    500: "#5F635F",
    600: "#3E413E",
    700: "#202220",
  },
};
const theme = {
  palette: {
    ...palette,
    primary: palette.green,
    secondary: palette.blue,
    tertiary: palette.red,
    error: palette.red,
    success: palette.green,
  },
};

export default theme;
