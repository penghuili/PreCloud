import { extendTheme } from 'native-base';

// primary color: #39DAA2

export function getTheme() {
  return   extendTheme({
    colors: {
      primary: {
        50: '#defef3',
        100: '#b9f4e0',
        200: '#90eccc',
        300: '#67e3b8',
        400: '#39DAA2',
        500: '#24c18b',
        600: '#17966c',
        700: '#0b6b4c',
        800: '#00412d',
        900: '#00170c',
      },
    },
  });
}