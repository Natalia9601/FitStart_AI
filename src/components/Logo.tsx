import { Salad } from 'lucide-react';

export default function Logo({ size = 40 }: { size?: number }) {
  return (
    <div className="flex items-center gap-2.5 select-none">
      <div
        className="grid place-items-center rounded-2xl bg-gradient-to-br from-choco-500 to-choco-600 text-cream-100 shadow-soft"
        style={{ width: size, height: size }}
      >
        <Salad size={size * 0.52} strokeWidth={2.2} />
      </div>
      <div className="leading-none">
        <span className="font-display text-xl text-choco-700 font-semibold tracking-tight">
          FitStart
        </span>
        <span className="font-display text-xl text-blush-300 font-semibold tracking-tight"> AI</span>
      </div>
    </div>
  );
}
