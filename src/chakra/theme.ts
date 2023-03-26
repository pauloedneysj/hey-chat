import { extendTheme, ThemeConfig } from "@chakra-ui/react";

const config: ThemeConfig = {
  initialColorMode: "dark",
  useSystemColorMode: false,
};

export const theme = extendTheme(
  { config },
  {
    colors: {
      brand: {
        100: "#f7fafc",
      },
    },
    styles: {
      global: () => ({
        bg: "whiteAlpha.200",
      }),
    },
  }
);
