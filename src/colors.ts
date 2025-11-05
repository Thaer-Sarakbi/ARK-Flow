  interface Color {
    title: string,
    white: string,
    positive: string,
    positiveSecondary: string,
    danger: string,
    negativeSecondary: string,
    caption: string,
    divider: string,
    neutral: {
        _50: string,
        _100: string,
        _200: string,
        _300: string,
        _400: string,
        _500: string,
        _600: string,
        _700: string
    }
  }

  export const COLORS: Color = {
    title: "#000000",
    white: "#FFFFFF",
    positive: '#4FAC33',
    positiveSecondary: '#E1FCED',
    danger: '#F64C4C',
    negativeSecondary: '#FFEBEE',
    caption: '#8E8E8E',
    divider: '#EBEBEB',
    neutral: {
        _50: '#FAFAFA',
        _100: "#F5F5F5",
        _200: "#EEEEEE",
        _300: "#E1E1E1",
        _400: "#CACACA",
        _500: "#8E8E8E",
        _600: "#4B4B4B",
        _700: "#1F1F1F"
      },
  }