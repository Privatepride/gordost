import { createFileRoute } from "@tanstack/react-router";
import heroImg from "@/assets/hero.jpg";
import founderImg from "@/assets/founder.png";
import citiesImg from "@/assets/cities.jpg";
import { Nav } from "@/components/site/Nav";
import { SectionLabel, SectionTitle } from "@/components/site/SectionTitle";
import { JoinCTA } from "@/components/site/JoinCTA";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ГОРДОСТЬ — Закрытый инвестиционный клуб" },
      {
        name: "description",
        content:
          "Закрытое сообщество инвесторов с капиталом от 50 млн ₽. Для тех, кто приумножает капитал через силу сообщества.",
      },
      { property: "og:title", content: "ГОРДОСТЬ — Инвестиционный клуб" },
      { property: "og:description", content: "Правильные люди в правильном месте." },
    ],
  }),
  component: Index,
});

const aboutBullets = [
  {
    t: "Спокойствие за решения",
    d: "У вас есть данные, экспертиза и люди, которым вы доверяете.",
  },
  {
    t: "Окружение, которое тянет вверх",
    d: "Люди вашего масштаба, которые радуются вашим победам.",
  },
  {
    t: "1 + 1 = 11",
    d: "Крупные сделки, которые недоступны в одиночку, открываются для вас в клубе.",
  },
  {
    t: "Яркость жизни",
    d: "ИнвестБаня, путешествия, закрытые ужины с визионерами и форум-группы — место, где можно быть собой.",
  },
];

const howItWorks = [
  {
    n: "01",
    t: "Инвестиционная инфраструктура",
    items: [
      "Первичный Due Diligence — собственная AI-скоринговая система отбора по 136 параметрам.",
      "ИнвестКомитеты — публичный разбор сделок с экспертами и аналитиками клуба.",
      "Инвестиционный дайджест — новости, стратегии и сделки резидентов.",
      "Разбор личной стратегии — ваш персональный совет директоров из коллективного опыта.",
    ],
  },
  {
    n: "02",
    t: "Социальный капитал",
    items: [
      "Форум-группы — близкое окружение, поддержка в личных и рабочих вопросах.",
      "Умные связи — AI подбирает партнёра для эффективного знакомства tet-a-tet.",
      "Мастермайнды — регулярная работа в малых группах для роста капитала.",
      "Обмен опытом между резидентами клуба.",
    ],
  },
  {
    n: "03",
    t: "Lifestyle и «Третье место»",
    items: [
      "ИнвестБаня — фирменный ритуал и место неприкрытого нетворкинга.",
      "Закрытые мероприятия — ужины, бизнес-завтраки, камерные форматы.",
      "Путешествия и выезды с равными по духу.",
      "Премиум-локации и активности для всей семьи.",
    ],
  },
  {
    n: "04",
    t: "Аналитика и обучение",
    items: [
      "Аналитические отчёты от экспертов рынка.",
      "Отраслевые исследования и обзоры рынков.",
      "Библиотека материалов, конспектов, шаблонов и юридических документов.",
      "«ДНК Инвестора» — программа менторинга у экспертов рынка.",
    ],
  },
  {
    n: "05",
    t: "Инструменты и сервисы",
    items: [
      "Список проверенных подрядчиков.",
      "Спецусловия и бонусы от партнёров клуба.",
      "Доступ к уникальным ресурсам от резидентов.",
      "AI-консьерж — любой вопрос решается простым запросом.",
    ],
  },
  {
    n: "06",
    t: "Наследие и миссия",
    items: [
      "Стратегии для создания наследия.",
      "Программа «Наследники» — взаимодействие поколений.",
      "Благотворительность и социально значимые проекты.",
      "Ментальное здоровье и устойчивость.",
    ],
  },
];

