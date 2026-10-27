import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#0b4f6c',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#157f65',
    },
    background: {
      default: '#f4f7f9',
      paper: '#ffffff',
    },
  },
  shape: {
    borderRadius: 10,
  },
  typography: {
    fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    h1: {
      fontSize: 'clamp(2rem, 5vw, 3.25rem)',
      fontWeight: 700,
      letterSpacing: '-0.03em',
    },
  },
});
