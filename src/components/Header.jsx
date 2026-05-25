import { Sparkles, Wand2 } from 'lucide-react'
import { Link } from 'react-router-dom'

const NAV = [
    { label: 'How it works', href: '/#how-it-works' },
    { label: 'Gallery',      href: '/#gallery'      },
    { label: 'About',        href: '/#about'        },
]

export default function Header() {
    return (
        <header className="w-full sticky top-0 z-50"
                style={{ background: 'rgba(10,10,15,0.7)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">

                {/* Logo */}
                <Link to="/" className="flex items-center gap-2.5 group">
                    <div className="w-9 h-9 flex items-center justify-center transition-all duration-300 group-hover:scale-110">
                        <img src="/favicon.svg" alt="Outfit-Gen Logo" className="w-full h-full object-contain" />
                    </div>
                    <span className="font-sans text-white font-bold text-xl leading-none tracking-tight">
                        Outfit<span className="gradient-text">-Gen</span>
                    </span>
                </Link>

                {/* Nav */}
                <nav className="hidden sm:flex items-center gap-7">
                    {NAV.map((item) => (
                        <a
                            key={item.label}
                            href={item.href}
                            className="relative text-sm text-white/60 hover:text-white/90
                                       font-medium transition-colors duration-200 group"
                        >
                            {item.label}
                            <span className="absolute -bottom-0.5 left-0 w-0 h-px
                                             group-hover:w-full transition-all duration-300"
                                  style={{ background: 'linear-gradient(90deg, #f43f5e, transparent)' }} />
                        </a>
                    ))}
                </nav>

                {/* CTA */}
                <a
                    href="#upload-section"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold
                               px-4 py-2 rounded-full text-white cursor-pointer
                               transition-all duration-200 hover:scale-105"
                    style={{
                        background: 'linear-gradient(135deg, #f43f5e, #e11d48)',
                        boxShadow: '0 0 20px rgba(244,63,94,0.3)',
                    }}
                >
                    <Sparkles size={11} />
                    Try it free
                </a>

            </div>
        </header>
    )
}
