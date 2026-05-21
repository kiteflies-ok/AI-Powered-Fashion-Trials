import { useState, useCallback, useEffect, useRef } from 'react'
import Header from './components/Header'
import ImageUploadCard from './components/ImageUploadCard'
import TryOnButton from './components/TryOnButton'
import ResultDisplay from './components/ResultDisplay'
import HowItWorks from './components/HowItWorks'
import Footer from './components/Footer'
import AIStatus from './components/AIStatus'
import GallerySection from './components/GallerySection'
import AboutSection from './components/AboutSection'
import TransformationShowcase from './components/TransformationShowcase'

// ─── Cursor Glow ─────────────────────────────────────────────────────────────
function CursorGlow() {
    const glowRef = useRef(null)
    useEffect(() => {
        const el = glowRef.current
        if (!el) return
        const move = (e) => {
            el.style.left = `${e.clientX}px`
            el.style.top = `${e.clientY}px`
        }
        window.addEventListener('mousemove', move, { passive: true })
        return () => window.removeEventListener('mousemove', move)
    }, [])
    return <div ref={glowRef} className="cursor-glow" aria-hidden="true" />
}

const SAMPLE_PERSON_IMAGE = '/placeholder-person.png'
const SAMPLE_GARMENT_IMAGE = '/placeholder-garment.png'

// ─── Floating Particles ───────────────────────────────────────────────────────
const PARTICLES = Array.from({ length: 28 }, (_, i) => ({
    id: i,
    size: Math.random() * 3 + 1,
    left: Math.random() * 100,
    delay: Math.random() * 18,
    dur: Math.random() * 14 + 10,
    opacity: Math.random() * 0.4 + 0.1,
}))

function BackgroundVFX() {
    return (
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden" aria-hidden="true">
            {/* Gradient mesh */}
            <div className="bg-mesh" />
            {/* Noise overlay */}
            <div className="bg-noise" />
            {/* Animated blobs */}
            <div className="blob blob-1" />
            <div className="blob blob-2" />
            <div className="blob blob-3" />
            {/* Particles */}
            <div className="particles">
                {PARTICLES.map(p => (
                    <div
                        key={p.id}
                        className="particle"
                        style={{
                            width: `${p.size}px`,
                            height: `${p.size}px`,
                            left: `${p.left}%`,
                            animationDuration: `${p.dur}s`,
                            animationDelay: `${p.delay}s`,
                            opacity: p.opacity,
                        }}
                    />
                ))}
            </div>
        </div>
    )
}

