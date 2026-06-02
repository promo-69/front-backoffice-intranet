import { StrictMode } from 'react'
import { createRoot } from "react-dom/client";
import './index.css'
import App from './App.jsx'
import { LoadingProvider } from "./context/LoadingContext";
import  { Toaster } from "@/components/ui/sonner"

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <LoadingProvider>
      <App />
     <Toaster richColors closeButton position="top-right" />
    </LoadingProvider>
  </StrictMode>,
)