const foundation = [
  {
    t: "Игра в долгую",
    d: "Стратегия устойчивого роста выше сиюминутной выгоды.",
  },
  {
    t: "Добропорядочность и честность",
    d: "Высокие стандарты экологичности и открытости формируют безукоризненный уровень доверия.",
  },
  {
    t: "Взаимная поддержка",
    d: "Партнёрство — фундамент отношений между резидентами клуба.",
  },
  {
    t: "Социальная ответственность",
    d: "Благотворительные и социальные инициативы — часть жизни клуба.",
  },
  {
    t: "Деньги",
    d: "Резиденты зарабатывают на возможностях сообщества. Цель — устойчивое благосостояние, а не погоня за цифрой.",
  },
  {
    t: "Сила, гордость, успех",
    d: "Место, где сила, гордость и успех соединяются. Мы разделяем успех с резидентами.",
  },
];

const ecosystem = [
  {
    t: "ИнвестБаня",
    d: "Уникальный формат: глубокий нетворкинг и обсуждение сделок в неформальной обстановке.",
  },
  {
    t: "Панельные дискуссии",
    d: "Разбор стратегий защиты активов и налогового планирования с ведущими экспертами.",
  },
  {
    t: "Спорт и путешествия",
    d: "Регаты, турниры, выезды и закрытые выставки — формируем общие воспоминания.",
  },
  {
    t: "Встречи с экспертами",
    d: "Прямой диалог с Андреем Плахотнюком и приглашёнными лидерами рынка.",
  },
];

const digital = [
  {
    t: "Умные связи",
    d: "AI соединяет вас с теми резидентами, кто максимально полезен вашему текущему запросу.",
  },
  {
    t: "База знаний в кармане",
    d: "Библиотека шаблонов, юридических документов и резюме всех встреч в один клик.",
  },
  {
    t: "Дайджесты смыслов",
    d: "Краткие выжимки из обсуждений — не упустите важное в потоке сообщений.",
  },
];

const steps = [
  { n: "01", t: "Заявка", d: "Заполните краткую анкету." },
  { n: "02", t: "Интервью", d: "Встреча с комьюнити-менеджером или основателем." },
  { n: "03", t: "Безопасность", d: "Проверка репутации и Due Diligence." },
  { n: "04", t: "Адаптация", d: "Знакомство с форумом и погружение в жизнь клуба." },
];

const toolBadges = [
  "ФОРУМ-ГРУППЫ",
  "ПАНЕЛЬНЫЕ ДИСКУССИИ",
  "СПОРТ И ПУТЕШЕСТВИЯ",
  "ИНВЕСТКОМИТЕТЫ",
  "МАСТЕРМАЙНДЫ",
  "AI-СКОРИНГ",
  "ЗАКРЫТЫЕ МЕРОПРИЯТИЯ",
  "АНАЛИТИКА",
  "ОТРАСЛЕВЫЕ ИССЛЕДОВАНИЯ",
  "ПРОГРАММА МЕНТОРИНГА",
  "СТРАТЕГИЯ НАСЛЕДИЯ",
  "БЛАГОТВОРИТЕЛЬНОСТЬ",
];

const toolIcons: Record<string, React.ReactNode> = {
  "ФОРУМ-ГРУППЫ": <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />,
  "ПАНЕЛЬНЫЕ ДИСКУССИИ": <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />,
  "СПОРТ И ПУТЕШЕСТВИЯ": <path d="M3 12l2-2 7-7 7 7 2 2M5 10v10a1 1 0 001 1h3m10-11l-2-2m2 2v10a1 1 0 01-1 1h-3" />,
  "ИНВЕСТКОМИТЕТЫ": <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />,
  "МАСТЕРМАЙНДЫ": <path d="M13 10V3L4 14h7v7l9-11h-7z" />,
  "AI-СКОРИНГ": <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />,
  "ЗАКРЫТЫЕ МЕРОПРИЯТИЯ": <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />,
  "АНАЛИТИКА": <path d="M9 17V9m4 8V5m4 12v-6m-13 9h18" />,
  "ОТРАСЛЕВЫЕ ИССЛЕДОВАНИЯ": <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />,
  "ПРОГРАММА МЕНТОРИНГА": <path d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />,
  "СТРАТЕГИЯ НАСЛЕДИЯ": <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />,
  "БЛАГОТВОРИТЕЛЬНОСТЬ": <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />,
};

