import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import heroImg from "@/assets/hero.jpg";
import founderImg from "@/assets/founder-new.jpg";
import citiesImg from "@/assets/cities.jpg";
import boardroomImg from "@/assets/boardroom.jpg";
import lifestyleImg from "@/assets/lifestyle.jpg";
import dinnerImg from "@/assets/dinner.jpg";
import aiAbstractImg from "@/assets/ai-abstract.jpg";
import architectureImg from "@/assets/architecture.jpg";
import mentorshipImg from "@/assets/mentorship.jpg";
import { Nav } from "@/components/site/Nav";
import { SectionLabel, SectionTitle } from "@/components/site/SectionTitle";
import { JoinCTA } from "@/components/site/JoinCTA";
import { ApplyModal } from "@/components/site/ApplyModal";

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
  { t: "Спокойствие за решения", d: "У вас есть данные, экспертиза и люди, которым вы доверяете." },
  { t: "Окружение, которое тянет вверх", d: "Люди вашего масштаба, которые радуются вашим победам." },
  { t: "1 + 1 = 11", d: "Крупные сделки, которые недоступны в одиночку, открываются для вас в клубе." },
  { t: "Яркость жизни", d: "ИнвестБаня, путешествия, закрытые ужины с визионерами и форум-группы — место, где можно быть собой." },
];

const heroMetrics = [
  { v: "1 200+", l: "Резидентов сообщества" },
  { v: "5+ млрд ₽", l: "Привлеченного капитала" },
  { v: "136", l: "Параметров AI-скоринга" },
  { v: "100%", l: "Фокус на доверии и репутации" },
];

const howItWorks = [
  {
    n: "01",
    t: "Инвестиционная инфраструктура",
    img: boardroomImg,
    items: [
      "Первичный Due Diligence — собственная AI-скоринговая система отбора по 136 параметрам.",
      "ИнвестКомитеты — публичный разбор сделок с экспертами и аналитиками клуба.",
      "Инвестиционный дайджест — новости, стратегии и сделки резидентов.",
      "Разбор личной стратегии — ваш персональный совет директоров.",
    ],
  },
  {
    n: "02",
    t: "Социальный капитал",
    img: mentorshipImg,
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
    img: lifestyleImg,
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
    img: aiAbstractImg,
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
    img: architectureImg,
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
    img: dinnerImg,
    items: [
      "Стратегии для создания наследия.",
      "Программа «Наследники» — взаимодействие поколений.",
      "Благотворительность и социально значимые проекты.",
      "Ментальное здоровье и устойчивость.",
    ],
  },
];

const foundation = [
  { t: "Игра в долгую", d: "Стратегия устойчивого роста выше сиюминутной выгоды." },
  { t: "Добропорядочность и честность", d: "Высокие стандарты экологичности и открытости формируют безукоризненный уровень доверия." },
  { t: "Взаимная поддержка", d: "Партнёрство — фундамент отношений между резидентами клуба." },
  { t: "Социальная ответственность", d: "Благотворительные и социальные инициативы — часть жизни клуба." },
  { t: "Деньги", d: "Резиденты зарабатывают на возможностях сообщества. Цель — устойчивое благосостояние, а не погоня за цифрой." },
  { t: "Сила, гордость, успех", d: "Место, где сила, гордость и успех соединяются. Мы разделяем успех с резидентами." },
];

const ecosystem = [
  { t: "ИнвестБаня", d: "Уникальный формат: глубокий нетворкинг и обсуждение сделок в неформальной обстановке.", img: lifestyleImg },
  { t: "Панельные дискуссии", d: "Разбор стратегий защиты активов и налогового планирования с ведущими экспертами.", img: boardroomImg },
  { t: "Спорт и путешествия", d: "Регаты, турниры, выезды и закрытые выставки — формируем общие воспоминания.", img: architectureImg },
  { t: "Встречи с экспертами", d: "Прямой диалог с Андреем Плахотнюком и приглашёнными лидерами рынка.", img: dinnerImg },
];

const digital = [
  { t: "Умные связи", d: "AI соединяет вас с теми резидентами, кто максимально полезен вашему текущему запросу." },
  { t: "База знаний в кармане", d: "Библиотека шаблонов, юридических документов и резюме всех встреч в один клик." },
  { t: "Дайджесты смыслов", d: "Краткие выжимки из обсуждений — не упустите важное в потоке сообщений." },
];

