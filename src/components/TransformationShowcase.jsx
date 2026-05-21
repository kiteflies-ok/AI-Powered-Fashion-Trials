import { useState, useEffect } from 'react'
import BeforeAfterSlider from './BeforeAfterSlider'

export default function TransformationShowcase() {
    return (
        <section className="w-full py-10 sm:py-16">
            <div className="text-center mb-10">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest
                                px-3 py-1 rounded-full mb-4"
                    style={{ background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.2)', color: '#38bdf8' }}>
                    <span className="text-lg">✨</span> Real Results
                </span>
                <h2 className="font-display text-3xl sm:text-5xl text-white font-semibold mt-2">
                    Instant <span className="gradient-text italic">Transformations</span>
                </h2>
                <p className="text-white/50 text-base mt-4 max-w-lg mx-auto leading-relaxed">
                    Slide to see the AI magic in action. Watch how seamlessly the garment wraps to the model's exact pose and lighting.
                </p>
            </div>

            <div className="flex justify-center max-w-4xl mx-auto px-4">
                <div className="flex flex-col items-center gap-5 w-full sm:w-4/5 md:w-2/3 group">
                    <BeforeAfterSlider 
                        beforeSrc="/gallery/before1.jpg"
                        afterSrc="/gallery/after1.jpg"
                        beforeAlt="Original Photo"
                        afterAlt="AI Try-On Result"
                        className="w-full aspect-[3/4] shadow-2xl shadow-black/50"
                    />
                    <div className="glass px-6 py-2 rounded-full border border-white/5 bg-white/[0.02] backdrop-blur-md">
                        <p className="text-white/60 text-xs font-bold uppercase tracking-widest">Street Casual Try-On</p>
                    </div>
                </div>
            </div>
        </section>
    )
}
