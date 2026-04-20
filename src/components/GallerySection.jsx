import { useState, useEffect, useRef } from 'react'
import { Sparkles } from 'lucide-react'
import BeforeAfterSlider from './BeforeAfterSlider'



function useScrollReveal(threshold = 0.1) {
    const ref = useRef(null)
    const [visible, setVisible] = useState(false)
    useEffect(() => {
        const el = ref.current
        if (!el) return
        const obs = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect() } },
            { threshold }
        )
        obs.observe(el)
        return () => obs.disconnect()
    }, [threshold])
    return [ref, visible]
}



export default function GallerySection() {
    const [headerRef, headerVisible] = useScrollReveal(0.2)

    return (
        <section id="gallery" className="w-full py-16 sm:py-20">
            <div
                ref={headerRef}
                className="text-center mb-12 transition-all duration-700"
                style={{ opacity: headerVisible ? 1 : 0, transform: headerVisible ? 'translateY(0)' : 'translateY(24px)' }}
            >
                <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest
                                px-3 py-1 rounded-full mb-4"
                    style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)', color: '#a78bfa' }}>
                    <Sparkles size={11} />
                    Transformations
                </span>
                <h2 className="font-display text-2xl sm:text-3xl text-white font-semibold mt-2">
                    Real <span className="gradient-text italic">results</span>
                </h2>
                <p className="text-white/50 text-sm mt-3 max-w-sm mx-auto leading-relaxed">
                    Drag the slider to compare.
                </p>
            </div>

            {/* ── Featured Before/After Slider ── */}
            <div className="max-w-sm mx-auto mb-14">
                <BeforeAfterSlider
                    beforeSrc="/gallery/before1.jpg"
                    afterSrc="/gallery/after1.jpg"
                    beforeAlt="Model before AI outfit"
                    afterAlt="Model after AI outfit"
                    defaultPosition={50}
                    className="aspect-[3/4] w-full"
                />
                <div className="playful-instruction text-center mt-4">
                    <span className="text-[13px] font-black uppercase tracking-[0.3em] inline-flex items-center gap-3">
                        <span className="arrow-bounce-left text-rose-500">←</span>
                        <span className="gradient-text-playful">Drag to compare</span>
                        <span className="arrow-bounce-right text-rose-500">→</span>
                    </span>
                </div>
            </div>

            {/* ── Reserved space for future content ── */}
            <div id="gallery-content-slot" className="min-h-[80px]" />
        </section>
    )
}
