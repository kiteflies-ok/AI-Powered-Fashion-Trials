"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Upload, Shirt, User, Sparkles, History, Download, Loader2, CheckCircle2 } from "lucide-react";
import UploadSection from "@/components/UploadSection";
import ProgressBar from "@/components/ProgressBar";
import ResultViewer from "@/components/ResultViewer";

export default function Home() {
  const [jobId, setJobId] = useState<string | null>(null);
  const [status, setStatus] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [result, setResult] = useState<string | null>(null);

  // Load history from local storage
  useEffect(() => {
    const saved = localStorage.getItem("vton_history");
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  // WebSocket for real-time updates
  useEffect(() => {
    if (!jobId || status?.status === "Completed") return;

    const ws = new WebSocket(`ws://localhost:8000/ws/${jobId}`);
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setStatus(data);
      
      if (data.status === "Completed") {
        fetchResult(jobId);
        ws.close();
      }
    };

    return () => ws.close();
  }, [jobId, status]);

  const fetchResult = async (id: string) => {
    const response = await fetch(`http://localhost:8000/api/result/${id}`);
    const data = await response.json();
    if (data.image_url) {
      setResult(data.image_url);
      const newHistory = [{ id: id, url: data.image_url, timestamp: new Date().toISOString() }, ...history].slice(0, 5);
      setHistory(newHistory);
      localStorage.setItem("vton_history", JSON.stringify(newHistory));
    }
  };

  const startTryOn = async (personFile: File, garmentFile: File, removeBg: boolean) => {
    const formData = new FormData();
    formData.append("person_image", personFile);
    formData.append("garment_image", garmentFile);
    formData.append("remove_bg", String(removeBg));

    const response = await fetch("http://localhost:8000/api/tryon", {
      method: "POST",
      body: formData,
    });
    const data = await response.json();
    setJobId(data.job_id);
    setResult(null);
  };

  return (
    <main className="max-w-7xl mx-auto px-4 py-8 md:py-16">
      {/* Header */}
      <div className="flex flex-col items-center text-center mb-16 space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400 text-sm font-medium">
          <Sparkles className="w-4 h-4" />
          <span>Powered by IDM-VTON</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-black bg-gradient-to-b from-white to-slate-400 bg-clip-text text-transparent">
          AI Virtual Try-On
        </h1>
        <p className="text-slate-400 text-lg max-w-2xl">
          Upload a person and a garment. Our AI will automatically warp and generate a realistic try-on result in seconds.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left: Configuration & Uploads */}
        <div className="lg:col-span-2 space-y-8">
          {!jobId || result ? (
            <UploadSection onStart={startTryOn} isLoading={!!jobId && !result} />
          ) : (
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 space-y-6">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
                Working on your try-on...
              </h2>
              <ProgressBar progress={status?.progress || 0} step={status?.step || "Waking up worker..."} />
            </div>
          )}

          {result && <ResultViewer resultUrl={result} onReset={() => setJobId(null)} />}
        </div>

        {/* Right: History & Info */}
        <div className="space-y-8">
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <History className="w-5 h-5 text-indigo-400" />
              Recent Try-ons
            </h3>
            {history.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {history.map((item) => (
                  <div key={item.id} className="relative aspect-[3/4] rounded-lg overflow-hidden group border border-slate-800">
                    <Image src={item.url} alt="History item" fill className="object-cover group-hover:scale-110 transition-transform" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-slate-500 text-sm py-8 text-center border-2 border-dashed border-slate-800 rounded-xl">
                No history yet
              </div>
            )}
          </div>

          <div className="bg-indigo-600/10 border border-indigo-500/20 rounded-2xl p-6 space-y-4">
            <h3 className="font-semibold text-indigo-300">Tips for best results</h3>
            <ul className="text-sm text-slate-400 space-y-2">
              <li className="flex gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-500 shrink-0" />
                Use high-resolution full-body images.
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-500 shrink-0" />
                Ensure garment is clearly visible (flat lay preferred).
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-500 shrink-0" />
                Avoid overlapping limbs or complex backgrounds.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
