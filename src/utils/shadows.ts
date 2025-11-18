import { Platform } from "react-native";
import { COLORS } from "../colors";

export const shadow = {
    cards: Platform.select({
      ios: {
        shadowColor: COLORS.title,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.1,
        shadowRadius: 5, 
      },
      android: {
        elevation: 4,
      },
  }),
};