import { motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowRight,
  Award,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  HelpCircle,
  Layers,
  ListChecks,
  Lock,
  Play,
  Scale,
  Shield,
  Target,
  TrendingDown,
  Users,
  Video,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Countdown } from "@/components/landing/Countdown";
import { RegistrationForm } from "@/components/landing/RegistrationForm";
import { LeadMagnet } from "@/components/landing/LeadMagnet";
import { FAQ } from "@/components/landing/FAQ";
import { Link } from "react-router-dom";
import speakerImg from "@/assets/speaker.jpg";

// Webinar date — ближайшая среда, 19:00
const getWebinarDate = () => {
  const d = new Date();
  d.setDate(d.getDate() + ((3 - d.getDay() + 7) % 7 || 7));
  d.setHours(19, 0, 0, 0);
  return d;
};
const WEBINAR_DATE = getWebinarDate();
const WEBINAR_DATE_STR = WEBINAR_DATE.toLocaleDateString("ru-RU", {
  day: "numeric",
  month: "long",
});

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] as const },
};

const scrollToForm = () => {
  document.getElementById("register")?.scrollIntoView({ behavior: "smooth", block: "center" });
};

const CTA = ({
  label = "Записаться на вебинар",
  className = "",
}: { label?: string; className?: string }) => (
  <Button onClick={scrollToForm} variant="hero" size="xl" className={className}>
    {label}
    <ArrowRight className="h-5 w-5" />
  </Button>
);

