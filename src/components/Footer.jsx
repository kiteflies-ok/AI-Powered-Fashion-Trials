import { Link } from 'react-router-dom'

export default function Footer() {
    return (
        <footer className="w-full mt-20" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10
                            flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg flex items-center justify-center"
                        style={{ background: 'linear-gradient(135deg, #f43f5e, #9f1239)' }}>
                        <span style={{ fontSize: '11px' }}>⚡</span>
                    </div>
                    <span className="font-sans text-white/50 text-sm font-bold tracking-tight">
                        Outfit<span className="text-rose-500">-Gen</span>
                    </span>
                </div>
                <p className="text-xs text-white/20 text-center">
                    © 2026 Outfit-Gen — Powered by Generative AI
                </p>
                <div className="flex gap-5">
                    {[
                        { name: 'Privacy', path: '/privacy' },
                        { name: 'Terms', path: '/terms' },
                        { name: 'Contact', path: '/contact' }
                    ].map((link) => (
                        <Link key={link.name} to={link.path}
                            className="text-xs text-white/20 hover:text-white/60 transition-colors duration-200">
                            {link.name}
                        </Link>
                    ))}
                </div>
            </div>
        </footer>
    )
}
