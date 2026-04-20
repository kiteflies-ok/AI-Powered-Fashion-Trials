import React, { useState } from 'react';
import { Send, CheckCircle } from 'lucide-react';

export default function Contact() {
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setSubmitted(true);
    };

    return (
        <div className="max-w-4xl mx-auto px-6 py-20 relative z-10">
            <div className="text-center mb-16">
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-rose-500/10 text-rose-400 border border-rose-500/20 mb-4">
                    Get in touch
                </span>
                <h1 className="text-5xl sm:text-7xl font-black text-white mb-6">Contact Us</h1>
                <p className="text-white/40 max-w-xl mx-auto">
                    Have questions about our AI technology? We're here to help.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="glass p-8 sm:p-10 rounded-[2.5rem] border border-white/5 space-y-8">
                    <div>
                        <h3 className="text-xl font-bold text-white mb-2">Office Hours</h3>
                        <p className="text-white/40 text-sm">Monday – Friday: 9AM – 6PM EST</p>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white mb-2">Direct Email</h3>
                        <p className="text-rose-400 font-medium">support@outfitgen.ai</p>
                    </div>
                    <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
                        <p className="text-white/60 text-xs italic leading-relaxed">
                            "We aim to respond to all inquiries within 24 hours. Our AI support bot is also available for instant technical guidance."
                        </p>
                    </div>
                </div>

                <div className="glass p-8 sm:p-10 rounded-[2.5rem] border border-white/5 relative">
                    {submitted ? (
                        <div className="h-full flex flex-col items-center justify-center text-center animate-fade-in">
                            <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6">
                                <CheckCircle className="text-emerald-500" size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Message Received</h3>
                            <p className="text-white/40 text-sm">We'll get back to you within 24 hours.</p>
                            <button 
                                onClick={() => setSubmitted(false)}
                                className="mt-8 text-rose-400 text-xs font-bold uppercase tracking-widest hover:text-rose-300 transition-colors"
                            >
                                Send another message
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase font-bold text-white/30 ml-1">Name</label>
                                <input 
                                    required
                                    type="text" 
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-rose-500/50 transition-all"
                                    placeholder="Enter your name"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase font-bold text-white/30 ml-1">Email</label>
                                <input 
                                    required
                                    type="email" 
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-rose-500/50 transition-all"
                                    placeholder="your@email.com"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase font-bold text-white/30 ml-1">Message</label>
                                <textarea 
                                    required
                                    rows="4"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-rose-500/50 transition-all"
                                    placeholder="How can we help?"
                                ></textarea>
                            </div>
                            <button className="btn-primary w-full group">
                                <span>Send Message</span>
                                <Send className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" size={16} />
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
