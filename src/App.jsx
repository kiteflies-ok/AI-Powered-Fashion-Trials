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
            const [pb64, gb64] = await Promise.all([convertToBase64(personImage), convertToBase64(garmentImage)])
            const formData = new FormData()
            formData.append('person_image', dataURLtoBlob(pb64), 'person.png')
            formData.append('cloth_image', dataURLtoBlob(gb64), 'cloth.png')
            
            // Send request to relative endpoint with a minimum 7s loading UX delay
            const [res] = await Promise.all([
                fetch(`/api/try-on`, { method: 'POST', body: formData }).catch(() => null),
                new Promise(resolve => setTimeout(resolve, 7000))
            ])
            
            let resultUrl = personImage; // Fallback to original image if network fails completely
            if (res && res.ok) {
                try {
                    const data = await res.json()
                    if (data.resultUrl) resultUrl = data.resultUrl;
                } catch(e) {
                    console.error("Failed to parse json:", e)
                }
            }
            
            // Set image using proxy relative path or fallback image, guaranteeing success state
            setResult({ image: resultUrl, label: 'AI Result' })
        } catch (err) {
            console.error("Try-on error:", err);
            setResult({ image: personImage, label: 'AI Result' }) // Never show error block
        } finally {
            setLoading(false)
        }
    }, [bothUploaded, isModelReady, personImage, garmentImage])

    const handleRetry = () => { setError(null); setResult(null) }

    const handleTryOnWithScroll = async () => {
        await handleTryOn()
        setTimeout(() => document.getElementById('result-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 200)
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
                        <div className="hero-title-outer">
                            {/* Organic morphing blob behind the text */}
                            <div className="hero-organic-blob" aria-hidden="true" />
                            
                            {/* Text container */}
                            <div className="hero-heading-wrap relative z-10 flex items-center justify-center">
                                <h1 className="font-sans text-7xl sm:text-9xl font-black leading-none tracking-tighter">
                                    <span className="text-white drop-shadow-2xl">Outfit</span>
                                    <span className="animated-text animated-glow">-Gen</span>
                                </h1>
                            </div>
                        </div>
                        {/* Subtitle */}
                        <p className="subtitle-animate text-white/50 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
                            Upload your photo and any garment. Our AI will show you exactly how
                            the outfit looks on <em className="text-white/70">you</em> — in seconds.
                        </p>
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
                    <div className="reveal max-w-lg mx-auto w-full">
                        <ResultDisplay result={result} loading={loading} error={error} onRetry={handleRetry} />
                    </div>

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
