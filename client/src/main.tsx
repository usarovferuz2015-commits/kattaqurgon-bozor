import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import App from './App';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5,
    },
  },
});

try {
  const root = document.getElementById('root');
  if (root) {
    root.innerHTML = "<h1>Hello World!</h1>";
  }
} catch (error: any) {
  const debugDiv = document.getElementById('debug');
  if (debugDiv) debugDiv.innerText = "Fatal Error: " + error.message;
}
