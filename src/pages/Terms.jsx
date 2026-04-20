import React from 'react';

const Section = ({ title, children }) => (
    <div className="mb-10 reveal visible">
        <h3 className="text-xl font-bold border-l-4 border-indigo-500 pl-4 mb-4 text-white/90">{title}</h3>
        <div className="text-white/60 leading-relaxed">
            {children}
        </div>
    </div>
);

export default function Terms() {
    return (
        <div className="max-w-4xl mx-auto px-6 py-20 relative z-10">
            <div className="text-center mb-16">
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-4">
                    Usage Agreement
                </span>
                <h1 className="text-5xl sm:text-7xl font-black text-white mb-6">Terms of Service</h1>
                <p className="text-white/40 max-w-xl mx-auto italic">
                    By using OutfitGen, you agree to the ethical use of AI.
                </p>
            </div>

            <div className="glass p-8 sm:p-12 rounded-[2.5rem] border border-white/5 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-500/5 blur-[100px] -z-10" />

                <Section title="1. Acceptance of Terms">
                    By accessing and using OutfitGen, you signify your agreement to these Terms of Service. If you do not agree, please do not use our AI simulation tools.
                </Section>

                <Section title="2. Use of Service">
                    You may use our virtual try-on technology for personal, non-commercial purposes only. You are prohibited from uploading offensive, illegal, or copyrighted material without permission.
                </Section>

                <Section title="3. AI Limitations Disclaimer">
                    OutfitGen uses generative AI to simulate clothing fit. You acknowledge that simulations are "expected estimations" and may not be 100% accurate to real-world physics or color matching.
                </Section>

                <Section title="4. User Responsibilities">
                    Users are responsible for ensuring the quality of their uploaded images. High-quality inputs yield higher quality AI outputs. You agree not to exploit the system for deepfake creation.
                </Section>

                <Section title="5. Intellectual Property">
                    The AI algorithms, design, and branding of OutfitGen are the sole property of the development team. Generated results are provided to the user for personal visualization.
                </Section>

                <Section title="6. Limitation of Liability">
                    OutfitGen is provided "as is". We are not liable for any fashion decisions made based on AI simulations, nor or we liable for any technical failures during processing.
                </Section>
            </div>
        </div>
    );
}
