// Entry point – mounts the React app into the #root DOM node
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

// Render the top-level <App> wrapped in StrictMode for extra dev-time warnings
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
