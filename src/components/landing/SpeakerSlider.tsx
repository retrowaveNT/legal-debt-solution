import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, BadgeCheck } from "lucide-react";
import speaker1 from "@/assets/speaker.jpg";
import speaker2 from "@/assets/speaker-2.jpg";
import speaker3 from "@/assets/speaker-3.jpg";

const slides = [
  { src: speaker1, caption: "На консультации — разбирает ситуацию клиента" },
  { src: speaker2, caption: "В офисе — работа с документами и материалами дела" },
  { src: speaker3, caption: "На вебинаре — объясняет законные варианты простым языком" },
];

export const SpeakerSlider = ({ className = "" }: { className?: string }) => {
  const [i, setI] = useState(0);
  const next = () => setI((p) => (p + 1) % slides.length);
  const prev = () => setI((p) => (p - 1 + slides.length) % slides.length);

  useEffect(() => {
    const id = setInterval(next, 5000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className={`relative ${className}`}>
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-3xl shadow-card border border-border bg-surface">
        <AnimatePresence mode="wait">
          <motion.img
            key={i}
            src={slides[i].src}
            alt={`Александр Вячеславович — ${slides[i].caption}`}
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-t from-primary/85 via-primary/10 to-transparent pointer-events-none" />

        <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-background/95 backdrop-blur px-3 py-1 text-xs font-semibold text-primary shadow-soft">
          <BadgeCheck className="h-3.5 w-3.5 text-accent" />
          Практикующий юрист
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-5 text-primary-foreground">
          <div className="text-xs uppercase tracking-wider text-accent font-semibold mb-1">
            Александр Вячеславович
          </div>
          <p className="text-sm sm:text-base leading-snug text-primary-foreground/95">
            {slides[i].caption}
          </p>
        </div>

        <button
          onClick={prev}
          aria-label="Предыдущее фото"
          className="absolute left-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-background/85 hover:bg-background text-primary flex items-center justify-center shadow-soft transition-smooth"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          onClick={next}
          aria-label="Следующее фото"
          className="absolute right-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-background/85 hover:bg-background text-primary flex items-center justify-center shadow-soft transition-smooth"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <div className="mt-4 flex items-center justify-center gap-2">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setI(idx)}
            aria-label={`Показать фото ${idx + 1}`}
            className={`h-2 rounded-full transition-smooth ${
              i === idx ? "w-8 bg-accent" : "w-2 bg-border hover:bg-muted-foreground/40"
            }`}
          />
        ))}
      </div>
    </div>
  );
};