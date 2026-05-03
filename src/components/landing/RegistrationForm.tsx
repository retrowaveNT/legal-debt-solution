import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BellOff, CheckCircle2, Lock, ShieldCheck } from "lucide-react";

const schema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { message: "Введите имя (минимум 2 символа)" })
    .max(60, { message: "Слишком длинное имя" }),
  phone: z
    .string()
    .trim()
    .min(10, { message: "Введите корректный номер телефона" })
    .max(20, { message: "Слишком длинный номер" })
    .regex(/^[+\d\s()-]+$/, { message: "Только цифры и + ( ) -" }),
  email: z
    .string()
    .trim()
    .email({ message: "Введите корректный email" })
    .max(120, { message: "Слишком длинный email" }),
});

type FormValues = z.infer<typeof schema>;

export const RegistrationForm = ({ compact = false }: { compact?: boolean }) => {
  const [done, setDone] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    setSubmitError(null);

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const data = (await response.json()) as { success?: boolean };

      if (!response.ok || !data.success) {
        throw new Error("Registration request failed");
      }

      setDone(true);
    } catch (error) {
      console.error("Registration submit error", error);
      setSubmitError("Не удалось отправить заявку. Попробуйте ещё раз.");
    }
  };

  if (done) {
    return (
      <div className="rounded-2xl bg-card border border-border p-8 text-center shadow-card">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-accent/15 text-accent mb-4">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h3 className="font-display text-2xl font-bold text-primary mb-2">Вы записаны</h3>
        <p className="text-muted-foreground">
          Ссылка на вебинар придёт на email и в SMS за час до начала.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={`rounded-2xl bg-card border border-border ${compact ? "p-6" : "p-6 sm:p-8"} shadow-card`}
      noValidate
      autoComplete="on"
    >
      <div className="space-y-4">
        <div>
          <Label htmlFor="name" className="text-sm font-medium text-primary">Имя</Label>
          <Input
            id="name"
            placeholder="Как к вам обращаться?"
            className="mt-1.5 h-12 rounded-xl"
            autoComplete="given-name"
            autoCapitalize="words"
            spellCheck={false}
            {...register("name")}
          />
          {errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message}</p>}
        </div>
        <div>
          <Label htmlFor="phone" className="text-sm font-medium text-primary">Телефон</Label>
          <Input
            id="phone"
            type="tel"
            inputMode="tel"
            placeholder="+7 (___) ___-__-__"
            className="mt-1.5 h-12 rounded-xl"
            autoComplete="tel"
            {...register("phone")}
          />
          {errors.phone && <p className="text-xs text-destructive mt-1">{errors.phone.message}</p>}
        </div>
        <div>
          <Label htmlFor="email" className="text-sm font-medium text-primary">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            className="mt-1.5 h-12 rounded-xl"
            autoComplete="email"
            inputMode="email"
            spellCheck={false}
            {...register("email")}
          />
          {errors.email && <p className="text-xs text-destructive mt-1">{errors.email.message}</p>}
        </div>

        <Button
          type="submit"
          variant="hero"
          size="xl"
          disabled={isSubmitting}
          className="w-full mt-2"
        >
          {isSubmitting ? "Отправляем..." : "Принять участие"}
        </Button>
        {submitError && <p className="text-xs text-destructive mt-2">{submitError}</p>}

        <div className="space-y-2 pt-2">
          <div className="flex items-start gap-2">
            <Lock className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              Нажимая кнопку, вы соглашаетесь с{" "}
              <Link to="/privacy" className="text-primary underline underline-offset-2 hover:text-accent transition-smooth">
                политикой конфиденциальности
              </Link>
              . Данные защищены и не передаются третьим лицам.
            </p>
          </div>
          <div className="flex items-start gap-2">
            <BellOff className="h-3.5 w-3.5 text-accent mt-0.5 shrink-0" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              <span className="text-primary font-medium">Без спама.</span> Только материалы по теме вебинара —
              отписка в один клик из любого письма.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5 text-accent" />
            Регистрация бесплатна
          </div>
        </div>
      </div>
    </form>
  );
};
