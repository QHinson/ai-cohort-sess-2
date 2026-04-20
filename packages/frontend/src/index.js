import { createTheme, CssBaseline, ThemeProvider } from '@mui/material';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#7E57C2',
      light: '#B085F5',
      dark: '#4D2C91',
    },
    secondary: {
      main: '#26A69A',
      light: '#64D8CB',
      dark: '#00766C',
    },
    background: {
      default: '#121212',
      paper: '#1E1E1E',
    },
    divider: '#3A3A3A',
    text: {
      primary: '#F5F5F5',
      secondary: '#BDBDBD',
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButtonBase: {
      defaultProps: {
        disableRipple: true,
      },
    },
  },
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <React.StrictMode>
      <App />
    </React.StrictMode>
  </ThemeProvider>
);