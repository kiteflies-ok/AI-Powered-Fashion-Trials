import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import CanvasParticles from './components/CanvasParticles.jsx'

createRoot(document.getElementById('root')).render(
    <StrictMode>
        {/* Canvas constellation lives outside App — no existing JSX touched */}
        <CanvasParticles />
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </StrictMode>,
)
