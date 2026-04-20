import { useState, useRef, useCallback, useEffect } from 'react'

/**
 * BeforeAfterSlider
 *
 * Props:
 *   beforeSrc  – path/URL for the "Before" image
 *   afterSrc   – path/URL for the "After" image
 *   beforeAlt  – alt text for before image (default "Before")
 *   afterAlt   – alt text for after image  (default "After")
 *   defaultPosition – initial slider position 0–100 (default 50)
 *   className  – extra classes on the outer wrapper
 */
export default function BeforeAfterSlider({
    beforeSrc,
    afterSrc,
    beforeAlt = 'Before',
    afterAlt  = 'After',
    defaultPosition = 50,
    className = '',
}) {
    const [position, setPosition]   = useState(defaultPosition)
    const [dragging, setDragging]   = useState(false)
    const [hovered,  setHovered]    = useState(false)
    const containerRef              = useRef(null)

    // ── Calculates position (0-100) from a clientX event ─────────────────────
    const calcPosition = useCallback((clientX) => {
        const rect = containerRef.current?.getBoundingClientRect()
        if (!rect) return
        const raw = ((clientX - rect.left) / rect.width) * 100
        setPosition(Math.min(100, Math.max(0, raw)))
    }, [])

    // ── Mouse handlers ────────────────────────────────────────────────────────
    const onMouseDown = useCallback((e) => {
        e.preventDefault()
        setDragging(true)
    }, [])

    const onMouseMove = useCallback((e) => {
        if (!dragging) return
        calcPosition(e.clientX)
    }, [dragging, calcPosition])

    const onMouseUp = useCallback(() => setDragging(false), [])

    // ── Touch handlers ────────────────────────────────────────────────────────
    const onTouchStart = useCallback((e) => {
        setDragging(true)
    }, [])

    const onTouchMove = useCallback((e) => {
        if (!dragging) return
        calcPosition(e.touches[0].clientX)
    }, [dragging, calcPosition])

    const onTouchEnd = useCallback(() => setDragging(false), [])

    // ── Global listeners so drag works outside the handle ────────────────────
    useEffect(() => {
        if (!dragging) return
        window.addEventListener('mousemove', onMouseMove)
        window.addEventListener('mouseup',   onMouseUp)
        window.addEventListener('touchmove', onTouchMove, { passive: true })
        window.addEventListener('touchend',  onTouchEnd)
        return () => {
            window.removeEventListener('mousemove', onMouseMove)
            window.removeEventListener('mouseup',   onMouseUp)
            window.removeEventListener('touchmove', onTouchMove)
            window.removeEventListener('touchend',  onTouchEnd)
        }
    }, [dragging, onMouseMove, onMouseUp, onTouchMove, onTouchEnd])

    return (
        <div
            ref={containerRef}
            className={`relative overflow-hidden rounded-2xl select-none ${className}`}
            style={{
                boxShadow: '0 24px 60px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.07)',
                cursor: dragging ? 'col-resize' : 'default',
                // Subtle scale-up on hover
                transform: hovered && !dragging ? 'scale(1.012)' : 'scale(1)',
                transition: dragging ? 'none' : 'transform 0.35s cubic-bezier(0.34,1.56,0.64,1)',
            }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            // Allow drag when clicking anywhere on the container, not just the handle
            onMouseDown={onMouseDown}
            onTouchStart={onTouchStart}
        >
            {/* ── AFTER image (full width, bottom layer) ─────────────────── */}
            <img
                src={afterSrc}
                alt={afterAlt}
                draggable={false}
                className="block w-full h-full object-cover"
                style={{ userSelect: 'none', pointerEvents: 'none' }}
            />

            {/* ── BEFORE image (clipped to left of slider) ───────────────── */}
            <div
                className="absolute inset-0 overflow-hidden"
                style={{ width: `${position}%` }}
            >
                <img
                    src={beforeSrc}
                    alt={beforeAlt}
                    draggable={false}
                    className="block w-full h-full object-cover"
                    style={{
                        // keep the image full-width regardless of clip
                        width:  containerRef.current ? `${containerRef.current.offsetWidth}px` : '100%',
                        maxWidth: 'none',
                        userSelect: 'none',
                        pointerEvents: 'none',
                    }}
                />
            </div>

            {/* ── Divider line ───────────────────────────────────────────── */}
            <div
                className="absolute inset-y-0"
                style={{
                    left: `${position}%`,
                    width: '2px',
                    transform: 'translateX(-50%)',
                    background: 'rgba(255,255,255,0.9)',
                    boxShadow: '0 0 12px rgba(255,255,255,0.6)',
                    transition: dragging ? 'none' : 'left 0s',
                    pointerEvents: 'none',
                }}
            />

            {/* ── Drag handle ────────────────────────────────────────────── */}
            <div
                className="absolute top-1/2 flex items-center justify-center"
                style={{
                    left: `${position}%`,
                    transform: 'translate(-50%, -50%)',
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.12)',
                    backdropFilter: 'blur(14px)',
                    WebkitBackdropFilter: 'blur(14px)',
                    border: '2px solid rgba(255,255,255,0.55)',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.45)',
                    cursor: 'col-resize',
                    transition: dragging ? 'none' : 'box-shadow 0.2s',
                    pointerEvents: 'auto',
                    zIndex: 10,
                    ...(hovered || dragging ? { boxShadow: '0 4px 24px rgba(244,63,94,0.55), 0 0 0 4px rgba(244,63,94,0.18)' } : {}),
                }}
                onMouseDown={onMouseDown}
                onTouchStart={onTouchStart}
            >
                {/* Chevron arrows */}
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M7 5L2 10L7 15"  stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M13 5L18 10L13 15" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            </div>

            {/* ── "Before" glassmorphism label ───────────────────────────── */}
            <div
                className="absolute top-3 left-3 px-3 py-1 rounded-full"
                style={{
                    background: 'rgba(0,0,0,0.35)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255,255,255,0.18)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                    pointerEvents: 'none',
                    // fade out when slider is pushed far left
                    opacity: position > 10 ? 1 : 0,
                    transition: 'opacity 0.25s',
                }}
            >
                <span className="text-[11px] font-black uppercase tracking-widest text-white/90">
                    Before
                </span>
            </div>

            {/* ── "After" glassmorphism label ────────────────────────────── */}
            <div
                className="absolute top-3 right-3 px-3 py-1 rounded-full"
                style={{
                    background: 'rgba(244,63,94,0.25)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    border: '1px solid rgba(244,63,94,0.35)',
                    boxShadow: '0 2px 8px rgba(244,63,94,0.3)',
                    pointerEvents: 'none',
                    // fade out when slider is pushed far right
                    opacity: position < 90 ? 1 : 0,
                    transition: 'opacity 0.25s',
                }}
            >
                <span className="text-[11px] font-black uppercase tracking-widest text-white">
                    After
                </span>
            </div>
        </div>
    )
}