const Index = () => {
  return (
    <main className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* ============ HERO ============ */}
      <section className="relative bg-gradient-hero text-primary-foreground overflow-hidden">
        {/* decorative blobs */}
        <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-20 h-[400px] w-[400px] rounded-full bg-primary-glow/40 blur-3xl" />

        <nav className="relative z-10 container mx-auto px-4 py-6 flex items-center justify-between">
          <Logo variant="light" />
          <div className="hidden md:flex items-center gap-2 text-sm text-primary-foreground/70">
            <Calendar className="h-4 w-4" />
            {WEBINAR_DATE_STR}, 19:00 МСК
          </div>
        </nav>

        <div className="relative z-10 container mx-auto px-4 pt-8 pb-20 lg:pt-16 lg:pb-32 grid lg:grid-cols-12 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-7"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/20 bg-primary-foreground/5 px-4 py-1.5 text-xs font-medium uppercase tracking-wider backdrop-blur-sm mb-6">
              <span className="h-2 w-2 rounded-full bg-accent animate-pulse-soft" />
              Бесплатный онлайн-вебинар
            </div>

            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.05] text-balance mb-6">
              3 законных способа решить{" "}
              <span className="text-accent">проблему&nbsp;с&nbsp;долгами</span>
            </h1>

            <p className="text-lg sm:text-xl text-primary-foreground/80 max-w-xl mb-8 leading-relaxed">
              Разберём, какой вариант подходит именно вам и как действовать{" "}
              <span className="text-primary-foreground font-medium">в рамках закона</span>.
              Решения индивидуальны — вы получите ясность по своей ситуации.
            </p>

            <div className="flex flex-wrap items-center gap-4 mb-10 text-sm">
              <div className="flex items-center gap-2 text-primary-foreground/85">
                <Calendar className="h-4 w-4 text-accent" />
                {WEBINAR_DATE_STR}, 19:00 МСК
              </div>
              <div className="hidden sm:block h-1 w-1 rounded-full bg-primary-foreground/30" />
              <div className="flex items-center gap-2 text-primary-foreground/85">
                <Video className="h-4 w-4 text-accent" />
                Онлайн, из любой точки
              </div>
              <div className="hidden sm:block h-1 w-1 rounded-full bg-primary-foreground/30" />
              <div className="flex items-center gap-2 text-primary-foreground/85">
                <Clock className="h-4 w-4 text-accent" />
                ~60 минут
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <CTA />
              <Button variant="heroOutline" size="xl" onClick={scrollToForm}>
                <Play className="h-4 w-4" />
                Узнать программу
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="lg:col-span-5"
          >
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-accent rounded-3xl opacity-20 blur-2xl" />
              <div className="relative rounded-3xl overflow-hidden shadow-glow border border-primary-foreground/10">
                <img
                  src={speakerImg}
                  alt="Спикер вебинара — практикующий юрист"
                  width={896}
                  height={1152}
                  className="w-full h-auto object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/20 to-transparent" />
                <button
                  onClick={scrollToForm}
                  aria-label="Смотреть видео-обращение"
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-16 w-16 rounded-full bg-accent text-accent-foreground flex items-center justify-center shadow-accent hover:scale-110 transition-smooth"
                >
                  <Play className="h-6 w-6 ml-1" fill="currentColor" />
                </button>
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <div className="text-xs uppercase tracking-wider text-accent font-semibold mb-1">
                    Спикер
                  </div>
                  <div className="font-display text-xl font-bold">Александр Вячеславович</div>
                  <div className="text-sm text-primary-foreground/80">Практикующий юрист</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============ 2. УЗНАВАНИЕ ============ */}
      <section className="py-20 lg:py-28 bg-background">
        <div className="container mx-auto px-4">
          <motion.div {...fadeUp} className="text-center max-w-2xl mx-auto mb-14">
            <div className="text-xs uppercase tracking-[0.2em] text-accent font-semibold mb-4">
              Знакомая ситуация
            </div>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-primary text-balance">
              Если хотя бы одно — про&nbsp;вас, этот вебинар нужен
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {[
              { icon: CreditCard, text: "Есть кредиты или микрозаймы" },
              { icon: AlertTriangle, text: "Появились просрочки по платежам" },
              { icon: TrendingDown, text: "Платить становится всё тяжелее" },
              { icon: Users, text: "Звонят банки и коллекторы" },
              { icon: HelpCircle, text: "Не понимаете, что делать дальше" },
              { icon: Shield, text: "Боитесь потерять имущество" },
            ].map((item, i) => (
              <motion.div
                key={i}
                {...fadeUp}
                transition={{ duration: 0.5, delay: i * 0.06 }}
                className="group flex items-start gap-4 p-5 rounded-2xl bg-surface border border-border hover:border-primary/20 hover:shadow-soft transition-smooth"
              >
                <div className="h-11 w-11 shrink-0 rounded-xl bg-card border border-border flex items-center justify-center text-primary group-hover:bg-accent group-hover:text-accent-foreground group-hover:border-accent transition-smooth">
                  <item.icon className="h-5 w-5" />
                </div>
                <p className="text-base font-medium text-primary pt-2">{item.text}</p>
              </motion.div>
            ))}
          </div>

          <motion.p
            {...fadeUp}
            className="text-center mt-12 text-xl sm:text-2xl font-display font-semibold text-primary/80"
          >
            Вы&nbsp;не один в&nbsp;этой ситуации.
          </motion.p>
        </div>
      </section>

      {/* ============ 3. ИНСАЙТ ============ */}
      <section className="py-20 lg:py-32 bg-gradient-hero text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
          backgroundSize: "32px 32px",
        }} />
        <div className="container mx-auto px-4 relative">
          <motion.div {...fadeUp} className="max-w-4xl mx-auto text-center">
            <h2 className="font-display text-3xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] text-balance mb-8">
              Большинство людей <span className="text-accent">годами</span> платят по&nbsp;долгам
              и&nbsp;не&nbsp;решают проблему.
            </h2>
            <p className="text-lg sm:text-xl text-primary-foreground/75 max-w-2xl mx-auto leading-relaxed">
              Не&nbsp;потому что делают что-то не так — а&nbsp;потому что просто не&nbsp;знают,
              какие варианты предусмотрены законом.
            </p>
            <div className="mt-10">
              <CTA label="Узнать варианты" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============ 4. ЦЕННОСТЬ ============ */}
      <section className="py-20 lg:py-28 bg-background">
        <div className="container mx-auto px-4">
          <motion.div {...fadeUp} className="text-center max-w-2xl mx-auto mb-14">
            <div className="text-xs uppercase tracking-[0.2em] text-accent font-semibold mb-4">
              Что вы получите
            </div>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-primary text-balance">
              За&nbsp;60&nbsp;минут — ясность и&nbsp;план дальнейших шагов
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 max-w-6xl mx-auto">
            {[
              {
                icon: Target,
                title: "Понимание ситуации",
                desc: "Что именно происходит с вашими долгами с точки зрения закона",
              },
              {
                icon: Layers,
                title: "Возможные варианты",
                desc: "Какие законные пути решения существуют — и кому они подходят",
              },
              {
                icon: AlertTriangle,
                title: "Типичные ошибки",
                desc: "Что делают люди — и почему это только усугубляет ситуацию",
              },
              {
                icon: ListChecks,
                title: "Возможный план",
                desc: "Конкретные шаги, с которых можно начать уже завтра",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                {...fadeUp}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="group p-7 rounded-2xl bg-card border border-border hover:border-accent/40 hover:-translate-y-1 hover:shadow-card transition-smooth"
              >
                <div className="h-12 w-12 rounded-xl bg-accent/10 text-accent flex items-center justify-center mb-5 group-hover:bg-accent group-hover:text-accent-foreground transition-smooth">
                  <item.icon className="h-6 w-6" />
                </div>
                <h3 className="font-display text-xl font-bold text-primary mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ 5. ПРОГРАММА ============ */}
      <section className="py-20 lg:py-28 bg-surface">
        <div className="container mx-auto px-4">
          <motion.div {...fadeUp} className="text-center max-w-2xl mx-auto mb-14">
            <div className="text-xs uppercase tracking-[0.2em] text-accent font-semibold mb-4">
              Программа вебинара
            </div>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-primary text-balance">
              О&nbsp;чём поговорим
            </h2>
          </motion.div>

          <div className="max-w-3xl mx-auto space-y-3">
            {[
              { t: "Как устроена долговая система", d: "Откуда берётся снежный ком и почему просрочки растут быстрее, чем вы успеваете платить" },
              { t: "Какие существуют законные варианты", d: "Реструктуризация, рефинансирование, переговоры с кредиторами, судебная защита" },
              { t: "Когда уместно банкротство физлица", d: "Условия, плюсы, минусы — без розовых очков" },
              { t: "Ограничения и последствия каждого пути", d: "Что важно понимать ДО того, как принимать решение" },
              { t: "Как выбрать подходящий именно вам путь", d: "Вопросы, которые стоит задать себе и юристу" },
            ].map((item, i) => (
              <motion.div
                key={i}
                {...fadeUp}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                className="flex items-start gap-5 p-6 rounded-2xl bg-card border border-border hover:shadow-soft transition-smooth"
              >
                <div className="shrink-0 h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-display font-bold">
                  {i + 1}
                </div>
                <div>
                  <h3 className="font-display text-lg sm:text-xl font-bold text-primary mb-1">{item.t}</h3>
                  <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">{item.d}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div {...fadeUp} className="text-center mt-12">
            <CTA />
          </motion.div>
        </div>
      </section>

      {/* ============ 6. СПИКЕР ============ */}
      <section className="py-20 lg:py-28 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-12 gap-10 items-center max-w-6xl mx-auto">
            <motion.div {...fadeUp} className="lg:col-span-5">
              <div className="relative max-w-sm mx-auto">
                <div className="absolute -inset-3 bg-gradient-accent rounded-3xl opacity-15 blur-xl" />
                <img
                  src={speakerImg}
                  alt="Александр Вячеславович — практикующий юрист"
                  width={896}
                  height={1152}
                  loading="lazy"
                  className="relative rounded-3xl shadow-card w-full h-auto"
                />
              </div>
            </motion.div>

            <motion.div {...fadeUp} className="lg:col-span-7">
              <div className="text-xs uppercase tracking-[0.2em] text-accent font-semibold mb-4">
                Спикер
              </div>
              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-primary mb-5 text-balance">
                Александр Вячеславович
              </h2>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Практикующий юрист в&nbsp;сфере кредитных и&nbsp;долговых обязательств.
                Работает с&nbsp;реальными ситуациями людей, оказавшихся под финансовым давлением.
              </p>

              <div className="grid sm:grid-cols-3 gap-4">
                {[
                  { icon: Award, t: "10+ лет", d: "юридической практики" },
                  { icon: Users, t: "сопровождает", d: "реальные дела клиентов" },
                  { icon: Scale, t: "специализация", d: "долговые споры и защита" },
                ].map((s, i) => (
                  <div key={i} className="p-4 rounded-xl bg-surface border border-border">
                    <s.icon className="h-5 w-5 text-accent mb-2" />
                    <div className="font-display text-lg font-bold text-primary">{s.t}</div>
                    <div className="text-xs text-muted-foreground">{s.d}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ============ 7. ЮРИДИЧЕСКАЯ ЧЕСТНОСТЬ ============ */}
      <section className="py-20 lg:py-24 bg-surface">
        <div className="container mx-auto px-4">
          <motion.div {...fadeUp} className="max-w-4xl mx-auto">
            <div className="rounded-3xl bg-card border border-border p-8 sm:p-12 shadow-soft">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-12 w-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center">
                  <Scale className="h-6 w-6" />
                </div>
                <div className="text-xs uppercase tracking-[0.2em] text-accent font-semibold">
                  Честно и&nbsp;по&nbsp;закону
                </div>
              </div>
              <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-primary mb-6 text-balance">
                Мы&nbsp;не&nbsp;обещаем чудес — мы&nbsp;объясняем, как&nbsp;это&nbsp;работает
              </h2>
              <ul className="space-y-4 text-base sm:text-lg">
                {[
                  "Все рассматриваемые варианты — строго в рамках действующего законодательства РФ",
                  "Универсального решения не существует. Каждая ситуация индивидуальна и требует разбора",
                  "На вебинаре мы делимся знаниями и подходами — окончательное решение всегда остаётся за вами",
                  "Возможные результаты зависят от вашей ситуации, дохода, имущества и других факторов",
                ].map((t, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-accent shrink-0 mt-1" />
                    <span className="text-primary/85 leading-relaxed">{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============ ЛИД-МАГНИТ: PDF-ГАЙД ============ */}
      <LeadMagnet />

      {/* ============ 8 + 9. ФОРМА + ТАЙМЕР ============ */}
      <section id="register" className="py-20 lg:py-28 bg-gradient-hero text-primary-foreground relative overflow-hidden">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 h-[600px] w-[600px] rounded-full bg-accent/10 blur-3xl" />

        <div className="container mx-auto px-4 relative">
          <motion.div {...fadeUp} className="text-center mb-12">
            <div className="text-xs uppercase tracking-[0.2em] text-accent font-semibold mb-4">
              До начала вебинара осталось
            </div>
            <Countdown target={WEBINAR_DATE} />
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
            <motion.div {...fadeUp}>
              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight text-balance mb-6">
                Зарезервируйте место на&nbsp;вебинаре
              </h2>
              <p className="text-lg text-primary-foreground/80 mb-8 leading-relaxed">
                Количество мест ограничено возможностями платформы. Регистрация бесплатна — ссылка
                придёт на&nbsp;email и&nbsp;в&nbsp;SMS.
              </p>
              <ul className="space-y-3 text-primary-foreground/85">
                {[
                  "Доступ к записи на 48 часов",
                  "Ответы на вопросы в прямом эфире",
                  "Чек-лист «Первые шаги по долгам» в подарок",
                ].map((t, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-accent shrink-0" />
                    {t}
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div {...fadeUp} transition={{ duration: 0.6, delay: 0.1 }}>
              <RegistrationForm />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ============ FAQ ============ */}
      <FAQ />

      {/* ============ 10. ФИНАЛЬНЫЙ ДОЖИМ ============ */}
      <section className="py-20 lg:py-28 bg-background">
        <div className="container mx-auto px-4">
          <motion.div {...fadeUp} className="max-w-3xl mx-auto text-center">
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-primary leading-tight text-balance mb-6">
              Чем&nbsp;раньше вы&nbsp;разберётесь — тем&nbsp;больше вариантов
              <span className="text-accent">&nbsp;решения</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-10 leading-relaxed">
              Время — главный фактор в&nbsp;долговых ситуациях. Каждый месяц промедления сокращает
              список доступных законных инструментов.
            </p>
            <CTA />
            <p className="mt-6 text-sm text-muted-foreground flex items-center justify-center gap-2">
              <Lock className="h-3.5 w-3.5" />
              Конфиденциально. Без спама. Без оплаты.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="py-10 bg-surface-deep text-primary-foreground/60 text-sm">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Logo variant="light" asLink={false} />
            <span className="opacity-60">© {new Date().getFullYear()}</span>
          </div>
          <div className="flex flex-col sm:items-end gap-2">
            <Link
              to="/privacy"
              className="text-primary-foreground/80 hover:text-primary-foreground underline underline-offset-2 transition-smooth"
            >
              Политика конфиденциальности
            </Link>
            <div className="text-xs text-center sm:text-right max-w-md leading-relaxed">
              Информация на сайте носит ознакомительный характер и не является юридической консультацией.
              Каждая ситуация индивидуальна.
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
};

export default Index;
