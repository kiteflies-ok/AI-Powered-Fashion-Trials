import { useRef } from 'react'
import { Sparkles, Loader2 } from 'lucide-react'

function addRipple(e) {
    const btn  = e.currentTarget
    const rect = btn.getBoundingClientRect()
    const size = Math.max(rect.width, rect.height)
    const x    = e.clientX - rect.left - size / 2
    const y    = e.clientY - rect.top  - size / 2

    const ripple = document.createElement('span')
    ripple.className = 'ripple'
    ripple.style.cssText = `width:${size}px;height:${size}px;left:${x}px;top:${y}px`
    btn.appendChild(ripple)
    setTimeout(() => ripple.remove(), 700)
}

export default function TryOnButton({ onClick, disabled, loading }) {
    return (
        <div className="flex flex-col items-center gap-3">
            <button
                id="try-on-btn"
                className={`btn-primary w-[200px] h-[50px] ${loading ? 'opacity-90 cursor-wait' : ''}`}
                onClick={(e) => { if (!disabled && !loading) { addRipple(e); onClick() } }}
                disabled={disabled || loading}
                aria-label="Try on the garment"
                style={loading ? { transform: 'scale(0.98)', transition: 'transform 0.4s ease' } : {}}
            >
                {loading ? (
                    <div className="flex items-center justify-center gap-2 w-full h-full">
                        <Loader2 size={18} className="animate-spin opacity-80" />
                        <span className="font-medium opacity-90">Processing...</span>
                    </div>
                ) : (
                    <div className="flex items-center justify-center gap-2 w-full h-full">
                        <Sparkles size={18} className="animate-float opacity-90" style={{ animationDuration: '2s' }} />
                        <span className="font-medium">Try It On</span>
                    </div>
                )}
            </button>

            {disabled && !loading && (
                <p className="text-xs text-white/25 text-center max-w-[220px]">
                    Upload both photos to get started
                </p>
            )}
        </div>
    )
}
