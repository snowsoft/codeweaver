import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import { MainLayout } from './components/layout/MainLayout';
import { ThemeProvider } from './contexts/ThemeContext';
import { useTheme } from './hooks/useTheme';

function AppContent() {
  const { theme } = useTheme();

  useEffect(() => {
    // Apply theme class to root element
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
  }, [theme]);

  return (
      <>
        <Routes>
          <Route path="/*" element={<MainLayout />} />
        </Routes>
        <Toaster
            position="bottom-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: theme === 'dark' ? '#374151' : '#fff',
                color: theme === 'dark' ? '#fff' : '#111827',
              },
            }}
        />
      </>
  );
}

export default function App() {
  return (
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
  );
}