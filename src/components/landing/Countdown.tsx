import { useEffect, useState } from "react";

interface CountdownProps {
  target: Date;
}

const calc = (target: Date) => {
  const diff = Math.max(0, target.getTime() - Date.now());
  const d = Math.floor(diff / (1000 * 60 * 60 * 24));
  const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const m = Math.floor((diff / (1000 * 60)) % 60);
  const s = Math.floor((diff / 1000) % 60);
  return { d, h, m, s };
};

const Cell = ({ value, label }: { value: number; label: string }) => (
  <div className="flex flex-col items-center">
    <div className="min-w-[72px] sm:min-w-[96px] rounded-2xl bg-primary text-primary-foreground px-4 py-4 sm:py-5 shadow-card">
      <div className="font-display text-3xl sm:text-5xl font-bold tabular-nums text-center">
        {String(value).padStart(2, "0")}
      </div>
    </div>
    <span className="mt-2 text-xs sm:text-sm text-muted-foreground uppercase tracking-wider">{label}</span>
  </div>
);

export const Countdown = ({ target }: CountdownProps) => {
  const [t, setT] = useState(() => calc(target));
  useEffect(() => {
    const id = setInterval(() => setT(calc(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  return (
    <div className="flex items-center justify-center gap-3 sm:gap-5">
      <Cell value={t.d} label="дней" />
      <span className="font-display text-3xl sm:text-5xl text-primary/30">:</span>
      <Cell value={t.h} label="часов" />
      <span className="font-display text-3xl sm:text-5xl text-primary/30">:</span>
      <Cell value={t.m} label="минут" />
      <span className="font-display text-3xl sm:text-5xl text-primary/30 hidden sm:inline">:</span>
      <div className="hidden sm:block">
        <Cell value={t.s} label="секунд" />
      </div>
    </div>
  );
};