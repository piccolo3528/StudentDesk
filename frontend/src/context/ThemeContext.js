import React, { createContext, useState, useMemo } from 'react';
import { ThemeProvider as MUIThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';

// Color palette
const themeColors = {
  primary: {
    main: '#4a6741', // Forest green
    light: '#6f9062',
    dark: '#2a3d25',
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#f57c00', // Orange
    light: '#ffad42',
    dark: '#bc5100',
    contrastText: '#ffffff',
  },
  error: {
    main: '#d32f2f',
    light: '#ef5350',
    dark: '#c62828',
  },
  background: {
    default: '#f8f9fa',
    paper: '#ffffff',
  },
};

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [mode, setMode] = useState('light');

  const toggleMode = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          ...(mode === 'light'
            ? {
                primary: themeColors.primary,
                secondary: themeColors.secondary,
                error: themeColors.error,
                background: themeColors.background,
              }
            : {
                primary: {
                  main: themeColors.primary.light,
                },
                secondary: {
                  main: themeColors.secondary.light,
                },
                background: {
                  default: '#1c2025',
                  paper: '#2d333b',
                },
              }),
        },
        typography: {
          fontFamily: 'Poppins, Roboto, "Helvetica Neue", Arial, sans-serif',
          h1: {
            fontWeight: 600,
          },
          h2: {
            fontWeight: 600,
          },
          h3: {
            fontWeight: 600,
          },
          h4: {
            fontWeight: 600,
          },
          h5: {
            fontWeight: 600,
          },
          h6: {
            fontWeight: 600,
          },
          button: {
            textTransform: 'none',
            fontWeight: 500,
          },
        },
        shape: {
          borderRadius: 8,
        },
        components: {
          MuiButton: {
            styleOverrides: {
              root: {
                borderRadius: 6,
                padding: '8px 16px',
              },
              contained: {
                boxShadow: 'none',
                '&:hover': {
                  boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
                },
              },
            },
          },
          MuiCard: {
            styleOverrides: {
              root: {
                borderRadius: 12,
                boxShadow: '0px 5px 15px rgba(0, 0, 0, 0.05)',
              },
            },
          },
        },
      }),
    [mode]
  );

  return (
    <ThemeContext.Provider value={{ mode, toggleMode }}>
      <MUIThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MUIThemeProvider>
    </ThemeContext.Provider>
  );
};

export default ThemeContext; 