import { Link } from "react-router-dom";
import { ArrowLeft, Scale } from "lucide-react";

const sections: { t: string; body: string[] }[] = [
  {
    t: "1. Общие положения",
    body: [
      "Настоящая Политика конфиденциальности и обработки персональных данных (далее — «Политика») разработана в соответствии с требованиями Федерального закона от 27.07.2006 № 152-ФЗ «О персональных данных» и определяет порядок обработки персональных данных пользователей сайта Lex Ratio (далее — «Сайт»).",
      "Использование Сайта означает безоговорочное согласие пользователя с настоящей Политикой и условиями обработки его персональных данных. В случае несогласия с условиями Политики пользователю следует воздержаться от использования Сайта.",
    ],
  },
  {
    t: "2. Какие данные мы собираем",
    body: [
      "Мы обрабатываем только те данные, которые вы добровольно указываете при регистрации на вебинар: имя, номер телефона, адрес электронной почты.",
      "Дополнительно автоматически собираются технические данные: IP-адрес, тип браузера, источник перехода, действия на сайте — в обезличенной форме для аналитики.",
    ],
  },
  {
    t: "3. Цели обработки данных",
    body: [
      "Регистрация на онлайн-вебинар и отправка ссылки для входа.",
      "Напоминания о предстоящем вебинаре по email и SMS.",
      "Отправка обучающих материалов, в том числе бесплатного PDF-гайда.",
      "Информирование о новых вебинарах и материалах (только при вашем согласии — отписка в один клик).",
      "Связь с вами по запросам, оставленным на Сайте.",
    ],
  },
  {
    t: "4. Правовые основания",
    body: [
      "Обработка данных осуществляется на основании вашего согласия, выраженного путём заполнения формы регистрации на Сайте, а также в соответствии со ст. 6 ФЗ № 152-ФЗ.",
    ],
  },
  {
    t: "5. Передача третьим лицам",
    body: [
      "Мы не продаём и не передаём ваши персональные данные третьим лицам в коммерческих целях.",
      "Передача возможна только в следующих случаях: сервисам рассылки email/SMS для технической доставки сообщений; по требованию уполномоченных государственных органов в случаях, предусмотренных законом.",
    ],
  },
  {
    t: "6. Срок хранения и защита",
    body: [
      "Персональные данные хранятся не дольше, чем этого требуют цели обработки, либо до момента отзыва согласия пользователем.",
      "Мы применяем организационные и технические меры защиты: шифрование передаваемых данных (HTTPS), ограничение доступа сотрудников, регулярный аудит безопасности.",
    ],
  },
  {
    t: "7. Ваши права",
    body: [
      "Вы имеете право: получить информацию о составе обрабатываемых данных; запросить уточнение, блокировку или удаление; отозвать согласие на обработку в любой момент.",
      "Для реализации прав направьте запрос на email: privacy@lex-ratio.example. Срок ответа — до 30 календарных дней.",
    ],
  },
  {
    t: "8. Cookies",
    body: [
      "Сайт использует файлы cookies для корректной работы интерфейса и анализа посещаемости. Вы можете отключить cookies в настройках браузера — это может повлиять на функциональность Сайта.",
    ],
  },
  {
    t: "9. Изменения политики",
    body: [
      "Мы вправе обновлять настоящую Политику. Актуальная версия всегда доступна на этой странице. Дата последнего обновления указана ниже.",
    ],
  },
  {
    t: "10. Контакты",
    body: [
      "По всем вопросам, связанным с обработкой персональных данных: privacy@lex-ratio.example.",
    ],
  },
];

const Privacy = () => {
  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-hero text-primary-foreground">
        <div className="container mx-auto px-4 py-6 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-display text-xl font-bold">
            <div className="h-9 w-9 rounded-lg bg-accent flex items-center justify-center text-accent-foreground">
              <Scale className="h-5 w-5" />
            </div>
            Lex&nbsp;Ratio
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-primary-foreground/80 hover:text-primary-foreground transition-smooth"
          >
            <ArrowLeft className="h-4 w-4" />
            На главную
          </Link>
        </div>
      </header>

      <article className="container mx-auto px-4 py-14 lg:py-20 max-w-3xl">
        <div className="text-xs uppercase tracking-[0.2em] text-accent font-semibold mb-4">
          Юридическая информация
        </div>
        <h1 className="font-display text-4xl sm:text-5xl font-bold text-primary mb-4 text-balance">
          Политика конфиденциальности и обработки персональных данных
        </h1>
        <p className="text-muted-foreground mb-12">
          Дата вступления в силу: {new Date().toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })}
        </p>

        <div className="space-y-10">
          {sections.map((s) => (
            <section key={s.t}>
              <h2 className="font-display text-2xl font-bold text-primary mb-4">{s.t}</h2>
              <div className="space-y-3 text-base leading-relaxed text-foreground/85">
                {s.body.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-16 pt-8 border-t border-border">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-primary font-semibold hover:text-accent transition-smooth"
          >
            <ArrowLeft className="h-4 w-4" />
            Вернуться на главную
          </Link>
        </div>
      </article>
    </main>
  );
};

export default Privacy;