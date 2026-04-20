"use client";

import Image from "next/image";
import { Download, RefreshCw, Share2 } from "lucide-react";

interface ResultViewerProps {
  resultUrl: string;
  onReset: () => void;
}

export default function ResultViewer({ resultUrl, onReset }: ResultViewerProps) {
  const handleDownload = async () => {
    const response = await fetch(resultUrl);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "vton-result.png";
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden p-8 space-y-8 animate-in fade-in zoom-in duration-500">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Result Ready!</h2>
          <p className="text-slate-400">The AI has generated your virtual try-on.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleDownload}
            className="p-4 bg-slate-800 hover:bg-slate-700 rounded-2xl transition-colors text-white"
          >
            <Download className="w-5 h-5" />
          </button>
          <button 
            onClick={onReset}
            className="px-6 py-4 bg-indigo-600 hover:bg-indigo-500 rounded-2xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-indigo-600/20 text-white"
          >
            <RefreshCw className="w-5 h-5" />
            Try Another
          </button>
        </div>
      </div>

      <div className="relative aspect-[3/4] max-w-md mx-auto rounded-2xl overflow-hidden border-4 border-slate-800 shadow-2xl">
        <Image src={resultUrl} alt="Try-on Result" fill className="object-cover" unoptimized />
      </div>

      <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
        <button className="py-3 bg-slate-800/50 hover:bg-indigo-500/20 hover:text-indigo-300 rounded-xl text-sm font-semibold transition-all border border-slate-700 flex items-center justify-center gap-2">
          <Share2 className="w-4 h-4" />
          Share result
        </button>
        <button className="py-3 bg-slate-800/50 hover:bg-indigo-500/20 hover:text-indigo-300 rounded-xl text-sm font-semibold transition-all border border-slate-700 flex items-center justify-center gap-2">
          <Download className="w-4 h-4" />
          More sizes
        </button>
      </div>
    </div>
  );
}