export default function App() {
    const [personImage, setPersonImage] = useState(SAMPLE_PERSON_IMAGE)
    const [garmentImage, setGarmentImage] = useState(SAMPLE_GARMENT_IMAGE)
    const [result, setResult] = useState(null)
    const [loading, setLoading] = useState(false)
    const [mockProgress, setMockProgress] = useState(null)
    const [error, setError] = useState(null)
    const [aiStatus, setAiStatus] = useState({ status: 'initializing', progress: 0 })

    // Scroll-reveal observer
    useEffect(() => {
        const els = document.querySelectorAll('.reveal')
        const obs = new IntersectionObserver(
            (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible') }),
            { threshold: 0.08 }
        )
        els.forEach(el => obs.observe(el))
        return () => obs.disconnect()
    }, [])

    useEffect(() => {
        let interval
        const checkStatus = async () => {
            try {
                const res = await fetch('/api/health')
                const data = await res.json()
                setAiStatus(data)
                if (data.status === 'ready' || data.status === 'error') clearInterval(interval)
            } catch {
                setAiStatus({ status: 'error', error: 'Could not connect to AI Backend' })
                clearInterval(interval)
            }
        }
        checkStatus()
        interval = setInterval(checkStatus, 5000)
        return () => clearInterval(interval)
    }, [])

    const bothUploaded = personImage && garmentImage
    const isModelReady = import.meta.env.VITE_HF_API_URL ? true : aiStatus.status === 'ready'

    const convertToBase64 = (src) =>
        new Promise((resolve, reject) => {
            if (src.startsWith('data:')) return resolve(src)
            const img = new Image()
            img.crossOrigin = 'anonymous'
            img.onload = () => {
                const c = document.createElement('canvas')
                c.width = img.naturalWidth
                c.height = img.naturalHeight
                c.getContext('2d').drawImage(img, 0, 0)
                resolve(c.toDataURL('image/png'))
            }
            img.onerror = () => reject(new Error('Image load failed'))
            img.src = src
        })

    const dataURLtoBlob = (dataurl) => {
        const [head, b64] = dataurl.split(',')
        const mime = head.match(/:(.*?);/)[1]
        const bstr = atob(b64)
        const u8 = new Uint8Array(bstr.length)
        for (let n = bstr.length; n--;) u8[n] = bstr.charCodeAt(n)
        return new Blob([u8], { type: mime })
    }

    const handleTryOn = useCallback(async () => {
        if (!bothUploaded || !isModelReady) return
        setLoading(true); setResult(null); setError(null)
        try {
            if (personImage === SAMPLE_PERSON_IMAGE && garmentImage === SAMPLE_GARMENT_IMAGE) {
                // --- MOCK INFERENCE FOR DEFAULT IMAGES ---
                setMockProgress(0);
                for (let i = 1; i <= 100; i++) {
                    setMockProgress(i);
                    await new Promise(r => setTimeout(r, 60)); // 6 seconds total
                }
                await new Promise(r => setTimeout(r, 300)); // Wait for 100% to visually render
                
                setResult({  
                    image: '/gallery/after1.jpg', 
                    label: 'AI Result', 
                    meta: { 
                        processing_time_s: 6.0, 
                        device: 'cpu', 
                        resolution: '512x768', 
                        steps: 20, 
                        guidance_scale: 2.5, 
                        mask_type: 'overall', 
                        confidence: 0.95 
                    } 
                })
                setMockProgress(null)
                return;
            }

            // --- REAL INFERENCE FOR CUSTOM UPLOADS ---
            const [pb64, gb64] = await Promise.all([
                convertToBase64(personImage),
                convertToBase64(garmentImage),
            ])
            const formData = new FormData()
            formData.append('person_image', dataURLtoBlob(pb64), 'person.png')
            formData.append('cloth_image',  dataURLtoBlob(gb64), 'cloth.png')

            const res = await fetch('/api/try-on', { method: 'POST', body: formData })
            const data = await res.json().catch(() => ({}))

            if (!res.ok || data.error) {
                const msg = data.details || data.error || `HTTP ${res.status}`
                setError(msg)
                return
            }

            if (!data.resultUrl) {
                setError('Backend returned success but no result URL was provided.')
                return
            }

            setResult({ image: data.resultUrl, label: 'AI Result', meta: data.meta || null })
        } catch (err) {
            console.error('[Try-On] Network error:', err)
            setError(`Network error: ${err.message || 'Could not reach the backend.'}`)
        } finally {
            setLoading(false)
        }
    }, [bothUploaded, isModelReady, personImage, garmentImage])

    const handleRetry = () => { setError(null); setResult(null) }

    const handleTryOnWithScroll = async () => {
        // Scroll to result section first so it's in view while loading
        document.getElementById('result-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        await handleTryOn()
    }

    return (
        <div className="relative min-h-screen flex flex-col">
            <BackgroundVFX />
            <CursorGlow />

            {/* All content sits above VFX layer */}
            <div className="relative z-10 flex flex-col min-h-screen">
                <Header />

                <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-10 sm:py-14 space-y-10">

                    {/* ── Hero ── */}
                    <section className="text-center flex flex-col items-center gap-4 animate-slide-up pt-4">
                        {/* Badge — sits clearly above the heading */}
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full
                                        text-xs font-bold uppercase tracking-widest
                                        bg-rose-500/10 text-rose-400 border border-rose-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
                            AI-Powered Fashion
                        </div>
                        {/* Heading — outer layer holds organic blob glow, inner wrapper for layout */}
                        <div className="hero-title-outer relative">
                            {/* Organic morphing blob / Eclipse behind everything */}
                            <div className="hero-organic-blob" aria-hidden="true" />
                            <div className="eclipse-glow" aria-hidden="true" />
                            
                            {/* Rocket Thrust Effect */}
                            <div className="rocket-thrust-wrap" aria-hidden="true">
                                <div className="rocket-flame-outer" />
                                <div className="rocket-flame-inner" />
                                <div className="rocket-glare" />
                                <div className="rocket-shockwave" />
                                <div className="rocket-trail" />
                                <div className="rocket-particles">
                                    {[...Array(36)].map((_, i) => (
                                        <div key={i} className="rocket-particle" style={{ 
                                            '--d': `${Math.random() * 1.5}s`,
                                            '--l': `${Math.random() * 100}%`,
                                            '--s': `${Math.random() * 4 + 1}px`,
                                            '--z': `${Math.random() * 60 - 30}px`
                                        }} />
                                    ))}
                                </div>
                            </div>
                            
                            {/* Text container */}
                            <div className="hero-heading-wrap relative z-10 flex items-center justify-center">
                                <h1 className="font-sans text-7xl sm:text-9xl font-black leading-none tracking-tighter text-power-shake">
                                    <span className="text-white drop-shadow-2xl">Outfit</span>
                                    <span className="animated-text animated-glow">-Gen</span>
                                </h1>
                            </div>
                        </div>
                        {/* Subtitle statement - immediate visibility with high-end entry */}
                        <div className="subtitle-box-wrap subtitle-animate-entry" style={{ animationDelay: '800ms' }}>
                            <div className="subtitle-glass-underlay" />
                            <p className="subtitle-content text-white/85 text-base sm:text-lg max-w-xl mx-auto leading-relaxed relative z-10 font-medium">
                                Upload your photo and any garment. Our AI will show you exactly how
                                the outfit looks on <span className="text-glow-white font-black italic">you</span> — in seconds.
                            </p>
                        </div>
                    </section>

                    <AIStatus statusData={aiStatus} />

                    {/* ── Upload Section ── */}
                    <section id="upload-section" className="reveal" style={{ animationDelay: '0ms' }}>
                        <div className="flex items-center gap-3 mb-7">
                            <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.07)' }} />
                            <span className="badge text-white/60 text-[10px]"
                                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}>
                                Step 1 &amp; 2
                            </span>
                            <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.07)' }} />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-start">
                            <ImageUploadCard
                                label="Your Photo"
                                sublabel="Full-body photo recommended"
                                icon="🤳"
                                image={personImage}
                                onUpload={setPersonImage}
                                onClear={() => { setPersonImage(null); setResult(null) }}
                            />
                            <ImageUploadCard
                                label="Garment Photo"
                                sublabel="Any clothing item from any store"
                                icon="👗"
                                image={garmentImage}
                                onUpload={setGarmentImage}
                                onClear={() => { setGarmentImage(null); setResult(null) }}
                            />
                        </div>

                        <div className="flex justify-center mt-9">
                            <TryOnButton
                                onClick={handleTryOnWithScroll}
                                disabled={!bothUploaded || !isModelReady}
                                loading={loading}
                            />
                        </div>

                        {!isModelReady && aiStatus.status !== 'error' && (
                            <p className="text-center text-[10px] text-white/25 mt-4 animate-pulse
                                          uppercase tracking-[0.2em] font-bold">
                                Button unlocks once AI Core is ready
                            </p>
                        )}
                    </section>

                    {/* ── Result ── */}
                    {/* NOTE: No 'reveal' wrapper — result must be always visible after inference */}
                    <div className="max-w-lg mx-auto w-full" id="result-anchor">
                        <ResultDisplay result={result} loading={loading} error={error} onRetry={handleRetry} mockProgress={mockProgress} />
                    </div>

                    {/* ── Transformation Showcase ── */}
                    <div className="section-divider" />
                    <div className="reveal"><TransformationShowcase /></div>

                    {/* ── How It Works ── */}
                    <div className="section-divider" />
                    <div className="reveal"><HowItWorks /></div>

                    {/* ── Gallery ── */}
                    <div className="section-divider" />
                    <div className="reveal"><GallerySection /></div>

                    {/* ── About ── */}
                    <div className="section-divider" />
                    <div className="reveal"><AboutSection /></div>

                </main>
                <Footer />
            </div>
        </div>
    )
}
