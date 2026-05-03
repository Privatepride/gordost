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

function Index() {
  return (
    <div id="top" className="min-h-screen text-foreground">
      <Nav />

      {/* HERO */}
      <section className="relative min-h-[100svh] flex items-center overflow-hidden">
        <img
          src={heroImg}
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/50 to-background" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/30 to-transparent" />

        <div className="container-prose relative z-10 pt-32 pb-20">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-8">
              <span className="h-px w-12 bg-gold" />
              <span className="text-xs uppercase tracking-[0.4em] text-gold">
                Инвестиционный клуб
              </span>
            </div>

            <h1 className="font-display text-5xl md:text-7xl lg:text-8xl leading-[0.95] mb-8">
              <span className="block gold-gradient">ГОРДОСТЬ</span>
              <span className="block text-foreground/90 text-3xl md:text-5xl lg:text-6xl mt-4 italic font-light">
                Правильные люди<br />в правильном месте
              </span>
            </h1>

            <p className="text-base md:text-lg text-muted-foreground max-w-2xl leading-relaxed mb-4">
              Закрытое сообщество инвесторов с капиталом{" "}
              <span className="text-gold">от 50 млн ₽</span>. Объединяем ресурсы, опыт
              и капитал для устойчивого роста благосостояния.
            </p>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl leading-relaxed mb-10">
              Две столицы — единое пространство. Москва и Санкт-Петербург.
            </p>

            <div className="flex flex-wrap items-center gap-4 mb-12">
              <a
                href="#join"
                className="inline-flex items-center gap-3 px-8 py-4 bg-gold text-primary-foreground uppercase tracking-[0.2em] text-sm font-medium hover:bg-gold/90 transition-all hover:gap-5"
              >
                Стать резидентом
                <span>→</span>
              </a>
              <a
                href="#about"
                className="inline-flex items-center gap-3 px-8 py-4 border border-border text-foreground uppercase tracking-[0.2em] text-sm hover:border-gold hover:text-gold transition-colors"
              >
                О клубе
              </a>
            </div>

            <div className="flex flex-wrap gap-x-8 gap-y-3 text-sm text-muted-foreground">
              {["Проверенные сделки", "Сильное окружение", "Совместное развитие"].map((t) => (
                <div key={t} className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-gold" />
                  <span className="uppercase tracking-wider text-xs">{t}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <JoinCTA variant="minimal" cta="Узнать о вступлении" />

      {/* ABOUT */}
      <section id="about" className="py-28 md:py-36 relative">
        <div className="container-prose">
          <SectionLabel>О нас</SectionLabel>
          <SectionTitle>
            Место, где сильные<br />
            <span className="italic gold-gradient">делают сделки с сильными</span>
          </SectionTitle>

          <p className="max-w-3xl mx-auto mt-10 text-center text-lg text-muted-foreground leading-relaxed">
            «Гордость» — это больше, чем инвестиции. Это среда, где доверие и
            безукоризненная репутация становятся фундаментом для роста благосостояния.
            Мы создаём «третье место» между семьёй и бизнесом, где каждый резидент готов
            не только брать, но и отдавать.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px mt-20 bg-border">
            {principles.map((p, i) => (
              <div
                key={p.t}
                className="bg-background p-10 hover:bg-card transition-colors group"
              >
                <div className="text-xs text-gold/60 mb-4 tracking-widest">
                  0{i + 1}
                </div>
                <h3 className="font-display text-2xl mb-3 group-hover:text-gold transition-colors">
                  {p.t}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{p.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <JoinCTA
        variant="solid"
        eyebrow="Присоединиться"
        title="Разделяете наши ценности?"
        text="Сделайте первый шаг к сообществу, где репутация и доверие становятся капиталом."
        cta="Стать резидентом"
      />

      {/* FORUM */}
      <section id="forum" className="py-28 md:py-36 bg-card/40 relative">
        <div className="container-prose">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <span className="h-px w-10 bg-gold" />
                <span className="text-xs uppercase tracking-[0.4em] text-gold">
                  Форум-группы
                </span>
              </div>
              <h2 className="font-display text-4xl md:text-5xl leading-tight mb-6">
                Ближний круг <span className="italic gold-gradient">равных</span>
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed mb-4">
                Это не обучение и не мастермайнд. Это формирование близости качественно
                другого уровня.
              </p>
            </div>

            <div className="space-y-px bg-border">
              {[
                { t: "Ваш персональный борд", d: "6–10 человек из разных сфер, которые видят вашу ситуацию под углом 360°." },
                { t: "Эмоциональная растяжка", d: "Несколько слоёв глубже поверхностного общения. Точка роста уровня счастья и качества жизни." },
                { t: "Безопасная территория", d: "Полная конфиденциальность и запрет на партнёрства внутри группы — вы услышите правду." },
                { t: "Стать наставником", d: "Возможность передать свой опыт и увидеть, как он меняет жизни других." },
              ].map((b) => (
                <div key={b.t} className="bg-background p-7">
                  <h4 className="text-gold font-medium mb-2 tracking-wide">{b.t}</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">{b.d}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <JoinCTA
        variant="split"
        eyebrow="Форум-группа"
        title="Войдите в свой круг равных"
        text="Места в форум-группах ограничены. Запишитесь на интервью, чтобы найти свой борд."
        cta="Записаться"
      />

      {/* ECOSYSTEM */}
      <section id="ecosystem" className="py-28 md:py-36">
        <div className="container-prose">
          <SectionLabel>Экосистема клуба</SectionLabel>
          <SectionTitle>Календарь и события</SectionTitle>

          <div className="grid md:grid-cols-2 gap-6 mt-16">
            {ecosystem.map((e, i) => (
              <div key={e.t} className="glass p-8 hover:border-gold/40 transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="font-display text-2xl text-gold">{e.t}</h3>
                  <span className="text-gold/40 text-sm">0{i + 1}</span>
                </div>
                <p className="text-muted-foreground leading-relaxed">{e.d}</p>
              </div>
            ))}
          </div>

          <div className="mt-20">
            <h3 className="font-display text-3xl md:text-4xl text-center mb-12">
              Мероприятия <span className="italic gold-gradient">«на любой запрос»</span>
            </h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {requests.map((r) => (
                <div
                  key={r.k}
                  className="border border-border p-6 text-center hover:border-gold transition-colors"
                >
                  <div className="text-xs uppercase tracking-widest text-gold mb-3">
                    {r.k}
                  </div>
                  <p className="text-sm text-muted-foreground">{r.v}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <JoinCTA
        variant="banner"
        eyebrow="Календарь резидента"
        title="Получите доступ к закрытым событиям клуба"
        cta="Стать резидентом"
      />

      {/* FOUNDER */}
      <section className="py-28 md:py-36 bg-card/40">
        <div className="container-prose grid lg:grid-cols-5 gap-12 items-center">
          <div className="lg:col-span-2">
            <div className="relative aspect-[4/5] overflow-hidden border border-gold/20" style={{ background: "linear-gradient(160deg, #1A2030 0%, #0D1119 100%)" }}>
              <div className="absolute inset-0 opacity-30" style={{ background: "radial-gradient(circle at 70% 40%, rgba(221,201,169,0.25), transparent 60%)" }} />
              <img
                src={founderImg}
                alt="Андрей Плахотнюк"
                loading="lazy"
                className="absolute inset-0 w-full h-full object-contain object-bottom"
              />
            </div>
          </div>
          <div className="lg:col-span-3">
            <div className="flex items-center gap-3 mb-6">
              <span className="h-px w-10 bg-gold" />
              <span className="text-xs uppercase tracking-[0.4em] text-gold">Основатель</span>
            </div>
            <h2 className="font-display text-4xl md:text-5xl mb-6">
              Андрей <span className="italic gold-gradient">Плахотнюк</span>
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-10">
              За его плечами более ₽5 млрд привлечённого финансирования, 6000+
              рассмотренных проектов и два экономических образования. В инвестициях с 2018
              года, а уже в 2019 Андрей создал «ИнвестБаню» — сообщество, которое
              объединило 1200+ резидентов.
            </p>
            <div className="grid grid-cols-3 gap-6 border-t border-border pt-8">
              {[
                { v: "5 млрд ₽", l: "привлечено" },
                { v: "6 000+", l: "проектов" },
                { v: "1 200+", l: "резидентов" },
              ].map((s) => (
                <div key={s.l}>
                  <div className="font-display text-3xl md:text-4xl gold-gradient">{s.v}</div>
                  <div className="text-xs uppercase tracking-widest text-muted-foreground mt-2">
                    {s.l}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <JoinCTA variant="minimal" cta="Лично познакомиться с основателем" />

      {/* FOCUS */}
      <section id="focus" className="py-28 md:py-36">
        <div className="container-prose">
          <SectionLabel>Инвестиционный фокус</SectionLabel>
          <SectionTitle>
            Доступ к сделкам,<br />
            которые <span className="italic gold-gradient">не выходят на рынок</span>
          </SectionTitle>
          <p className="max-w-3xl mx-auto text-center text-lg text-muted-foreground mt-10">
            Экспертный совет клуба — это не теоретики, а опытные архитекторы сделок.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px mt-16 bg-border">
            {focus.map((f, i) => (
              <div key={f} className="bg-background p-8 group">
                <div className="font-display text-5xl text-gold/30 mb-4 group-hover:text-gold/60 transition-colors">
                  0{i + 1}
                </div>
                <p className="text-foreground/90">{f}</p>
              </div>
            ))}
          </div>

          <div className="mt-16 grid md:grid-cols-2 gap-6">
            <div className="border border-gold/30 p-8">
              <div className="text-xs uppercase tracking-widest text-gold mb-3">
                Белый и чёрный списки
              </div>
              <p className="text-foreground/90 leading-relaxed">
                Экономьте миллионы на ошибках, используя коллективный опыт и проверенную
                базу подрядчиков.
              </p>
            </div>
            <div className="border border-gold/30 p-8">
              <div className="text-xs uppercase tracking-widest text-gold mb-3">
                Спецусловия
              </div>
              <p className="text-foreground/90 leading-relaxed">
                Эксклюзивные условия в лучших локациях и сервисах Москвы и СПб, доступные
                только резидентам.
              </p>
            </div>
          </div>
        </div>
      </section>

      <JoinCTA
        variant="outline"
        eyebrow="Доступ к сделкам"
        title="Откройте сделки за пределами рынка"
        text="Резиденты получают приоритетный доступ к сделкам и аналитике клуба."
        cta="Подать заявку"
      />

      {/* DIGITAL */}
      <section id="digital" className="py-28 md:py-36 relative overflow-hidden">
        <img
          src={citiesImg}
          alt=""
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover opacity-15"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/80 to-background" />
        <div className="container-prose relative">
          <SectionLabel>OpenClaw</SectionLabel>
          <SectionTitle>
            Ваш цифровой <span className="italic gold-gradient">консьерж</span>
          </SectionTitle>
          <p className="max-w-2xl mx-auto text-center text-lg text-muted-foreground mt-10">
            Ваше время — самый дорогой актив. Мы внедрили AI-консьержа, который заменяет
            сотни часов чтения чатов и поиска контактов.
          </p>

          <div className="grid md:grid-cols-3 gap-6 mt-16">
            {digital.map((d) => (
              <div key={d.t} className="glass p-8">
                <div className="w-10 h-10 rounded-full border border-gold flex items-center justify-center text-gold mb-6">
                  ◆
                </div>
                <h3 className="font-display text-2xl mb-3 text-foreground">{d.t}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{d.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <JoinCTA
        variant="banner"
        eyebrow="OpenClaw"
        title="Получите своего AI-консьержа"
        cta="Стать резидентом"
      />

      {/* RESIDENT PROFILE + JOIN */}
      <section id="join" className="py-28 md:py-36 bg-card/40">
        <div className="container-prose">
          <div className="grid lg:grid-cols-2 gap-16">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <span className="h-px w-10 bg-gold" />
                <span className="text-xs uppercase tracking-[0.4em] text-gold">
                  Портрет резидента
                </span>
              </div>
              <h2 className="font-display text-4xl md:text-5xl mb-8 leading-tight">
                Кто вступает в <span className="italic gold-gradient">«Гордость»</span>
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed mb-8">
                Мы объединяем инвесторов с капиталом{" "}
                <span className="text-gold">от 50 млн ₽</span> и доходом{" "}
                <span className="text-gold">от 1 млн ₽ в месяц</span>.
              </p>
              <ul className="space-y-4">
                {[
                  "Стремление к росту и открытость новому опыту",
                  "Готовность разделять ценности клуба",
                  "Положительная деловая репутация",
                ].map((c) => (
                  <li key={c} className="flex items-start gap-4">
                    <span className="text-gold mt-1">◆</span>
                    <span className="text-foreground/90">{c}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <div className="flex items-center gap-3 mb-6">
                <span className="h-px w-10 bg-gold" />
                <span className="text-xs uppercase tracking-[0.4em] text-gold">
                  Процесс вступления
                </span>
              </div>
              <h3 className="font-display text-3xl md:text-4xl mb-10">
                Четыре шага в клуб
              </h3>
              <div className="space-y-6">
                {steps.map((s) => (
                  <div key={s.n} className="flex gap-6 border-b border-border pb-6">
                    <div className="font-display text-3xl gold-gradient">{s.n}</div>
                    <div>
                      <div className="font-medium text-foreground mb-1">{s.t}</div>
                      <div className="text-sm text-muted-foreground">{s.d}</div>
                    </div>
                  </div>
                ))}
              </div>

              <a
                href="#"
                className="mt-10 inline-flex items-center gap-3 px-8 py-4 bg-gold text-primary-foreground uppercase tracking-[0.2em] text-sm font-medium hover:bg-gold/90 transition-all hover:gap-5"
              >
                Подать заявку
                <span>→</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-border py-16">
        <div className="container-prose">
          <div className="grid md:grid-cols-3 gap-10 mb-12">
            <div>
              <div className="font-display text-3xl tracking-[0.3em] text-gold mb-4">
                ГОРДОСТЬ
              </div>
              <p className="text-sm text-muted-foreground italic">
                Правильные люди в правильном месте.
              </p>
            </div>
            <div>
              <div className="text-xs uppercase tracking-widest text-gold mb-4">
                Контакты
              </div>
              <div className="space-y-3">
                <a
                  href="#"
                  className="inline-flex items-center gap-2 px-4 py-2 border border-gold/40 text-foreground hover:border-gold hover:text-gold transition-colors text-sm"
                >
                  Telegram-бот
                </a>
              </div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-widest text-gold mb-4">
                Города
              </div>
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
              125480, г. Москва, муниципальный округ Северное Тушино вн.тер.г.,
              ул. Планерная, д. 5
            </div>
            <div>ИНН 280106776632 · ОГРНИП 325774600796691</div>
            <div className="mt-4">© {new Date().getFullYear()} Гордость. Все права защищены.</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
