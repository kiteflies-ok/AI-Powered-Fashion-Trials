const STATS = [
    { value: '2M+', label: 'Outfits tried' },
    { value: '98%', label: 'Accuracy' },
    { value: '< 10s', label: 'Processing time' },
    { value: '4.9★', label: 'User rating' },
]

export default function StatsBar() {
    return (
        <div className="w-full card p-4 sm:p-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-0 sm:divide-x divide-stone-100">
                {STATS.map((s) => (
                    <div key={s.label} className="flex flex-col items-center gap-0.5 py-2">
                        <span className="font-display text-2xl sm:text-3xl font-semibold text-stone-900">
                            {s.value}
                        </span>
                        <span className="text-xs text-stone-400 font-medium">{s.label}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}