function ToolsStrip() {
  return (
    <section className="relative py-20 md:py-28" aria-label="Инструменты клуба">
      <div className="container-prose">
        <div className="flex items-center gap-6 mb-12">
          <h2 className="text-[10px] uppercase tracking-[0.5em] text-gold font-bold whitespace-nowrap">
            Инструменты клуба
          </h2>
          <div className="h-px w-full bg-gradient-to-r from-gold/40 to-transparent" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {toolBadges.map((label) => (
            <div
              key={label}
              className="group cursor-default p-6 bg-card/40 border border-border rounded-2xl hover:bg-gradient-to-br hover:from-card hover:to-secondary hover:border-gold/40 transition-all duration-500"
            >
              <div className="flex flex-col gap-4">
                <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-gold/10 text-gold">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    {toolIcons[label] ?? toolIcons["ФОРУМ-ГРУППЫ"]}
                  </svg>
                </div>
                <span className="uppercase text-[10px] font-semibold tracking-[0.22em] text-foreground/90 group-hover:text-gold transition-colors">
                  {label}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Index() {
  return (
    <div id="top" className="min-h-screen text-foreground relative z-[1]">
      <Nav />

      {/* HERO — Elite mosaic */}
      <section className="relative overflow-hidden pt-32 md:pt-40 pb-16 md:pb-24">
        <div className="absolute -top-40 -right-40 w-[40rem] h-[40rem] rounded-full bg-gold/[0.06] blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 -left-32 w-[28rem] h-[28rem] rounded-full bg-gold/[0.04] blur-[100px] pointer-events-none" />

        <div className="container-prose relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* LEFT — Copy */}
            <div className="relative z-10">
              <div className="mb-8 flex items-center gap-4">
                <span className="h-px w-16 bg-gradient-to-r from-gold to-transparent" />
                <span className="uppercase tracking-[0.4em] text-[10px] font-semibold text-gold">
                  Private Investment Community
                </span>
              </div>

              <h1 className="font-display text-7xl sm:text-8xl md:text-9xl leading-[0.95] mb-8 gold-gradient">
                ГОРДОСТЬ
              </h1>

              <div className="space-y-2 mb-8">
                <p className="text-xl md:text-2xl font-light tracking-tight text-foreground/95">
                  Инвестиционный клуб
                </p>
                <p className="text-base md:text-lg italic text-gold/85">
                  для инвесторов с капиталом от 50 млн
                </p>
              </div>

              <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-lg mb-10">
                Для тех, кто приумножает капитал через силу сообщества.
              </p>

              <a
                href="#join"
                className="group relative inline-flex items-center gap-2 overflow-hidden bg-gold px-12 py-5 text-primary-foreground text-[11px] uppercase tracking-[0.2em] font-semibold transition-all duration-500 hover:shadow-[0_0_40px_rgba(221,201,169,0.3)]"
              >
                <span className="relative z-10">Стать резидентом</span>
                <span aria-hidden className="relative z-10">→</span>
              </a>
            </div>

            {/* RIGHT — Mosaic */}
            <div className="relative w-full h-[480px] md:h-[600px]">
              <div className="absolute inset-0 grid grid-cols-12 grid-rows-12 gap-3 md:gap-4">
                <div className="col-span-7 row-span-8 rounded-[2rem] overflow-hidden border border-gold/20 shadow-2xl z-20">
                  <img src={founderImg} alt="Основатель клуба" className="w-full h-full object-cover" />
                </div>

                <div className="col-span-5 row-span-4 rounded-[2rem] p-6 md:p-8 flex flex-col justify-end translate-y-4 shadow-xl z-30 bg-gold">
                  <span className="font-display text-4xl md:text-5xl text-primary-foreground">2</span>
                  <span className="text-[10px] uppercase font-semibold text-primary-foreground/70 tracking-[0.2em] mt-2">
                    Города клуба
                  </span>
                </div>

                <div className="col-start-8 col-span-5 row-start-5 row-span-4 rounded-[2rem] overflow-hidden border border-border opacity-50 hover:opacity-100 transition-opacity duration-700">
                  <img src={citiesImg} alt="" className="w-full h-full object-cover" />
                </div>

                <div className="col-start-3 col-span-6 row-start-9 row-span-4 rounded-[2rem] p-6 md:p-8 flex flex-col justify-center z-40 glass">
                  <div className="flex items-baseline gap-2">
                    <span className="font-display text-3xl md:text-4xl gold-gradient">от 50</span>
                    <span className="font-display text-lg md:text-xl text-gold">млн ₽</span>
                  </div>
                  <span className="text-[10px] uppercase font-medium text-muted-foreground tracking-[0.2em] mt-2">
                    Минимальный капитал
                  </span>
                </div>

                <div className="col-start-9 col-span-4 row-start-9 row-span-3 rounded-[2rem] overflow-hidden border border-border grayscale">
                  <img src={heroImg} alt="" className="w-full h-full object-cover" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <ToolsStrip />

      {/* ABOUT */}
      <section id="about" className="py-20 md:py-28">
        <div className="container-prose">
          <SectionLabel align="left">О клубе</SectionLabel>
          <SectionTitle align="left" className="max-w-4xl">
            Место, где сильные <span className="gold-gradient">делают сделки с сильными</span>
          </SectionTitle>

          <p className="max-w-2xl mt-8 text-lg text-muted-foreground leading-relaxed">
            <span className="text-foreground/95 font-medium">«Гордость»</span> — это пространство возможностей,
            вдохновляющее на рост и развитие. Среда, в которой ваш капитал начинает расти иначе — через людей,
            доверие и коллективную экспертизу.
          </p>

          <div className="grid sm:grid-cols-2 gap-4 mt-14">
            {aboutBullets.map((p) => (
              <div
                key={p.t}
                className="rounded-2xl border border-border bg-card/40 p-8 hover:border-gold/35 transition-colors"
              >
                <h3 className="font-display text-xl md:text-2xl mb-3 text-foreground">{p.t}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{p.d}</p>
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-4 mt-12">
            <div className="rounded-2xl border border-gold/30 bg-card/30 p-8 md:p-10">
              <p className="text-[11px] uppercase tracking-[0.3em] text-gold mb-3">Критерий капитала</p>
              <p className="font-display text-3xl md:text-4xl gold-gradient mb-2">от 50 млн ₽</p>
              <p className="text-sm text-muted-foreground leading-relaxed">Инвесторы с подтверждённым капиталом и репутацией.</p>
            </div>
            <div className="rounded-2xl border border-gold/30 bg-card/30 p-8 md:p-10">
              <p className="text-[11px] uppercase tracking-[0.3em] text-gold mb-3">Критерий дохода</p>
              <p className="font-display text-3xl md:text-4xl gold-gradient mb-2">от 1 млн ₽ / мес</p>
              <p className="text-sm text-muted-foreground leading-relaxed">Устойчивый личный или дивидендный доход.</p>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="py-20 md:py-28 bg-card/35 border-y border-border">
        <div className="container-prose">
          <SectionLabel align="left">Как это работает</SectionLabel>
          <SectionTitle align="left" className="max-w-4xl">
            Шесть направлений, <span className="gold-gradient">которые работают на ваш капитал</span>
          </SectionTitle>

          <div className="grid md:grid-cols-2 gap-4 mt-14">
            {howItWorks.map((b) => (
              <div
                key={b.n}
                className="rounded-2xl border border-border bg-background/50 p-8 hover:border-gold/35 transition-colors"
              >
                <div className="flex items-baseline gap-4 mb-5">
                  <span className="font-display text-2xl gold-gradient tabular-nums">{b.n}</span>
                  <h3 className="font-display text-xl md:text-2xl text-foreground">{b.t}</h3>
                </div>
                <ul className="space-y-3">
                  {b.items.map((it) => (
                    <li key={it} className="flex items-start gap-3 text-sm text-muted-foreground leading-relaxed">
                      <span className="text-gold mt-1.5 shrink-0 text-[8px]">◆</span>
                      <span>{it}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOUNDATION */}
      <section className="py-20 md:py-28">
        <div className="container-prose">
          <SectionLabel align="left">Фундамент</SectionLabel>
          <SectionTitle align="left" className="max-w-3xl">
            На чём мы <span className="gold-gradient">строим клуб</span>
          </SectionTitle>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-14">
            {foundation.map((p) => (
              <div
                key={p.t}
                className="rounded-2xl border border-border bg-card/40 p-8 hover:border-gold/35 transition-colors"
              >
                <h3 className="font-display text-lg md:text-xl mb-3 text-gold">{p.t}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{p.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ECOSYSTEM */}
      <section id="ecosystem" className="py-20 md:py-28 bg-card/35">
        <div className="container-prose">
          <SectionLabel align="left">Экосистема клуба</SectionLabel>
          <SectionTitle align="left" className="max-w-3xl">
            Календарь и события
          </SectionTitle>

          <div className="grid md:grid-cols-2 gap-4 mt-12">
            {ecosystem.map((e, i) => (
              <div key={e.t} className="rounded-2xl border border-border bg-background/50 p-8 hover:border-gold/35 transition-colors">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <h3 className="font-display text-xl md:text-2xl text-gold">{e.t}</h3>
                  <span className="text-gold/35 text-sm tabular-nums">0{i + 1}</span>
                </div>
                <p className="text-muted-foreground leading-relaxed text-sm md:text-base">{e.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <JoinCTA
        variant="banner"
        eyebrow="Календарь резидента"
        title="Доступ к закрытым событиям и форматам клуба"
        cta="Стать резидентом"
      />

      {/* FOUNDER */}
      <section className="py-20 md:py-28 border-t border-border">
        <div className="container-prose grid lg:grid-cols-5 gap-12 items-center">
          <div className="lg:col-span-2">
            <div
              className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-gold/25"
              style={{ background: "linear-gradient(160deg, #1A2030 0%, #0D1119 100%)" }}
            >
              <div
                className="absolute inset-0 opacity-30"
                style={{ background: "radial-gradient(circle at 70% 40%, rgba(221,201,169,0.25), transparent 60%)" }}
              />
              <img
                src={founderImg}
                alt="Андрей Плахотнюк"
                loading="lazy"
                className="absolute inset-0 w-full h-full object-contain object-bottom"
              />
            </div>
          </div>
          <div className="lg:col-span-3">
            <SectionLabel align="left">Основатель</SectionLabel>
            <h2 className="font-display text-3xl md:text-5xl mb-6 text-left">
              Андрей <span className="gold-gradient">Плахотнюк</span>
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-10">
              За его плечами более ₽5 млрд привлечённого финансирования, 6000+ рассмотренных проектов и два экономических
              образования. В инвестициях с 2018 года, а уже в 2019 Андрей создал «ИнвестБаню» — сообщество, которое
              объединило 1200+ резидентов.
            </p>
            <div className="grid grid-cols-3 gap-4 border-t border-border pt-8">
              {[
                { v: "5 млрд ₽", l: "привлечено" },
                { v: "6 000+", l: "проектов" },
                { v: "1 200+", l: "резидентов" },
              ].map((s) => (
                <div key={s.l}>
                  <div className="font-display text-2xl md:text-3xl gold-gradient">{s.v}</div>
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground mt-2">{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* DIGITAL / CONCIERGE */}
      <section id="digital" className="relative py-20 md:py-28 overflow-hidden">
        <img src={citiesImg} alt="" loading="lazy" className="absolute inset-0 w-full h-full object-cover opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/92 to-background" />
        <div className="container-prose relative">
          <SectionLabel align="left">Консьерж</SectionLabel>
          <SectionTitle align="left" className="max-w-3xl">
            Цифровой <span className="gold-gradient">консьерж</span>
          </SectionTitle>
          <p className="max-w-2xl mt-8 text-lg text-muted-foreground leading-relaxed">
            Ваше время — самый дорогой актив. AI-консьерж сокращает поиск контактов и смыслов в потоке сообщений.
          </p>

          <div className="grid md:grid-cols-3 gap-4 mt-12">
            {digital.map((d) => (
              <div key={d.t} className="rounded-2xl border border-border bg-background/70 backdrop-blur-sm p-8">
                <div className="w-10 h-10 rounded-full border border-gold/50 flex items-center justify-center text-gold mb-5 text-sm">
                  ◆
                </div>
                <h3 className="font-display text-xl mb-3 text-foreground">{d.t}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{d.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* JOIN */}
      <section id="join" className="py-20 md:py-28 bg-card/40 border-t border-border">
        <div className="container-prose">
          <div className="grid lg:grid-cols-2 gap-14">
            <div>
              <SectionLabel align="left">Портрет резидента</SectionLabel>
              <h2 className="font-display text-3xl md:text-5xl mb-6 leading-tight text-left">
                Кто вступает в <span className="gold-gradient">«Гордость»</span>
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed mb-8">
                Мы объединяем инвесторов с капиталом <span className="text-gold">от 50 млн ₽</span> и доходом{" "}
                <span className="text-gold">от 1 млн ₽ в месяц</span>.
              </p>
              <ul className="space-y-4">
                {[
                  "Стремление к росту и открытость новому опыту",
                  "Готовность разделять ценности клуба",
                  "Положительная деловая репутация",
                ].map((c) => (
                  <li key={c} className="flex items-start gap-3">
                    <span className="text-gold mt-0.5 shrink-0">◆</span>
                    <span className="text-foreground/90">{c}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <SectionLabel align="left">Этапы вступления</SectionLabel>
              <h3 className="font-display text-2xl md:text-3xl mb-8 text-left">Четыре шага в клуб</h3>
              <div className="grid grid-cols-2 gap-3">
                {steps.map((s) => (
                  <div key={s.n} className="rounded-2xl border border-border bg-background/50 p-5 md:p-6">
                    <div className="font-display text-2xl gold-gradient mb-2">{s.n}</div>
                    <div className="font-medium text-foreground text-sm mb-1">{s.t}</div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{s.d}</p>
                  </div>
                ))}
              </div>
              <a
                href="#"
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-gold px-8 py-3.5 text-primary-foreground text-[11px] uppercase tracking-[0.2em] hover:opacity-90 transition-opacity"
              >
                Подать заявку <span aria-hidden>→</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      <JoinCTA
        variant="solid"
        eyebrow="Связаться"
        title="Готовы познакомиться с клубом?"
        text="Оставьте заявку — мы предложим формат интервью и ответим на вопросы о вступлении."
        cta="Стать резидентом"
      />

      {/* FOOTER */}
      <footer className="border-t border-border py-14 md:py-16">
        <div className="container-prose">
          <div className="grid md:grid-cols-3 gap-10 mb-12">
            <div>
              <div className="font-display text-2xl md:text-3xl tracking-[0.28em] text-gold mb-3">ГОРДОСТЬ</div>
              <p className="text-sm text-muted-foreground">Правильные люди в правильном месте.</p>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-gold mb-3">Контакты</div>
              <a
                href="#"
                className="inline-flex rounded-full border border-gold/35 px-5 py-2.5 text-sm text-foreground hover:border-gold hover:text-gold transition-colors"
              >
                Telegram-бот
              </a>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-gold mb-3">Города</div>
              <div className="text-sm text-muted-foreground space-y-1">
                <div>Москва</div>
                <div>Санкт-Петербург</div>
              </div>
            </div>
          </div>

          <div className="hairline mb-8" />

          <div className="text-xs text-muted-foreground/70 leading-relaxed space-y-1">
            <div>ИП Плахотнюк Андрей Витальевич</div>
            <div>
              125480, г. Москва, муниципальный округ Северное Тушино вн.тер.г., ул. Планерная, д. 5
            </div>
            <div>ИНН 280106776632 · ОГРНИП 325774600796691</div>
            <div className="mt-4">© {new Date().getFullYear()} Гордость. Все права защищены.</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
