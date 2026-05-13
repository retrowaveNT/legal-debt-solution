import { motion } from "framer-motion";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "react-router-dom";
import { BellOff, CheckCircle2, Download, FileText, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { postJsonToApi } from "@/lib/api";

const schema = z.object({
  name: z.string().trim().min(2, { message: "Минимум 2 символа" }).max(60),
  email: z
    .string()
    .trim()
    .email({ message: "Введите корректный email" })
    .max(120),
});
type Values = z.infer<typeof schema>;

const PDF_URL = "/downloads/guide-debt-solutions.pdf";
const PDF_FILE_NAME = "Первые 7 шагов для решения проблем с долгами.pdf";

const features = [
  "Обзор 5 законных вариантов решения долгов",
  "Когда какой путь уместен — и когда нет",
  "Возможные последствия по каждому варианту",
  "Чек-лист «Первые 7 шагов» на этой неделе",
  "Список документов, которые стоит подготовить",
];

export const LeadMagnet = () => {
  const [done, setDone] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: Values) => {
    setSubmitError(null);
    try {
      await postJsonToApi<{ success?: boolean }>("/api/lead-magnet", values);
    } catch (error) {
      console.error("Lead magnet submit error", error);
      setSubmitError("Не удалось отправить заявку. Попробуйте ещё раз.");
      return;
    }

    setDone(true);
    // Trigger download
    const a = document.createElement("a");
    a.href = PDF_URL;
    a.download = PDF_FILE_NAME;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <section className="py-12 lg:py-16 bg-surface">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-12 gap-8 items-center">
          {/* Left — visual & value */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7"
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-accent/15 text-accent px-4 py-1.5 text-xs font-semibold uppercase tracking-wider mb-3">
              <Download className="h-3.5 w-3.5" />
              Бесплатный PDF-гайд
            </div>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-primary mb-3 text-balance leading-tight">
              5 законных вариантов решения долгов&nbsp;— в&nbsp;одном PDF
            </h2>
            <p className="text-lg text-muted-foreground mb-5 leading-relaxed">
              Краткий обзор каждого пути, возможные последствия и&nbsp;чек-лист
              «Первые&nbsp;7&nbsp;шагов». Можно сохранить и&nbsp;вернуться
              позже.
            </p>

            <ul className="space-y-2 mb-5">
              {features.map((f) => (
                <li
                  key={f}
                  className="flex items-start gap-3 text-foreground/85"
                >
                  <CheckCircle2 className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            {/* PDF preview card */}
            <div className="hidden md:flex items-center gap-4 p-4 rounded-2xl bg-card border border-border shadow-soft max-w-md">
              <div className="h-14 w-14 rounded-xl bg-gradient-hero text-primary-foreground flex items-center justify-center shrink-0">
                <FileText className="h-7 w-7 text-accent" />
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-primary truncate">
                  {PDF_FILE_NAME}
                </div>
                <div className="text-xs text-muted-foreground">
                  5 страниц · 60 КБ · A4
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right — form */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:col-span-5"
          >
            {done ? (
              <div className="rounded-2xl bg-card border border-border p-8 text-center shadow-card">
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-accent/15 text-accent mb-4">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h3 className="font-display text-2xl font-bold text-primary mb-2">
                  Гайд отправлен
                </h3>
                <p className="text-muted-foreground mb-5">
                  Скачивание началось автоматически. Копия отправлена на ваш
                  email.
                </p>
                <a
                  href={PDF_URL}
                  download={PDF_FILE_NAME}
                  className="inline-flex items-center gap-2 text-primary font-semibold hover:text-accent transition-smooth"
                >
                  <Download className="h-4 w-4" />
                  Скачать ещё раз
                </a>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="rounded-2xl bg-card border border-border p-6 sm:p-8 shadow-card"
                noValidate
                autoComplete="on"
              >
                <h3 className="font-display text-xl font-bold text-primary mb-1">
                  Получить гайд бесплатно
                </h3>
                <p className="text-sm text-muted-foreground mb-5">
                  Отправим PDF на email и&nbsp;откроем для скачивания
                </p>

                <div className="space-y-4">
                  <div>
                    <Label
                      htmlFor="lm-name"
                      className="text-sm font-medium text-primary"
                    >
                      Имя
                    </Label>
                    <Input
                      id="lm-name"
                      placeholder="Ваше имя"
                      className="mt-1.5 h-12 rounded-xl"
                      autoComplete="given-name"
                      autoCapitalize="words"
                      spellCheck={false}
                      {...register("name")}
                    />
                    {errors.name && (
                      <p className="text-xs text-destructive mt-1">
                        {errors.name.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label
                      htmlFor="lm-email"
                      className="text-sm font-medium text-primary"
                    >
                      Email
                    </Label>
                    <Input
                      id="lm-email"
                      type="email"
                      inputMode="email"
                      placeholder="you@example.com"
                      className="mt-1.5 h-12 rounded-xl"
                      autoComplete="email"
                      spellCheck={false}
                      {...register("email")}
                    />
                    {errors.email && (
                      <p className="text-xs text-destructive mt-1">
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    variant="hero"
                    size="xl"
                    disabled={isSubmitting}
                    className="w-full mt-2"
                  >
                    <Download className="h-5 w-5" />
                    {isSubmitting ? "Готовим файл..." : "Получить PDF"}
                  </Button>
                  {submitError && (
                    <p className="text-xs text-destructive mt-2">
                      {submitError}
                    </p>
                  )}

                  <div className="space-y-2 pt-1">
                    <div className="flex items-start gap-2">
                      <Lock className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Соглашаясь, вы принимаете{" "}
                        <Link
                          to="/privacy"
                          className="text-primary underline underline-offset-2 hover:text-accent transition-smooth"
                        >
                          политику конфиденциальности
                        </Link>
                        .
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <BellOff className="h-3.5 w-3.5 text-accent mt-0.5 shrink-0" />
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        <span className="text-primary font-medium">
                          Без спама.
                        </span>{" "}
                        Отписка в&nbsp;один клик.
                      </p>
                    </div>
                  </div>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
};
