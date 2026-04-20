"use client";

interface ProgressBarProps {
  progress: number;
  step: string;
}

export default function ProgressBar({ progress, step }: ProgressBarProps) {
  const steps = [
    { label: "Queued", min: 0 },
    { label: "Processing", min: 10 },
    { label: "Segmenting", min: 30 },
    { label: "Generating", min: 50 },
    { label: "Done", min: 100 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end mb-2">
        <span className="text-3xl font-black text-white">{progress}%</span>
        <span className="text-indigo-400 font-medium animate-pulse">{step}</span>
      </div>
      
      <div className="h-4 w-full bg-slate-800 rounded-full overflow-hidden border border-slate-700">
        <div 
          className="h-full bg-indigo-500 transition-all duration-500 ease-out shadow-[0_0_20px_rgba(99,102,241,0.5)]"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex justify-between px-2">
        {steps.map((s, i) => (
          <div key={i} className="flex flex-col items-center">
            <div className={`w-2 h-2 rounded-full mb-2 transition-colors duration-500
              ${progress >= s.min ? 'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,1)]' : 'bg-slate-700'}`} 
            />
            <span className={`text-[10px] uppercase tracking-widest font-bold
              ${progress >= s.min ? 'text-indigo-400' : 'text-slate-600'}`}>
              {s.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
