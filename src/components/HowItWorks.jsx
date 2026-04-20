import { useEffect, useRef, useState } from 'react'
import { Upload, Shirt, Sparkles, Image } from 'lucide-react'

const STEPS = [
    {
        step: '01',
        icon: Upload,
        title: 'Upload Your Photo',
        desc: 'Use a clear, full-body photo against a plain background for best results.',
        gradient: 'from-rose-500 to-pink-400',
        glow: 'rgba(244,63,94,0.25)',
        accent: 'rgba(244,63,94,0.12)',
        accentBorder: 'rgba(244,63,94,0.2)',
    },
    {
        step: '02',
        icon: Shirt,
        title: 'Select a Garment',
        desc: 'Upload any clothing item — a shirt, dress, or jacket — from any store.',
        gradient: 'from-violet-500 to-violet-400',
        glow: 'rgba(139,92,246,0.25)',
        accent: 'rgba(139,92,246,0.12)',
        accentBorder: 'rgba(139,92,246,0.2)',
    },
    {
        step: '03',
        icon: Sparkles,
        title: 'Generate Your Look',
        desc: 'Our AI instantly blends the garment onto your photo with photorealistic accuracy.',
        gradient: 'from-amber-500 to-orange-400',
        glow: 'rgba(245,158,11,0.25)',
        accent: 'rgba(245,158,11,0.1)',
        accentBorder: 'rgba(245,158,11,0.2)',
    },
    {
        step: '04',
        icon: Image,
        title: 'View the Result',
        desc: 'Download your styled photo or share it directly from the app.',
        gradient: 'from-emerald-500 to-teal-400',
        glow: 'rgba(16,185,129,0.25)',
        accent: 'rgba(16,185,129,0.1)',
        accentBorder: 'rgba(16,185,129,0.2)',
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

function StepCard({ item, index }) {
    const [ref, visible] = useScrollReveal(0.05)
    const [hovered, setHovered] = useState(false)
    const Icon = item.icon

    return (
        <div
            ref={ref}
            className="animated-border relative flex flex-col gap-5 p-6 rounded-3xl group cursor-default overflow-hidden"
            style={{
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0)' : 'translateY(32px)',
                transition: `opacity 0.7s cubic-bezier(0.22,1,0.36,1) ${index * 120}ms,
                             transform 0.7s cubic-bezier(0.22,1,0.36,1) ${index * 120}ms`,
                background: hovered ? item.accent : 'rgba(255,255,255,0.03)',
                border: `1px solid ${hovered ? item.accentBorder : 'rgba(255,255,255,0.07)'}`,
                boxShadow: hovered ? `0 8px 40px ${item.glow}` : '0 4px 24px rgba(0,0,0,0.3)',
            }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            {/* Subtle background gradient on hover */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"
                 style={{ background: `radial-gradient(ellipse at top left, ${item.glow} 0%, transparent 60%)` }} />

            {/* Step number watermark */}
            <span className="absolute top-5 right-5 font-display text-5xl font-semibold select-none transition-colors duration-300"
                  style={{ color: 'rgba(255,255,255,0.05)' }}>
                {item.step}
            </span>

            {/* Icon */}
            <div className={`relative z-10 w-12 h-12 rounded-2xl bg-gradient-to-br ${item.gradient}
                            flex items-center justify-center shadow-lg
                            group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}
                 style={{ boxShadow: hovered ? `0 0 24px ${item.glow}` : 'none' }}>
                <Icon size={22} className="text-white" strokeWidth={1.8} />
            </div>

            {/* Badge */}
            <span className="relative z-10 inline-flex self-start items-center gap-1 text-[10px] font-bold
                             uppercase tracking-widest px-2.5 py-1 rounded-full"
                  style={{ background: item.accent, border: `1px solid ${item.accentBorder}`, color: 'rgba(255,255,255,0.6)' }}>
                Step {item.step}
            </span>

            <div className="relative z-10">
                <h3 className="font-semibold text-white/85 text-base mb-1.5 group-hover:text-white transition-colors duration-200">
                    {item.title}
                </h3>
                <p className="text-white/35 text-sm leading-relaxed">{item.desc}</p>
            </div>

            {/* Bottom accent on hover */}
            <div className={`absolute bottom-0 left-6 right-6 h-px rounded-full bg-gradient-to-r ${item.gradient}
                            scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left`} />
        </div>
    )
}

export default function HowItWorks() {
    const [headerRef, headerVisible] = useScrollReveal(0.2)

    return (
        <section id="how-it-works" className="w-full py-16 sm:py-20">
            <div
                ref={headerRef}
                className="text-center mb-12 transition-all duration-700"
                style={{ opacity: headerVisible ? 1 : 0, transform: headerVisible ? 'translateY(0)' : 'translateY(24px)' }}
            >
                <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest
                                px-3 py-1 rounded-full mb-4"
                      style={{ background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.2)', color: '#fb7185' }}>
                    <Sparkles size={11} />
                    Simple Process
                </span>
                <h2 className="font-display text-2xl sm:text-3xl text-white font-semibold mt-2">
                    How it <span className="gradient-text italic">works</span>
                </h2>
                <p className="text-white/35 text-sm mt-3 max-w-sm mx-auto leading-relaxed">
                    Four effortless steps from photo to a perfectly styled look
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                {STEPS.map((item, i) => <StepCard key={item.step} item={item} index={i} />)}
            </div>
        </section>
    )
}
