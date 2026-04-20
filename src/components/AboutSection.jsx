import { useEffect, useRef, useState } from 'react'
import { Zap, Star, ShieldCheck, Sparkles } from 'lucide-react'

/* ── Stats counters REMOVED per user request ── */

const FEATURES = [
    {
        title: 'Photorealistic AI',
        desc: 'CatVTON neural network stitches garments onto your photo with sub-pixel accuracy — lighting, shadows, and fabric folds all preserved.',
        gradient: 'linear-gradient(135deg, #f43f5e 0%, #fb7185 100%)',
        glow: 'rgba(244,63,94,0.2)',
        glowBorder: 'rgba(244,63,94,0.2)',
        iconBg: 'rgba(244,63,94,0.12)',
        icon: Sparkles,
    },
    {
        title: 'Privacy First',
        desc: "Your photos never leave the server. Uploads are anonymized, processed locally, and deleted automatically after each session.",
        gradient: 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)',
        glow: 'rgba(139,92,246,0.2)',
        glowBorder: 'rgba(139,92,246,0.2)',
        iconBg: 'rgba(139,92,246,0.12)',
        icon: ShieldCheck,
    },
    {
        title: 'Works with Any Brand',
        desc: 'Any garment from any brand or store. Shirts, dresses, jackets, and coats — the AI handles them all with the same precision.',
        gradient: 'linear-gradient(135deg, #f59e0b 0%, #fb923c 100%)',
        glow: 'rgba(245,158,11,0.2)',
        glowBorder: 'rgba(245,158,11,0.2)',
        iconBg: 'rgba(245,158,11,0.1)',
        icon: Zap,
    },
    {
        title: 'Zero Setup Required',
        desc: 'No app to install, no account needed. Just upload two photos and get your AI-styled result in under 10 seconds.',
        gradient: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
        glow: 'rgba(16,185,129,0.2)',
        glowBorder: 'rgba(16,185,129,0.2)',
        iconBg: 'rgba(16,185,129,0.1)',
        icon: Star,
    },
]

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

function FeatureCard({ feat, index }) {
    const [ref, visible] = useScrollReveal(0.1)
    const [hovered, setHovered] = useState(false)
    const Icon = feat.icon

    return (
        <div
            ref={ref}
            className="animated-border relative overflow-hidden rounded-3xl p-7 cursor-default"
            style={{
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0)' : 'translateY(28px)',
                transition: `opacity 0.7s cubic-bezier(0.22,1,0.36,1) ${index * 100}ms,
                             transform 0.7s cubic-bezier(0.22,1,0.36,1) ${index * 100}ms`,
                background: hovered
                    ? `radial-gradient(ellipse at top left, ${feat.glow} 0%, rgba(255,255,255,0.03) 60%)`
                    : 'rgba(255,255,255,0.03)',
                border: `1px solid ${hovered ? feat.glowBorder : 'rgba(255,255,255,0.07)'}`,
                boxShadow: hovered ? `0 12px 48px ${feat.glow}` : '0 4px 24px rgba(0,0,0,0.3)',
            }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            {/* Glow blob on hover */}
            <div className="absolute -bottom-12 -right-12 w-48 h-48 rounded-full pointer-events-none transition-opacity duration-500"
                style={{
                    background: `radial-gradient(circle, ${feat.glow} 0%, transparent 70%)`,
                    opacity: hovered ? 1 : 0,
                }} />

            {/* Icon */}
            <div className="relative w-12 h-12 rounded-2xl flex items-center justify-center mb-5
                            group-hover:scale-110 transition-transform duration-300"
                style={{
                    background: feat.gradient,
                    boxShadow: hovered ? `0 0 24px ${feat.glow}` : 'none',
                }}>
                <Icon size={22} className="text-white" strokeWidth={1.8} />
            </div>

            <h3 className="font-semibold text-base mb-2.5 transition-colors duration-200"
                style={{ color: hovered ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.8)' }}>
                {feat.title}
            </h3>
            <p className="text-sm leading-relaxed text-white/35">{feat.desc}</p>
        </div>
    )
}

export default function AboutSection() {
    const [headerRef, headerVisible] = useScrollReveal(0.2)

    return (
        <section id="about" className="w-full py-16 sm:py-20">
            {/* Header */}
            <div
                ref={headerRef}
                className="text-center mb-14 transition-all duration-700"
                style={{ opacity: headerVisible ? 1 : 0, transform: headerVisible ? 'translateY(0)' : 'translateY(24px)' }}
            >
                <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest
                                px-3 py-1 rounded-full mb-4"
                    style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', color: '#fbbf24' }}>
                    <Sparkles size={11} />
                    About Outfit-Gen
                </span>
                <h2 className="font-display text-2xl sm:text-3xl text-white font-semibold mt-2">
                    Technology you can <span className="gradient-text italic">trust</span>
                </h2>
                <p className="text-white/35 text-sm mt-3 max-w-md mx-auto leading-relaxed">
                    Built on state-of-the-art generative AI, Outfit-Gen brings the fitting room to your screen.
                </p>
            </div>

            {/* Feature cards — 2-column responsive */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                {FEATURES.map((f, i) => <FeatureCard key={f.title} feat={f} index={i} />)}
            </div>
        </section>
    )
}
