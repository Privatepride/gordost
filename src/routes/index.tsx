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

function ToolsStrip() {
  return (
    <section className="border-y border-border bg-card/30" aria-label="Инструменты клуба">
      <div className="container-prose py-8 md:py-10">
        <p className="text-center text-[10px] uppercase tracking-[0.35em] text-gold/80 mb-6">
          Инструменты клуба
        </p>
        <div className="flex flex-wrap justify-center gap-2 md:gap-3">
          {toolBadges.map((label) => (
            <span
              key={label}
              className="rounded-full border border-gold/25 bg-background/40 px-4 py-2 text-[10px] md:text-[11px] uppercase tracking-[0.22em] text-gold/95"
            >
              {label}
            </span>
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

      {/* HERO */}
      <section className="relative overflow-hidden pt-40 md:pt-48 pb-20 md:pb-28">
        <img
          src={heroImg}
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-[0.35]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/75 to-background" />
        <div className="absolute inset-0 bg-gradient-to-r from-background from-45% via-transparent to-transparent" />

        <div className="container-prose relative z-10">
          <div className="max-w-3xl">
            <h1 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl leading-[0.98] mb-8">
              <span className="block gold-gradient">ГОРДОСТЬ</span>
            </h1>

            <p className="text-xl md:text-2xl text-foreground/95 mb-2 font-light">
              Инвестиционный клуб
            </p>
            <p className="text-base md:text-lg text-gold italic mb-8">
              для инвесторов с капиталом от 50 млн
            </p>

            <p className="text-lg md:text-xl text-muted-foreground max-w-xl leading-relaxed mb-10">
              Для тех, кто приумножает капитал через силу сообщества.
            </p>

            <a
              href="#join"
              className="inline-flex items-center gap-2 rounded-full bg-gold px-8 py-3.5 text-primary-foreground text-[11px] uppercase tracking-[0.2em] hover:opacity-90 transition-opacity"
            >
              Стать резидентом <span aria-hidden>→</span>
            </a>
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
