import { useRef } from 'react'
import { Upload, X, ImageIcon } from 'lucide-react'

function useTilt(strength = 8) {
    const ref = useRef(null)
    const handleMove = (e) => {
        const el = ref.current
        if (!el) return
        const rect = el.getBoundingClientRect()
        const x = (e.clientX - rect.left - rect.width  / 2) / (rect.width  / 2)
        const y = (e.clientY - rect.top  - rect.height / 2) / (rect.height / 2)
        el.style.transform = `perspective(800px) rotateY(${x * strength}deg) rotateX(${-y * strength}deg) scale(1.02)`
    }
    const handleLeave = () => {
        if (ref.current) ref.current.style.transform = 'perspective(800px) rotateY(0deg) rotateX(0deg) scale(1)'
    }
    return { ref, handleMove, handleLeave }
}

export default function ImageUploadCard({ label, sublabel, icon, image, onUpload, onClear }) {
    const inputRef = useRef(null)
    const { ref: tiltRef, handleMove, handleLeave } = useTilt(6)

    const handleFileChange = (e) => {
        const file = e.target.files?.[0]
        if (!file) return
        const reader = new FileReader()
        reader.onload = (ev) => onUpload(ev.target.result)
        reader.readAsDataURL(file)
    }

    const handleDrop = (e) => {
        e.preventDefault()
        const file = e.dataTransfer.files?.[0]
        if (!file || !file.type.startsWith('image/')) return
        const reader = new FileReader()
        reader.onload = (ev) => onUpload(ev.target.result)
        reader.readAsDataURL(file)
    }

    return (
        <div className="flex flex-col gap-3 w-full">
            {/* Header */}
            <div className="flex items-center justify-between px-1">
                <div>
                    <h3 className="font-semibold text-white/90 text-base">{label}</h3>
                    <p className="text-white/35 text-sm mt-0.5">{sublabel}</p>
                </div>
                {image && (
                    <button
                        onClick={onClear}
                        className="flex items-center gap-1 text-xs text-white/30
                                   hover:text-rose-400 transition-colors duration-200"
                        aria-label="Remove image"
                    >
                        <X size={14} />
                        Remove
                    </button>
                )}
            </div>

            {/* Upload Zone with tilt */}
            <div
                ref={tiltRef}
                className={`upload-zone animated-border min-h-[280px] sm:min-h-[340px] glass tilt-card ${image ? 'has-image' : ''}`}
                style={{ transition: 'transform 0.2s ease-out, box-shadow 0.3s ease' }}
                onClick={() => !image && inputRef.current?.click()}
                onMouseMove={!image ? handleMove : undefined}
                onMouseLeave={!image ? handleLeave : undefined}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                role="button"
                tabIndex={image ? -1 : 0}
                onKeyDown={(e) => e.key === 'Enter' && !image && inputRef.current?.click()}
                aria-label={`Upload ${label}`}
            >
                {image ? (
                    /* Preview */
                    <div className="relative w-full h-full group">
                        <img
                            src={image}
                            alt={label}
                            className="image-preview w-full h-full object-cover rounded-2xl"
                        />
                        {/* Hover overlay */}
                        <div className="absolute inset-0 rounded-2xl bg-black/0 group-hover:bg-black/40
                                        transition-all duration-300 flex items-center justify-center">
                            <button
                                onClick={(e) => { e.stopPropagation(); inputRef.current?.click() }}
                                className="opacity-0 group-hover:opacity-100 transition-all duration-200
                                           scale-90 group-hover:scale-100
                                           glass text-white text-xs font-semibold
                                           px-4 py-2 rounded-full flex items-center gap-1.5 shadow-lg"
                            >
                                <Upload size={12} />
                                Change photo
                            </button>
                        </div>
                    </div>
                ) : (
                    /* Empty State */
                    <div className="flex flex-col items-center gap-4 p-8 text-center">
                        {/* Floating icon */}
                        <div className="upload-icon w-20 h-20 rounded-full flex items-center justify-center
                                        animate-float transition-all duration-300"
                             style={{ background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.15)' }}>
                            <span className="text-3xl">{icon}</span>
                        </div>

                        <div>
                            <p className="font-semibold text-white/80 text-sm">Drop your image here</p>
                            <p className="text-white/30 text-xs mt-1">or click to browse</p>
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="h-px w-12" style={{ background: 'rgba(255,255,255,0.08)' }} />
                            <ImageIcon size={12} className="text-white/20" />
                            <div className="h-px w-12" style={{ background: 'rgba(255,255,255,0.08)' }} />
                        </div>

                        <p className="text-xs text-white/20">JPG, PNG or WEBP • Max 10 MB</p>

                        <button
                            onClick={(e) => { e.stopPropagation(); inputRef.current?.click() }}
                            className="btn-secondary text-xs px-5 py-2"
                        >
                            <Upload size={12} />
                            Choose file
                        </button>
                    </div>
                )}

                <input
                    ref={inputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    aria-hidden="true"
                />
            </div>
        </div>
    )
}
