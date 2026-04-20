import React from 'react';

const Section = ({ title, children }) => (
    <div className="mb-10 reveal visible">
        <h3 className="text-xl font-bold border-l-4 border-rose-500 pl-4 mb-4 text-white/90">{title}</h3>
        <div className="text-white/60 leading-relaxed space-y-4">
            {children}
        </div>
    </div>
);

export default function Privacy() {
    return (
        <div className="max-w-4xl mx-auto px-6 py-20 relative z-10">
            <div className="text-center mb-16">
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-rose-500/10 text-rose-400 border border-rose-500/20 mb-4">
                    Security FIRST
                </span>
                <h1 className="text-4xl sm:text-6xl font-black text-white mb-6">Privacy Policy</h1>
                <p className="text-white/40 max-w-xl mx-auto italic">
                    Effective Date: April 17, 2026. Your privacy is protected by the edge of our AI.
                </p>
            </div>

            <div className="glass p-8 sm:p-12 rounded-[2.5rem] border border-white/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/5 blur-[100px] -z-10" />
                
                <Section title="1. Introduction">
                    Welcome to OutfitGen. This Privacy Policy describes how we handle the images and data you provide when using our virtual try-on services. We are committed to transparency in our AI processing.
                </Section>

                <Section title="2. Data Collection">
                    We collect two types of information:
                    <ul className="list-disc pl-5 mt-2 space-y-2">
                        <li><strong>Input Images:</strong> Photos of yourself and garment items you upload for try-on simulation.</li>
                        <li><strong>Usage Data:</strong> Anonymous technical data like browser type and processing time to improve our AI models.</li>
                    </ul>
                </Section>

                <Section title="3. How We Use Data">
                    Your images are used <strong>exclusively</strong> for performing the AI virtual try-on inference. We do not use your personal photos for marketing, nor do we sell your data to third parties.
                </Section>

                <Section title="4. Data Security">
                    All image processing occurs in secure environments. We use SSL encryption for all data transfers between your device and our processing cores.
                </Section>

                <Section title="5. User Rights">
                    You have the right to request information about how your data is handled. Since we do not store personal images permanently, they are deleted automatically after your session ends.
                </Section>

                <Section title="6. Disclaimer">
                    <strong>Important:</strong> OutfitGen does not store your uploaded images on long-term storage. Once the processing is complete and you leave the session, the temporary inference files are purged from our RAM and cache. 
                </Section>
            </div>
        </div>
    );
}
