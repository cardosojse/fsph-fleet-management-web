import { alpha, createTheme } from '@mui/material/styles';

/**
 * Tokens institucionais extraídos do Figma "Wireframes SVO — MVP".
 * Use sempre estes valores (ou o `theme.palette`) em vez de cores escritas nas telas.
 */
export const tokens = {
  navy: {
    900: '#0b1222',
    800: '#0f172a',
    700: '#172036',
    600: '#1e293b',
    300: '#94a3b8',
    200: '#bcc8db',
    100: '#d5dbe6',
  },
  blue: {
    800: '#1e3a8a',
    700: '#1d4ed8',
    600: '#2563eb',
    100: '#dbeafe',
    50: '#eff6ff',
  },
  text: {
    strong: '#111827',
    body: '#4b5563',
    muted: '#9ca3af',
  },
  border: {
    strong: '#d1d5db',
    subtle: '#e5e7eb',
  },
  surface: {
    page: '#f8fafc',
    raised: '#ffffff',
    sunken: '#f3f6fa',
  },
  status: {
    success: { fg: '#047857', bg: '#d1fae5', soft: '#ecf7f1' },
    warning: { fg: '#925b16', bg: '#fef3c7', soft: '#fff7e8' },
    error: { fg: '#b42323', bg: '#fee2e2', soft: '#fff1f1' },
    info: { fg: '#1e3a8a', bg: '#dbeafe', soft: '#eff6ff' },
  },
} as const;

const fontFamily =
  '"Inter Variable", Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: tokens.blue[800],
      light: tokens.blue[600],
      dark: '#172c6b',
      contrastText: '#ffffff',
    },
    secondary: {
      main: tokens.navy[800],
      contrastText: '#ffffff',
    },
    success: { main: tokens.status.success.fg, light: tokens.status.success.bg },
    warning: { main: tokens.status.warning.fg, light: tokens.status.warning.bg },
    error: { main: tokens.status.error.fg, light: tokens.status.error.bg },
    info: { main: tokens.status.info.fg, light: tokens.status.info.bg },
    text: {
      primary: tokens.text.strong,
      secondary: tokens.text.body,
      disabled: tokens.text.muted,
    },
    divider: tokens.border.subtle,
    background: {
      default: tokens.surface.page,
      paper: tokens.surface.raised,
    },
  },
  shape: {
    borderRadius: 6,
  },
  typography: {
    fontFamily,
    h1: {
      fontSize: 'clamp(1.5rem, 2.4vw, 1.75rem)',
      fontWeight: 700,
      letterSpacing: '-0.015em',
      lineHeight: 1.2,
    },
    h2: { fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.01em' },
    h3: { fontSize: '1.0625rem', fontWeight: 700 },
    overline: { fontWeight: 700, letterSpacing: '0.1em', lineHeight: 1.6 },
    button: { textTransform: 'none', fontWeight: 600, letterSpacing: 0 },
  },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: 4 },
        sizeLarge: { paddingBlock: 11, fontSize: '0.9375rem' },
      },
    },
    MuiPaper: {
      styleOverrides: {
        outlined: { borderColor: tokens.border.subtle },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          backgroundColor: tokens.surface.raised,
          '& .MuiOutlinedInput-notchedOutline': { borderColor: tokens.border.strong },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 600, borderRadius: 4 },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          alignItems: 'flex-start',
          variants: (['info', 'success', 'warning', 'error'] as const).map((severity) => ({
            props: { variant: 'standard', severity },
            style: {
              backgroundColor: tokens.status[severity].soft,
              color: tokens.status[severity].fg,
              '& .MuiAlert-icon': { color: tokens.status[severity].fg },
            },
          })),
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: { borderColor: tokens.border.subtle },
        head: {
          color: tokens.text.body,
          fontWeight: 600,
          fontSize: '0.75rem',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          backgroundColor: tokens.surface.sunken,
        },
      },
    },
    MuiLink: {
      defaultProps: { underline: 'hover' },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: { backgroundColor: alpha(tokens.navy[800], 0.95), fontSize: '0.75rem' },
      },
    },
  },
});
