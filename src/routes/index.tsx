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
          "Закрытое сообщество инвесторов с капиталом от 50 млн ₽. Москва и Санкт-Петербург. Сделки, форум-группы, экспертиза.",
      },
      { property: "og:title", content: "ГОРДОСТЬ — Инвестиционный клуб" },
      { property: "og:description", content: "Правильные люди в правильном месте." },
    ],
  }),
  component: Index,
});

const principles = [
  { t: "Игра в долгую", d: "Стратегия устойчивого роста выше сиюминутной выгоды." },
  { t: "Добропорядочность", d: "Мы дорожим репутацией каждого участника." },
  { t: "Социальная ответственность", d: "Поддерживаем благотворительные и социальные инициативы." },
  { t: "Партнёрство", d: "Взаимная поддержка — фундамент отношений резидентов." },
  { t: "Капитал", d: "Ваши возможности усиливаются ресурсами всего сообщества." },
  { t: "Сила и успех", d: "Лидеры, которые поддерживают высокие стандарты." },
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
    t: "Спорт и культура",
    d: "Регаты, турниры и закрытые выставки — формируем общие воспоминания.",
  },
  {
    t: "Встречи с экспертами",
    d: "Прямой диалог с Андреем Плахотнюком и приглашёнными лидерами рынка.",
  },
];

const requests = [
  { k: "Запрос на деньги", v: "Панельные дискуссии, питч-сессии." },
  { k: "Запрос на отдых", v: "Регаты, ИнвестБаня." },
  { k: "Запрос на глубину", v: "Форум-группы и благотворительность." },
  { k: "Запрос на безопасность", v: "Воркшопы по защите активов." },
];

