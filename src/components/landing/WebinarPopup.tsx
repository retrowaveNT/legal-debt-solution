import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, BadgeCheck, Calendar, Clock, Lock, Video, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import speakerImg from "@/assets/speaker.jpg";

interface WebinarPopupProps {
  delayMs?: number;
  webinarDateStr: string;
  webinarTimeStr: string;
}

const STORAGE_KEY = "webinar_popup_shown_v1";

export const WebinarPopup = ({
  delayMs = 40000,
  webinarDateStr,
  webinarTimeStr,
}: WebinarPopupProps) => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(STORAGE_KEY) === "1") return;
    const t = setTimeout(() => {
      setOpen(true);
      sessionStorage.setItem(STORAGE_KEY, "1");
    }, delayMs);
    return () => clearTimeout(t);
  }, [delayMs]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const handleCTA = () => {
    setOpen(false);
    setTimeout(() => {
      document.getElementById("register")?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-primary/60 backdrop-blur-md"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="webinar-popup-title"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
            className="relative w-full max-w-3xl bg-card rounded-3xl shadow-glow overflow-hidden grid sm:grid-cols-2"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setOpen(false)}
              aria-label="Закрыть"
              className="absolute top-3 right-3 z-10 h-9 w-9 rounded-full bg-background/90 backdrop-blur flex items-center justify-center text-primary hover:bg-background transition-smooth shadow-soft"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Speaker image */}
            <div className="relative aspect-[4/5] sm:aspect-auto sm:min-h-[420px] overflow-hidden bg-primary">
              <img
                src={speakerImg}
                alt="Александр Вячеславович — спикер вебинара"
                className="absolute inset-0 h-full w-full object-cover object-top"
              />
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-primary/90 via-primary/40 to-transparent" />
              <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-background/95 backdrop-blur px-3 py-1 text-[11px] font-semibold text-primary shadow-soft">
                <BadgeCheck className="h-3.5 w-3.5 text-accent" />
                Практикующий юрист
              </div>
              <div className="absolute bottom-4 left-4 right-4 text-primary-foreground">
                <div className="text-[11px] uppercase tracking-[0.18em] text-accent font-semibold mb-1">
                  Лично от спикера
                </div>
                <p className="text-sm sm:text-base font-medium leading-snug drop-shadow">
                  «Приходите — разберём вашу ситуацию и&nbsp;возможные шаги в&nbsp;рамках закона.»
                </p>
                <div className="mt-2 text-xs text-primary-foreground/80">
                  — Александр Вячеславович
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 sm:p-7 flex flex-col">
              <div className="inline-flex items-center gap-2 self-start rounded-full bg-accent/15 text-accent px-3 py-1 text-[11px] font-semibold uppercase tracking-wider mb-3">
                <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse-soft" />
                Бесплатный вебинар
              </div>

              <h2
                id="webinar-popup-title"
                className="font-display text-2xl sm:text-[26px] font-bold text-primary leading-tight mb-3 text-balance"
              >
                Не&nbsp;упустите шанс получить ясность по&nbsp;своей ситуации
              </h2>

              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                За&nbsp;60&nbsp;минут разберём 3&nbsp;законных способа решить проблему долгов
                и&nbsp;поможем понять, какой подходит именно вам. Без&nbsp;продаж — только польза.
              </p>

              <div className="space-y-2 text-sm text-foreground/85 mb-5">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-accent shrink-0" />
                  {webinarDateStr}, {webinarTimeStr}
                </div>
                <div className="flex items-center gap-2">
                  <Video className="h-4 w-4 text-accent shrink-0" />
                  Онлайн, из&nbsp;любой точки
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-accent shrink-0" />
                  ~60&nbsp;минут · бесплатно
                </div>
              </div>

              <div className="mt-auto space-y-2.5">
                <Button onClick={handleCTA} variant="hero" size="lg" className="w-full">
                  Зарезервировать место
                  <ArrowRight className="h-5 w-5" />
                </Button>
                <button
                  onClick={() => setOpen(false)}
                  className="w-full text-xs text-muted-foreground hover:text-primary transition-smooth py-1"
                >
                  Я подумаю позже
                </button>
                <p className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
                  <Lock className="h-3 w-3" />
                  Без спама · отписка в&nbsp;один клик
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};