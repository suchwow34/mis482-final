import { DefaultTheme } from "@react-navigation/native";
export const BACKGROUND_COLOR = "#ffffff";

export const MyTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background : BACKGROUND_COLOR
  },
};