const focus = [
  "Недвижимость: жилая, коммерция, земля",
  "Фондовый рынок, IPO, OTC",
  "Доходное движимое имущество",
  "Инвестиции в действующий бизнес и займы",
  "Криптовалюты и цифровые активы",
  "Аналитика и отраслевые исследования",
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

const heroStats = [
  { num: "50+", line: "млн ₽", sub: "минимальный капитал" },
  { num: "2", line: "", sub: "города клуба" },
  { num: "6", line: "", sub: "направлений инвестиций" },
  { num: "04", line: "", sub: "шага вступления" },
];

const growthSolutions = [
  { t: "Нетворкинг без одиночества", d: "Контакты и сделки — внутри доверенного круга, без случайных знакомств." },
  { t: "Персональный маршрут", d: "Форум-группы, события и экспертиза под ваш текущий запрос." },
  { t: "Честность и глубина", d: "Ценят путь и опыт, а не только итоговые цифры." },
  { t: "Консьерж и AI", d: "Связи и смыслы быстрее, чем бесконечный поток чатов." },
  { t: "Сильные форматы", d: "От панельных дискуссий до ИнвестБани и спорта." },
];

const toolBadges = [
  "ФОРУМ-ГРУППЫ",
  "ИНВЕСТБАНЯ",
  "ПАНЕЛЬНЫЕ ДИСКУССИИ",
  "СПОРТ И КУЛЬТУРА",
  "ЭКСПЕРТНЫЙ СОВЕТ",
  "ЗАКРЫТЫЕ СДЕЛКИ",
  "КОНСЬЕРЖ",
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

      {/* HERO — крупный блок + сетка метрик как на atlanty.ru */}
      <section className="relative min-h-[min(100svh,920px)] flex flex-col justify-end overflow-hidden pb-16 md:pb-24 pt-28">
        <img
          src={heroImg}
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-[0.35]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/75 to-background" />
        <div className="absolute inset-0 bg-gradient-to-r from-background from-45% via-transparent to-transparent" />

        <div className="container-prose relative z-10">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-end">
            <div className="lg:col-span-7">
              <p className="text-[11px] uppercase tracking-[0.45em] text-gold mb-5">Инвестиционный клуб · Москва и СПб</p>

              <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-[0.98] mb-6">
                <span className="block gold-gradient">ГОРДОСТЬ</span>
                <span className="block text-foreground/95 text-2xl sm:text-3xl md:text-4xl lg:text-5xl mt-4 font-light tracking-tight">
                  Правильные люди
                  <br />
                  в правильном месте
                </span>
              </h1>

              <p className="text-base md:text-lg text-muted-foreground max-w-xl leading-relaxed mb-3">
                Закрытое сообщество инвесторов с капиталом{" "}
                <span className="text-gold">от 50 млн ₽</span>. Объединяем ресурсы, опыт и капитал для устойчивого роста
                благосостояния.
              </p>

              <div className="flex flex-wrap gap-3 mt-8">
                <a
                  href="#join"
                  className="inline-flex items-center gap-2 rounded-full bg-gold px-8 py-3.5 text-primary-foreground text-[11px] uppercase tracking-[0.2em] hover:opacity-90 transition-opacity"
                >
                  Стать резидентом <span aria-hidden>→</span>
                </a>
                <a
                  href="#about"
                  className="inline-flex items-center gap-2 rounded-full border border-border px-8 py-3.5 text-foreground text-[11px] uppercase tracking-[0.2em] hover:border-gold hover:text-gold transition-colors"
                >
                  О клубе
                </a>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="grid grid-cols-2 gap-3">
                {heroStats.map((s) => (
                  <div
                    key={s.sub}
                    className="rounded-2xl border border-border bg-background/60 backdrop-blur-sm px-5 py-5 md:px-6 md:py-6"
                  >
                    <div className="font-display text-3xl md:text-4xl gold-gradient leading-none">
                      {s.num}
                      {s.line ? (
                        <span className="text-lg md:text-xl text-foreground/80 font-sans align-top ml-0.5">{s.line}</span>
                      ) : null}
                    </div>
                    <p className="mt-3 text-[11px] md:text-xs uppercase tracking-[0.12em] text-muted-foreground leading-snug">
                      {s.sub}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <JoinCTA variant="minimal" cta="Узнать о вступлении" />

      <ToolsStrip />

      {/* ABOUT */}
      <section id="about" className="py-20 md:py-28">
        <div className="container-prose">
          <SectionLabel align="left">О клубе</SectionLabel>
          <SectionTitle align="left" className="max-w-4xl">
            Место, где сильные <span className="gold-gradient">делают сделки с сильными</span>
          </SectionTitle>

          <p className="max-w-2xl mt-8 text-lg text-muted-foreground leading-relaxed">
            «Гордость» — это больше, чем инвестиции. Это среда, где доверие и безукоризненная репутация становятся
            фундаментом для роста благосостояния. «Третье место» между семьёй и бизнесом.
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-14">
            {principles.map((p) => (
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

      {/* РЕШЕНИЯ ДЛЯ РОСТА — блок как у Атлантов */}
      <section className="py-20 md:py-28 bg-card/35 border-y border-border">
        <div className="container-prose">
          <p className="text-[11px] uppercase tracking-[0.35em] text-gold mb-4">Решения для вашего роста</p>
          <h2 className="font-display text-3xl md:text-5xl max-w-3xl leading-tight mb-12">
            Сообщество, команда и инструменты — в одной системе координат
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {growthSolutions.map((g) => (
              <div key={g.t} className="rounded-2xl border border-border bg-background/50 p-7">
                <h3 className="font-display text-lg md:text-xl text-gold mb-3">{g.t}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{g.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FORUM */}
      <section id="forum" className="py-20 md:py-28">
        <div className="container-prose grid lg:grid-cols-2 gap-12 lg:gap-16 items-stretch">
          <div className="order-2 lg:order-1 flex flex-col justify-center">
            <SectionLabel align="left">Форум-группы</SectionLabel>
            <h2 className="font-display text-3xl md:text-5xl leading-tight mb-6 text-left">
              Ближний круг <span className="gold-gradient">равных</span>
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-8">
              Это не обучение и не мастермайнд. Это формирование близости качественно другого уровня.
            </p>
            <div className="space-y-4">
              {[
                { t: "Ваш персональный борд", d: "6–10 человек из разных сфер, которые видят вашу ситуацию под углом 360°." },
                { t: "Эмоциональная растяжка", d: "Несколько слоёв глубже поверхностного общения." },
                { t: "Безопасная территория", d: "Конфиденциальность и запрет на партнёрства внутри группы." },
                { t: "Стать наставником", d: "Передать опыт и увидеть, как он меняет жизни других." },
              ].map((b) => (
                <div key={b.t} className="rounded-xl border border-border bg-card/30 px-5 py-4">
                  <h4 className="text-gold text-sm font-medium mb-1 tracking-wide">{b.t}</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">{b.d}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="order-1 lg:order-2 relative min-h-[280px] lg:min-h-[420px] rounded-2xl overflow-hidden border border-border">
            <img src={citiesImg} alt="" className="absolute inset-0 w-full h-full object-cover opacity-90" />
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

          <h3 className="font-display text-2xl md:text-3xl mt-16 mb-8 text-left max-w-3xl">
            Мероприятия <span className="gold-gradient">«на любой запрос»</span>
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {requests.map((r) => (
              <div key={r.k} className="rounded-xl border border-border p-6 text-center hover:border-gold/40 transition-colors bg-background/40">
                <div className="text-[10px] uppercase tracking-[0.2em] text-gold mb-3">{r.k}</div>
                <p className="text-sm text-muted-foreground">{r.v}</p>
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

      {/* FOCUS */}
      <section id="focus" className="py-20 md:py-28 bg-card/35">
        <div className="container-prose">
          <SectionLabel align="left">Инвестиционный фокус</SectionLabel>
          <SectionTitle align="left" className="max-w-4xl">
            Доступ к сделкам, <span className="gold-gradient">не выходящим на рынок</span>
          </SectionTitle>
          <p className="max-w-2xl mt-8 text-muted-foreground text-lg leading-relaxed">
            Экспертный совет клуба — это не теоретики, а опытные архитекторы сделок.
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-12">
            {focus.map((f, i) => (
              <div key={f} className="rounded-2xl border border-border bg-background/50 p-7 group hover:border-gold/30 transition-colors">
                <div className="font-display text-4xl text-gold/25 mb-3 group-hover:text-gold/45 transition-colors tabular-nums">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <p className="text-foreground/90 text-sm md:text-base leading-relaxed">{f}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 grid md:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-gold/25 bg-background/40 p-8">
              <div className="text-[10px] uppercase tracking-[0.2em] text-gold mb-2">Белый и чёрный списки</div>
              <p className="text-foreground/90 leading-relaxed text-sm md:text-base">
                Экономьте миллионы на ошибках, используя коллективный опыт и проверенную базу подрядчиков.
              </p>
            </div>
            <div className="rounded-2xl border border-gold/25 bg-background/40 p-8">
              <div className="text-[10px] uppercase tracking-[0.2em] text-gold mb-2">Спецусловия</div>
              <p className="text-foreground/90 leading-relaxed text-sm md:text-base">
                Эксклюзивные условия в лучших локациях и сервисах Москвы и СПб, доступные только резидентам.
              </p>
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
