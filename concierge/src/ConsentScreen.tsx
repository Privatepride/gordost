import { useState } from "react";

type ConsentLinks = {
  marketing: string;
  privacy: string;
  personalData: string;
};

type Props = {
  residentId: number;
  consentLinks: ConsentLinks;
  initData: string;
  onDone: () => void;
};

export function ConsentScreen({ residentId, consentLinks, initData, onDone }: Props) {
  const [checks, setChecks] = useState({
    marketing: false,
    privacy: false,
    personalData: false,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const allChecked = checks.marketing && checks.privacy && checks.personalData;

  const toggle = (key: keyof typeof checks) => {
    setChecks((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleContinue = async () => {
    if (!allChecked || saving) return;
    setSaving(true);
    setError("");
    try {
      const resp = await fetch("/api/app/consent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ initData }),
      });
      const data = await resp.json();
      if (data.ok) {
        onDone();
      } else {
        setError(data.error || "Не удалось сохранить согласие");
      }
    } catch {
      setError("Ошибка соединения с сервером");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="consent-screen">
      <div className="consent-card">
        <h1 className="consent-title">Добро пожаловать</h1>
        <p className="consent-subtitle">
          Перед началом использования приложения подтвердите:
        </p>

        <div className="consent-list">
          <label className={`consent-item ${checks.marketing ? "checked" : ""}`}>
            <input
              type="checkbox"
              checked={checks.marketing}
              onChange={() => toggle("marketing")}
            />
            <span>
              Согласие на{" "}
              <a href={consentLinks.marketing} target="_blank" rel="noopener noreferrer">
                маркетинговые рассылки
              </a>
            </span>
          </label>

          <label className={`consent-item ${checks.privacy ? "checked" : ""}`}>
            <input
              type="checkbox"
              checked={checks.privacy}
              onChange={() => toggle("privacy")}
            />
            <span>
              Согласие с{" "}
              <a href={consentLinks.privacy} target="_blank" rel="noopener noreferrer">
                политикой конфиденциальности
              </a>
            </span>
          </label>

          <label className={`consent-item ${checks.personalData ? "checked" : ""}`}>
            <input
              type="checkbox"
              checked={checks.personalData}
              onChange={() => toggle("personalData")}
            />
            <span>
              Согласие на{" "}
              <a href={consentLinks.personalData} target="_blank" rel="noopener noreferrer">
                обработку персональных данных
              </a>
            </span>
          </label>
        </div>

        {error && <p className="consent-error">{error}</p>}

        <button
          className={`consent-btn ${allChecked ? "active" : ""}`}
          disabled={!allChecked || saving}
          onClick={handleContinue}
        >
          {saving ? "Сохраняем..." : "Продолжить"}
        </button>
      </div>

      <style>{`
        .consent-screen {
          min-height: 100dvh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background: #0b0d12;
        }
        .consent-card {
          max-width: 360px;
          width: 100%;
        }
        .consent-title {
          color: #d8be8b;
          font-size: 1.5em;
          font-weight: 600;
          margin: 0 0 4px;
        }
        .consent-subtitle {
          color: #8f9aa8;
          font-size: 0.95em;
          margin: 0 0 24px;
          line-height: 1.5;
        }
        .consent-list {
          display: flex;
          flex-direction: column;
          gap: 14px;
          margin-bottom: 24px;
        }
        .consent-item {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          cursor: pointer;
          color: #d4d4d4;
          font-size: 0.95em;
          line-height: 1.4;
          padding: 10px 12px;
          border-radius: 8px;
          background: #15171d;
          border: 1px solid #1f2230;
          transition: border-color 0.2s;
        }
        .consent-item.checked {
          border-color: #3a3f4e;
        }
        .consent-item input[type="checkbox"] {
          appearance: none;
          -webkit-appearance: none;
          width: 20px;
          height: 20px;
          min-width: 20px;
          border: 1.5px solid #3a3f4e;
          border-radius: 4px;
          background: #0b0d12;
          cursor: pointer;
          position: relative;
          margin-top: 1px;
          transition: border-color 0.2s, background 0.2s;
        }
        .consent-item input[type="checkbox"]:checked {
          background: #d8be8b;
          border-color: #d8be8b;
        }
        .consent-item input[type="checkbox"]:checked::after {
          content: "";
          position: absolute;
          left: 5px;
          top: 2px;
          width: 6px;
          height: 10px;
          border: solid #0b0d12;
          border-width: 0 2px 2px 0;
          transform: rotate(45deg);
        }
        .consent-item a {
          color: #d8be8b;
          text-decoration: underline;
          text-underline-offset: 2px;
        }
        .consent-error {
          color: #e06060;
          font-size: 0.85em;
          margin: 0 0 16px;
        }
        .consent-btn {
          width: 100%;
          padding: 14px;
          border: none;
          border-radius: 10px;
          font-size: 1em;
          font-weight: 600;
          cursor: pointer;
          background: #1f2230;
          color: #5a5f6e;
          transition: background 0.2s, color 0.2s;
        }
        .consent-btn.active {
          background: #d8be8b;
          color: #0b0d12;
          cursor: pointer;
        }
        .consent-btn:disabled {
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
