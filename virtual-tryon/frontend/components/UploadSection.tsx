"use client";

import { useState, useRef } from "react";
import { Upload, Shirt, User, ArrowRight, X } from "lucide-react";
import Image from "next/image";

interface UploadSectionProps {
  onStart: (person: File, garment: File, removeBg: boolean) => void;
  isLoading: boolean;
}

export default function UploadSection({ onStart, isLoading }: UploadSectionProps) {
  const [person, setPerson] = useState<File | null>(null);
  const [garment, setGarment] = useState<File | null>(null);
  const [removeBg, setRemoveBg] = useState(false);

  const [personPreview, setPersonPreview] = useState<string | null>(null);
  const [garmentPreview, setGarmentPreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: "person" | "garment") => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (type === "person") {
      setPerson(file);
      setPersonPreview(URL.createObjectURL(file));
    } else {
      setGarment(file);
      setGarmentPreview(URL.createObjectURL(file));
    }
  };

  const handleStart = () => {
    if (person && garment) {
      onStart(person, garment, removeBg);
    }
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Person Upload */}
        <div className="group relative">
          <label className={`block h-[400px] border-2 border-dashed rounded-3xl transition-all cursor-pointer overflow-hidden
            ${personPreview ? 'border-indigo-500/50' : 'border-slate-800 hover:border-indigo-500/50 bg-slate-900/30 hover:bg-indigo-500/5'}`}>
            <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, "person")} />
            
            {personPreview ? (
              <div className="relative w-full h-full">
                <Image src={personPreview} alt="Person" fill className="object-cover" />
                <button 
                  onClick={(e) => { e.preventDefault(); setPerson(null); setPersonPreview(null); }}
                  className="absolute top-4 right-4 p-2 bg-slate-950/50 hover:bg-red-500/50 rounded-full backdrop-blur-md"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full space-y-4">
                <div className="p-4 bg-indigo-500/10 rounded-2xl group-hover:scale-110 transition-transform">
                  <User className="w-8 h-8 text-indigo-400" />
                </div>
                <div className="text-center">
                  <p className="font-semibold text-slate-200">Upload Person Image</p>
                  <p className="text-sm text-slate-500">Full body or upper body</p>
                </div>
              </div>
            )}
          </label>
        </div>

        {/* Garment Upload */}
        <div className="group relative">
          <label className={`block h-[400px] border-2 border-dashed rounded-3xl transition-all cursor-pointer overflow-hidden
            ${garmentPreview ? 'border-indigo-500/50' : 'border-slate-800 hover:border-indigo-500/50 bg-slate-900/30 hover:bg-indigo-500/5'}`}>
            <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, "garment")} />
            
            {garmentPreview ? (
              <div className="relative w-full h-full">
                <Image src={garmentPreview} alt="Garment" fill className="object-cover" />
                <button 
                  onClick={(e) => { e.preventDefault(); setGarment(null); setGarmentPreview(null); }}
                  className="absolute top-4 right-4 p-2 bg-slate-950/50 hover:bg-red-500/50 rounded-full backdrop-blur-md"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full space-y-4">
                <div className="p-4 bg-indigo-500/10 rounded-2xl group-hover:scale-110 transition-transform">
                  <Shirt className="w-8 h-8 text-indigo-400" />
                </div>
                <div className="text-center">
                  <p className="font-semibold text-slate-200">Upload Garment Image</p>
                  <p className="text-sm text-slate-500">Flat lay or model image</p>
                </div>
              </div>
            )}
          </label>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
        <label className="flex items-center gap-3 cursor-pointer group">
          <input 
            type="checkbox" 
            checked={removeBg} 
            onChange={(e) => setRemoveBg(e.target.checked)}
            className="w-5 h-5 rounded border-slate-700 bg-slate-800 text-indigo-500 focus:ring-indigo-500" 
          />
          <span className="text-slate-300 group-hover:text-white transition-colors">Auto-remove garment background</span>
        </label>

        <button
          onClick={handleStart}
          disabled={!person || !garment || isLoading}
          className="w-full md:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/20"
        >
          {isLoading ? "Queuing..." : person && garment ? "Generate Try-On" : "Select Images"}
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
