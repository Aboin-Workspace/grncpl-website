import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@/styles/globals.css'
import { createLenis } from '@/lib/lenis'
import App from './App'

// Lenis is a singleton created before React mounts so every component can subscribe on its first effect.
createLenis()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
