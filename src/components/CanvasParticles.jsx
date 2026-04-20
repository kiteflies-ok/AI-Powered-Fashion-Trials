import { useEffect, useRef } from 'react'

/**
 * CanvasParticles
 * A canvas-based constellation particle system.
 * Mounted directly in main.jsx — zero changes to App.jsx or any existing component.
 *
 * Particles drift upward gently and connect with thin lines when close,
 * creating a living starfield / neural-net feel.
 */
export default function CanvasParticles() {
    const canvasRef = useRef(null)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx    = canvas.getContext('2d')
        let raf      = null
        let W        = window.innerWidth
        let H        = window.innerHeight

        // Config
        const COUNT         = 55     // number of particles
        const CONNECT_DIST  = 140    // px — max distance to draw connections
        const SPEED         = 0.28   // base drift speed
        const MIN_SIZE      = 0.8
        const MAX_SIZE      = 2.2

        // Colors — rose / violet / sky
        const COLORS = [
            'rgba(244,63,94,',   // rose
            'rgba(167,139,250,', // violet
            'rgba(56,189,248,',  // sky
            'rgba(255,255,255,', // white
        ]

        // Particle factory
        const makeParticle = () => ({
            x:    Math.random() * W,
            y:    Math.random() * H,
            r:    MIN_SIZE + Math.random() * (MAX_SIZE - MIN_SIZE),
            vx:   (Math.random() - 0.5) * SPEED,
            vy:   -(Math.random() * SPEED * 0.6 + SPEED * 0.2),
            col:  COLORS[Math.floor(Math.random() * COLORS.length)],
            life: Math.random(),      // 0-1 phase offset for pulsing opacity
            speed: 0.003 + Math.random() * 0.004,
        })

        let particles = Array.from({ length: COUNT }, makeParticle)

        // Resize handler
        const resize = () => {
            W = window.innerWidth
            H = window.innerHeight
            canvas.width  = W
            canvas.height = H
        }
        resize()
        window.addEventListener('resize', resize, { passive: true })

        // Main render loop
        const draw = () => {
            ctx.clearRect(0, 0, W, H)

            // Update + draw particles
            for (let i = 0; i < particles.length; i++) {
                const p = particles[i]
                p.x    += p.vx
                p.y    += p.vy
                p.life += p.speed

                // Wrap at edges
                if (p.x < -10) p.x = W + 10
                if (p.x > W + 10) p.x = -10
                if (p.y < -10) {
                    p.x    = Math.random() * W
                    p.y    = H + 10
                    p.life = Math.random()
                }

                // Pulsing opacity: sin wave between 0.3 and 1.0
                const alpha = 0.3 + 0.7 * Math.abs(Math.sin(p.life * Math.PI))

                // Draw circle
                ctx.beginPath()
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
                ctx.fillStyle = `${p.col}${alpha.toFixed(2)})`
                ctx.fill()

                // Draw connections to nearby particles
                for (let j = i + 1; j < particles.length; j++) {
                    const q  = particles[j]
                    const dx = p.x - q.x
                    const dy = p.y - q.y
                    const d  = Math.sqrt(dx * dx + dy * dy)
                    if (d < CONNECT_DIST) {
                        const lineAlpha = (1 - d / CONNECT_DIST) * 0.18
                        ctx.beginPath()
                        ctx.moveTo(p.x, p.y)
                        ctx.lineTo(q.x, q.y)
                        ctx.strokeStyle = `rgba(255,255,255,${lineAlpha.toFixed(3)})`
                        ctx.lineWidth   = 0.8
                        ctx.stroke()
                    }
                }
            }

            raf = requestAnimationFrame(draw)
        }

        draw()

        return () => {
            cancelAnimationFrame(raf)
            window.removeEventListener('resize', resize)
        }
    }, [])

    return (
        <canvas
            ref={canvasRef}
            id="vfx-canvas"
            className="fixed inset-0 pointer-events-none -z-10"
            style={{ width: '100vw', height: '100vh', display: 'block' }}
            aria-hidden="true"
        />
    )
}
