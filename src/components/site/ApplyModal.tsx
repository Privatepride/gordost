import { useState, useEffect, useCallback } from "react";
import { CityAutocomplete } from "./CityAutocomplete";

type ApplySource = "gordost" | "mm" | "investbanya";

interface ApplyModalProps {
  open: boolean;
  onClose: () => void;
  source?: ApplySource;
}

const INITIAL_OPTIONS: string[] = [];

const PRIVACY_URL = "https://gordost.club/privacy";

export function ApplyModal({ open, onClose, source = "gordost" }: ApplyModalProps) {
  const isMm = source === "mm";
  const [investOptions, setInvestOptions] = useState<string[]>(INITIAL_OPTIONS);
  const [wantsOptions, setWantsOptions] = useState<string[]>(INITIAL_OPTIONS);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [consent, setConsent] = useState(false);

  const [form, setForm] = useState({
    full_name: "",
    tg_username: "",
    city: "",
    phone: "+7 ",
    email: "",
    capital: "",
    monthly_income: "",
    invest_experience: "",
    invests_in: [] as string[],
    wants_to_invest: [] as string[],
    useful_for_club: "",
    occupation: "",
    personal_requests: "",
  });

  useEffect(() => {
    if (!open) return;
    // Reset form on open
    setForm({
      full_name: "",
      tg_username: "",
      city: "",
      phone: "+7 ",
      email: "",
      capital: "",
      monthly_income: "",
      invest_experience: "",
      invests_in: [] as string[],
      wants_to_invest: [] as string[],
      useful_for_club: "",
      occupation: "",
      personal_requests: "",
    });
    setConsent(false);
    setError("");
    setSent(false);
    fetch("/api/apply-options")
      .then((r) => r.json())
      .then((d) => {
        setInvestOptions(d.invests_in || []);
        setWantsOptions(d.wants_to_invest || []);
      })
      .catch(() => {});
  }, [open]);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    // Keep +7 prefix
    if (!val.startsWith("+7 ")) {
      setForm((f) => ({ ...f, phone: "+7 " + val.replace(/^(\+7\s?)?/, "") }));
    } else {
      setForm((f) => ({ ...f, phone: val }));
    }
  };

  const toggleSelect = (k: "invests_in" | "wants_to_invest", val: string) => () => {
    setForm((f) => ({
      ...f,
      [k]: f[k].includes(val) ? f[k].filter((v) => v !== val) : [...f[k], val],
    }));
  };

  const submit = useCallback(async () => {
    if (!form.full_name.trim() || !form.tg_username.trim() || !consent) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, consent_given: true, source }),
      });
      const d = await res.json().catch(() => ({}));
      if (res.ok) {
        setSent(true);
      } else {
        setError(d.error || "Ошибка отправки");
      }
    } catch {
      setError("Не удалось отправить заявку");
    } finally {
      setLoading(false);
    }
  }, [form, consent, source]);

  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [open, onClose]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  const cls =
    "w-full rounded-xl border border-border bg-background/70 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-gold/60 focus:outline-none transition-colors";
  const labelCls = "block text-[11px] uppercase tracking-[0.2em] text-gold mb-2 font-semibold";

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[3vh] md:pt-[6vh]">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-2xl border border-gold/25 bg-[#0D1119] p-6 md:p-8 shadow-2xl">
        <button
          onClick={onClose}
          aria-label="Закрыть"
          className="absolute top-3 right-3 w-10 h-10 flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors text-2xl"
        >
          &times;
        </button>

        {sent ? (
          <div className="text-center py-12">
            <div className="font-display text-3xl md:text-4xl gold-gradient mb-4">Спасибо!</div>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-sm mx-auto">
              {isMm
                ? "Ваша заявка принята. Мы свяжемся с вами для подтверждения участия в мастермайнде."
                : "Ваша заявка принята. Мы свяжемся с вами в ближайшее время для обсуждения формата интервью."}
            </p>
            <button
              onClick={onClose}
              className="mt-8 inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gold text-primary-foreground text-[11px] uppercase tracking-[0.2em] hover:shadow-[0_0_30px_rgba(221,201,169,0.3)] active:scale-[0.98] transition-all"
            >
              Закрыть
            </button>
          </div>
        ) : (
          <>
            <h2 className="font-display text-2xl md:text-3xl mb-1">
              {isMm ? (
                <>
                  Заявка на <span className="gold-gradient">мастермайнд</span>
                </>
              ) : (
                <>
                  Заявка в клуб <span className="gold-gradient">&laquo;Гордость&raquo;</span>
                </>
              )}
            </h2>
            <p className="text-xs text-muted-foreground mb-6">
              Заполните анкету &mdash; это займёт 2&ndash;3 минуты.
            </p>

            <div className="space-y-4">
              <div>
                <label className={labelCls}>Имя и Фамилия *</label>
                <input
                  className={cls}
                  placeholder="Иван Иванов"
                  value={form.full_name}
                  onChange={set("full_name")}
                />
              </div>

              <div>
                <label className={labelCls}>Telegram *</label>
                <input
                  className={cls}
                  placeholder="@username или ссылка"
                  value={form.tg_username}
                  onChange={set("tg_username")}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Город</label>
                  <CityAutocomplete
                    value={form.city}
                    onChange={(city: string) => setForm((f) => ({ ...f, city }))}
                    className={cls}
                    placeholder="Начните вводить город"
                  />
                </div>
                <div>
                  <label className={labelCls}>Телефон</label>
                  <input
                    className={cls}
                    placeholder="+7 916 123-45-67"
                    value={form.phone}
                    onChange={handlePhoneChange}
                  />
                </div>
              </div>

              <div>
                <label className={labelCls}>Email</label>
                <input
                  className={cls}
                  placeholder="user@example.com"
                  type="email"
                  value={form.email}
                  onChange={set("email")}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Капитал (&#8381;)</label>
                  <input
                    className={cls}
                    placeholder="50000000"
                    value={form.capital}
                    onChange={set("capital")}
                  />
                </div>
                <div>
                  <label className={labelCls}>Доход / мес (&#8381;)</label>
                  <input
                    className={cls}
                    placeholder="1000000"
                    value={form.monthly_income}
                    onChange={set("monthly_income")}
                  />
                </div>
              </div>

              <div>
                <label className={labelCls}>Опыт инвестиций</label>
                <textarea
                  className={cls + " resize-none"}
                  rows={3}
                  placeholder="Расскажите о вашем опыте&hellip;"
                  value={form.invest_experience}
                  onChange={set("invest_experience")}
                />
              </div>

              <div>
                <label className={labelCls}>Во что инвестируете</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {investOptions.map((o) => {
                    const active = form.invests_in.includes(o);
                    return (
                      <button
                        key={o}
                        type="button"
                        onClick={toggleSelect("invests_in", o)}
                        aria-pressed={active}
                        className={`px-4 py-2.5 rounded-full text-[12px] border transition-all active:scale-95 ${
                          active
                            ? "border-gold bg-gold/15 text-gold"
                            : "border-border text-muted-foreground hover:border-gold/50 hover:text-foreground"
                        }`}
                      >
                        {o}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className={labelCls}>Во что хотите инвестировать</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {wantsOptions.map((o) => {
                    const active = form.wants_to_invest.includes(o);
                    return (
                      <button
                        key={o}
                        type="button"
                        onClick={toggleSelect("wants_to_invest", o)}
                        aria-pressed={active}
                        className={`px-4 py-2.5 rounded-full text-[12px] border transition-all active:scale-95 ${
                          active
                            ? "border-gold bg-gold/15 text-gold"
                            : "border-border text-muted-foreground hover:border-gold/50 hover:text-foreground"
                        }`}
                      >
                        {o}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className={labelCls}>
                  Какими ресурсами и/или экспертизой можете поделиться в клубе
                </label>
                <textarea
                  className={cls + " resize-none"}
                  rows={2}
                  placeholder="Ваша экспертиза, компетенции, ресурсы&hellip;"
                  value={form.useful_for_club}
                  onChange={set("useful_for_club")}
                />
              </div>

              <div>
                <label className={labelCls}>Род занятий</label>
                <input
                  className={cls}
                  placeholder="CEO, предприниматель&hellip;"
                  value={form.occupation}
                  onChange={set("occupation")}
                />
              </div>

              <div>
                <label className={labelCls}>Личные запросы / пожелания</label>
                <textarea
                  className={cls + " resize-none"}
                  rows={2}
                  placeholder="Чего ожидаете от клуба&hellip;"
                  value={form.personal_requests}
                  onChange={set("personal_requests")}
                />
              </div>

              <label
                htmlFor="consent"
                className="flex items-start gap-3 pt-2 cursor-pointer select-none"
              >
                <input
                  type="checkbox"
                  id="consent"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-0.5 h-5 w-5 shrink-0 accent-[#D9B08C] cursor-pointer"
                />
                <span className="text-xs text-muted-foreground leading-relaxed">
                  Я согласен с{" "}
                  <a
                    href={PRIVACY_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gold underline hover:opacity-80 transition-opacity"
                  >
                    Политикой конфиденциальности
                  </a>{" "}
                  и даю согласие на{" "}
                  <a
                    href={PRIVACY_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gold underline hover:opacity-80 transition-opacity"
                  >
                    обработку персональных данных
                  </a>{" "}
                  *
                </span>
              </label>

              {error && <p className="text-red-400 text-xs">{error}</p>}

              <button
                onClick={submit}
                disabled={loading || !form.full_name.trim() || !form.tg_username.trim() || !consent}
                className="w-full mt-2 py-4 rounded-xl bg-gold text-primary-foreground text-[12px] uppercase tracking-[0.2em] font-semibold hover:shadow-[0_0_30px_rgba(221,201,169,0.3)] active:scale-[0.99] transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none"
              >
                {loading ? "Отправка&hellip;" : "Отправить заявку"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
