  interface Color {
    primary: string,
    secondary: string,
    title: string,
    white: string,
    typographyDefault: string,
    positive: string,
    positiveSecondary: string,
    danger: string,
    negativeSecondary: string,
    caption: string,
    divider: string,
    info: string,
    infoSecondary: string,
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
    primary: 'rgba(245, 124, 0, 1)',
    secondary: 'rgb(255, 235, 215)',
    title: "#000000",
    caption: '#8E8E8E',
    white: "#FFFFFF",
    typographyDefault: "#1A1A1A",
    positive: '#1DC973',
    positiveSecondary: '#E1FCED',
    danger: '#F64C4C',
    negativeSecondary: '#FFEBEE',
    divider: '#EBEBEB',
    info: '#4F8EF7',
    infoSecondary: '#3dbcf2',
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