const steps = [
  { n: "01", t: "Заявка", d: "Заполните краткую анкету." },
  { n: "02", t: "Интервью", d: "Встреча с комьюнити-менеджером или основателем." },
  { n: "03", t: "Безопасность", d: "Проверка репутации и Due Diligence." },
  { n: "04", t: "Адаптация", d: "Знакомство с форумом и погружение в жизнь клуба." },
];

const toolBadges = [
  "ФОРУМ-ГРУППЫ", "ПАНЕЛЬНЫЕ ДИСКУССИИ", "СПОРТ И ПУТЕШЕСТВИЯ", "ИНВЕСТКОМИТЕТЫ",
  "МАСТЕРМАЙНДЫ", "AI-СКОРИНГ", "ЗАКРЫТЫЕ МЕРОПРИЯТИЯ", "АНАЛИТИКА",
  "ОТРАСЛЕВЫЕ ИССЛЕДОВАНИЯ", "ПРОГРАММА МЕНТОРИНГА", "СТРАТЕГИЯ НАСЛЕДИЯ", "БЛАГОТВОРИТЕЛЬНОСТЬ",
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

        <div className="flex flex-wrap gap-2.5 md:gap-3">
          {toolBadges.map((label) => (
            <div
              key={label}
              className="group cursor-default inline-flex items-center gap-2.5 md:gap-3 px-3.5 md:px-4 py-2.5 md:py-3 rounded-full neon-card"
            >
              <div className="w-6 h-6 md:w-7 md:h-7 shrink-0 flex items-center justify-center rounded-md bg-gold/10 text-gold">
                <svg className="w-3.5 h-3.5 md:w-4 md:h-4" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  {toolIcons[label] ?? toolIcons["ФОРУМ-ГРУППЫ"]}
                </svg>
              </div>
              <span className="uppercase text-[9px] md:text-[10px] font-semibold tracking-[0.18em] text-foreground/90 group-hover:text-gold transition-colors whitespace-nowrap">
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* Decorative full-bleed visual band with overlay headline */
function VisualBand({
  image,
  eyebrow,
  title,
  height = "h-[420px] md:h-[520px]",
  contained = false,
}: {
  image: string;
  eyebrow?: string;
  title: React.ReactNode;
  height?: string;
  contained?: boolean;
}) {
  const content = (
    <>
      <img src={image} alt="" loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-background/30" />
      <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-background/50" />
      <div className="container-prose relative z-10 h-full flex flex-col justify-center">
        <div className={`${contained ? "max-w-3xl" : "max-w-2xl"}`}>
          {eyebrow && (
            <div className="flex items-center gap-3 mb-6">
              <span className="h-px w-12 bg-gold" />
              <span className="text-[10px] uppercase tracking-[0.4em] text-gold font-semibold">{eyebrow}</span>
            </div>
          )}
          <h2 className={contained ? "font-display text-4xl md:text-5xl leading-[1.04]" : "font-display text-4xl md:text-6xl lg:text-7xl leading-[1.02]"}>
            {title}
          </h2>
        </div>
      </div>
    </>
  );

  if (contained) {
    return (
      <section className="py-12 md:py-16">
        <div className="container-prose">
          <div className={`relative ${height} overflow-hidden rounded-[2rem] border border-gold/20`}>
            {content}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={`relative ${height} overflow-hidden border-y border-gold/15`}>
      {content}
    </section>
  );
}

function Index() {
  const [joinOpen, setJoinOpen] = useState(false);
  return (
    <div id="top" className="min-h-screen text-foreground relative z-[1]">
      <Nav />
      <ApplyModal open={joinOpen} onClose={() => setJoinOpen(false)} />

      {/* HERO — premium tech direction */}
      <section className="relative overflow-hidden pt-32 md:pt-40 pb-16 md:pb-24 tech-grid">
        <img src={heroImg} alt="" className="absolute inset-0 w-full h-full object-cover opacity-25" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/85 via-background/75 to-background" />
        <div className="absolute -top-40 -right-40 w-[40rem] h-[40rem] rounded-full bg-gold/[0.06] blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 -left-32 w-[28rem] h-[28rem] rounded-full bg-gold/[0.04] blur-[100px] pointer-events-none" />

        <div className="container-prose relative z-10">
          <div className="max-w-5xl">
            <div className="mb-8 flex items-center gap-4">
              <span className="h-px w-16 bg-gradient-to-r from-gold to-transparent" />
              <span className="uppercase tracking-[0.4em] text-[10px] font-semibold text-gold">
                ДЛЯ ИНВЕСТОРОВ С КАПИТАЛОМ ОТ 50 МЛН Р
              </span>
            </div>

            <h1 className="font-display text-6xl sm:text-7xl md:text-8xl lg:text-9xl leading-[0.95] mb-8">
              <span className="block text-foreground/95">ГОРДОСТЬ</span>
              <span className="block text-gold mt-2 text-[clamp(1.25rem,5.5vw,4.5rem)] leading-[1.1]">ИНВЕСТИЦИОННЫЙ КЛУБ</span>
            </h1>

            <p className="text-base md:text-xl text-muted-foreground leading-relaxed max-w-3xl mb-10">
              Для тех, кто приумножает капитал через силу сообщества.
            </p>

            <button
              type="button"
              onClick={() => setJoinOpen(true)}
              className="group relative inline-flex items-center gap-2 overflow-hidden bg-gold px-12 py-5 text-primary-foreground text-[11px] uppercase tracking-[0.2em] font-semibold transition-all duration-500 hover:shadow-[0_0_40px_rgba(221,201,169,0.3)]"
            >
              <span className="relative z-10">Стать резидентом</span>
              <span aria-hidden className="relative z-10">→</span>
            </button>
          </div>

        </div>
      </section>

      <ToolsStrip />

      <section id="focus" className="py-14 md:py-18">
        <div className="container-prose">
          <h2 className="font-display text-4xl md:text-6xl leading-[1.05] max-w-4xl">
            Место, где сильные <span className="gold-gradient">делают сделки с сильными</span>
          </h2>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="pt-6 md:pt-8 pb-20 md:pb-28">
        <div className="container-prose">
          <div className="grid lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-12">
              <p className="max-w-2xl text-lg text-muted-foreground leading-relaxed">
                <span className="text-foreground/95 font-medium">«Гордость»</span> — это пространство возможностей,
                вдохновляющее на рост и развитие. Среда, в которой ваш капитал начинает расти иначе — через людей,
                доверие и коллективную экспертизу.
              </p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-20">
            {aboutBullets.map((p, i) => (
              <div
                key={p.t}
                className="group relative rounded-2xl border border-border bg-card/40 p-8 hover:border-gold/40 hover:bg-card/70 transition-all duration-500"
              >
                <span className="absolute top-6 right-6 font-display text-xs text-gold/40 tabular-nums">0{i + 1}</span>
                <h3 className="font-display text-xl md:text-2xl mb-3 text-foreground group-hover:text-gold transition-colors">{p.t}</h3>
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

      {/* HOW IT WORKS — image cards */}
      <section id="how" className="relative py-20 md:py-28 bg-card/35 border-y border-border">
        <div className="container-prose">
          <SectionLabel align="left">Как это работает</SectionLabel>
          <h2 className="font-display text-4xl md:text-6xl leading-[1.08] tracking-wide uppercase max-w-5xl">
            Уникальная комбинация
            <br />
            <span className="gold-gradient">возможностей клуба</span>
          </h2>

          <div className="grid md:grid-cols-2 gap-5 mt-14">
            {howItWorks.map((b) => (
              <article
                key={b.n}
                className="group relative rounded-[2rem] overflow-hidden neon-card"
              >
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={b.img}
                    alt=""
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
                  <div className="absolute top-5 left-5 flex items-center gap-3">
                    <span className="font-display text-2xl gold-gradient tabular-nums">{b.n}</span>
                    <span className="h-px w-10 bg-gold/60" />
                  </div>
                  <h3 className="absolute bottom-5 left-5 right-5 font-display text-2xl md:text-3xl text-foreground">{b.t}</h3>
                </div>
                <ul className="p-7 space-y-3">
                  {b.items.map((it) => (
                    <li key={it} className="flex items-start gap-3 text-sm text-muted-foreground leading-relaxed">
                      <span className="text-gold mt-1.5 shrink-0 text-[8px]">◆</span>
                      <span>{it}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Visual band — Lifestyle */}
      <VisualBand
        image={lifestyleImg}
        eyebrow="Lifestyle"
        title={<>Третье место, <span className="gold-gradient">где рождаются сделки</span></>}
      />

      {/* FOUNDATION */}
      <section className="py-20 md:py-28">
        <div className="container-prose">
          <SectionLabel align="left">Фундамент</SectionLabel>
          <SectionTitle align="left" className="max-w-3xl">
            На чём мы <span className="gold-gradient">строим клуб</span>
          </SectionTitle>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-14">
            {foundation.map((p, i) => (
              <div
                key={p.t}
                className="relative rounded-2xl border border-border bg-card/40 p-8 pt-12 hover:border-gold/35 transition-colors"
              >
                <span className="absolute top-5 right-6 font-display text-xs text-gold/35 tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="font-display text-lg md:text-xl mb-3 text-gold">{p.t}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{p.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ECOSYSTEM — image cards */}
      <section id="ecosystem" className="py-20 md:py-28 bg-card/35 border-y border-border">
        <div className="container-prose">
          <SectionLabel align="left">Экосистема клуба</SectionLabel>
          <SectionTitle align="left" className="max-w-3xl">
            Календарь и события
          </SectionTitle>

          <div className="grid md:grid-cols-2 gap-5 mt-12">
            {ecosystem.map((e, i) => (
              <article
                key={e.t}
                className="group relative rounded-[2rem] overflow-hidden border border-border h-[340px] hover:border-gold/40 transition-all duration-500"
              >
                <img src={e.img} alt="" loading="lazy" className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/20" />
                <div className="relative z-10 h-full flex flex-col justify-end p-8">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-gold/60 text-xs tabular-nums">0{i + 1}</span>
                    <span className="h-px w-8 bg-gold/40" />
                  </div>
                  <h3 className="font-display text-2xl md:text-3xl text-gold mb-3">{e.t}</h3>
                  <p className="text-muted-foreground leading-relaxed text-sm md:text-base max-w-md">{e.d}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <JoinCTA
        variant="banner"
        onOpenJoin={() => setJoinOpen(true)}
        eyebrow="Календарь резидента"
        title="Доступ к закрытым событиям и форматам клуба"
        cta="Стать резидентом"
      />

      {/* FOUNDER */}
      <section id="forum" className="py-20 md:py-28 border-t border-border">
        <div className="container-prose">
          {/* Photo + Name row */}
          <div className="flex flex-col md:flex-row gap-8 md:gap-14 items-center md:items-end mb-16 md:mb-20">
            <div className="w-48 md:w-56 shrink-0">
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
            <div className="text-center md:text-left">
              <SectionLabel align="center" className="md:[&]:text-left">Основатель</SectionLabel>
              <h2 className="font-display text-3xl md:text-4xl lg:text-5xl mt-3">
                Андрей <span className="gold-gradient">Плахотнюк</span>
              </h2>
              <p className="text-muted-foreground text-base md:text-lg leading-relaxed mt-4 max-w-xl">
                Экономист и банкир. 15 лет в финансах: банки, страхование, инвестиции. Основатель клуба «Гордость» и
                сообщества «ИнвестБаня».
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16 md:mb-20">
            {[
              { v: "6 000+", l: "проектов рассмотрено" },
              { v: "5+ млрд ₽", l: "привлечённый капитал" },
              { v: "1 200+", l: "резидентов «ИнвестБани»" },
              { v: "2018", l: "в инвестициях с" },
            ].map((s) => (
              <div key={s.l} className="rounded-xl border border-border bg-card/30 p-5 md:p-6 text-center">
                <div className="font-display text-xl md:text-2xl lg:text-3xl gold-gradient">{s.v}</div>
                <div className="text-[10px] md:text-[11px] uppercase tracking-widest text-muted-foreground mt-2">{s.l}</div>
              </div>
            ))}
          </div>

          {/* Qualifications */}
          <div className="mb-16 md:mb-20">
            <SectionLabel align="left">Ключевые квалификации</SectionLabel>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
              {[
                { year: "2015", title: "ICA Compliance", desc: "International Certificate — с отличием" },
                { year: "2021", title: "Erickson Coaching", desc: "128 ч, аккредитация ICF" },
                { year: "2023", title: "Венчурная аналитика", desc: "Московский инновационный кластер" },
                { year: "2025", title: "Путь IPO", desc: "Московская биржа" },
              ].map((q) => (
                <div key={q.title} className="rounded-xl border border-border bg-card/30 p-5 group hover:border-gold/30 transition-colors">
                  <div className="text-[10px] uppercase tracking-widest text-gold/60 mb-1">{q.year}</div>
                  <div className="font-display text-sm md:text-base text-foreground">{q.title}</div>
                  <div className="text-xs text-muted-foreground mt-1">{q.desc}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-14">
            <SectionLabel align="left">Образование</SectionLabel>
            <ul className="mt-4 space-y-3">
              {[
                { y: "2009", t: "Амурский государственный университет", d: "Экономист" },
                { y: "2014", t: "Финансовый университет при Правительстве РФ", d: "Вторая специальность" },
              ].map((e) => (
                <li key={e.y} className="flex gap-4 items-baseline">
                  <span className="text-gold/50 font-display text-xs shrink-0 w-10">{e.y}</span>
                  <div>
                    <div className="text-sm font-medium text-foreground">{e.t}</div>
                    <div className="text-xs text-muted-foreground">{e.d}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* CTA */}
          <div className="text-center md:text-left">
            <button
              type="button"
              onClick={() => setJoinOpen(true)}
              className="inline-flex items-center gap-2 rounded-full bg-gold px-8 py-3.5 text-primary-foreground text-[11px] uppercase tracking-[0.2em] hover:opacity-90 transition-opacity"
            >
              Заявка на вступление <span aria-hidden>→</span>
            </button>
          </div>
        </div>
      </section>

      {/* DIGITAL / CONCIERGE — AI abstract bg */}
      <section id="digital" className="relative py-20 md:py-28 overflow-hidden">
        <img src={aiAbstractImg} alt="" loading="lazy" className="absolute inset-0 w-full h-full object-cover opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/85 to-background" />
        <div className="container-prose relative">
          <SectionLabel align="left">Консьерж</SectionLabel>
          <SectionTitle align="left" className="max-w-3xl">
            Цифровой <span className="gold-gradient">консьерж</span>
          </SectionTitle>
          <p className="max-w-2xl mt-8 text-lg text-muted-foreground leading-relaxed">
            Ваше время — самый дорогой актив. AI-консьерж сокращает поиск контактов и смыслов в потоке сообщений.
          </p>

          <div className="grid md:grid-cols-3 gap-4 mt-12">
            {digital.map((d, i) => (
              <div key={d.t} className="rounded-2xl border border-border bg-background/70 backdrop-blur-sm p-8">
                <div className="flex items-center justify-between mb-5">
                  <div className="w-10 h-10 rounded-full border border-gold/50 flex items-center justify-center text-gold text-sm">
                    ◆
                  </div>
                  <span className="font-display text-xs text-gold/40 tabular-nums">0{i + 1}</span>
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
              <button
                type="button"
                onClick={() => setJoinOpen(true)}
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-gold px-8 py-3.5 text-primary-foreground text-[11px] uppercase tracking-[0.2em] hover:opacity-90 transition-opacity"
              >
                Подать заявку <span aria-hidden>→</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      <JoinCTA
        variant="solid"
        onOpenJoin={() => setJoinOpen(true)}
        eyebrow="Связаться"
        title="Готовы познакомиться с клубом?"
        text="Оставьте заявку — мы предложим формат интервью и ответим на вопросы о вступлении."
        cta="Стать резидентом"
      />

      <section className="pb-10 md:pb-14">
        <div className="container-prose">
          <div className="rounded-[2rem] neon-panel p-7 md:p-10">
            <div className="grid md:grid-cols-[1.1fr_2fr] gap-8 md:gap-10 items-center">
              <div className="space-y-4">
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Революционизируем инвестиционный клубный опыт: проверенные сделки, сильное окружение и инструменты для роста.
                </p>
                <div className="w-14 h-14 rounded-full border border-gold/35 flex items-center justify-center text-gold">
                  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <path d="M4 4h16v16" />
                    <path d="M6 18L18 6" />
                  </svg>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-px bg-border/70 rounded-2xl overflow-hidden">
                {heroMetrics.map((m) => (
                  <div key={m.l} className="bg-background/55 p-6 md:p-7">
                    <div className="font-display text-3xl md:text-4xl text-gold mb-2">{m.v}</div>
                    <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{m.l}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

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
                href="https://t.me/gordost_club_bot"
                target="_blank"
                rel="noopener noreferrer"
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
