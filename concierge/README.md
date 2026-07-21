# Telegram Mini App «Гордость — консьерж»

Веб-приложение внутри Telegram отправляет текст **напрямую в чат с ботом** через Bot API (без n8n). Полный функционал — **в самом боте**: профиль, резиденты, мероприятия и запись.

- Если задан **`BASEROW_API_TOKEN`**, бот читает и пишет те же сущности, что и воркфлоу n8n: таблица резидентов **597** (поле Telegram **5563**), события **838**, регистрации **839** (поля **7790** / **7791**), логика записи как в `Code: events handler` (лимит `MaxParticipants`, статусы `approved` / `waitlist`).
- Если токена нет — используется локальный **JSON** (`data/gordost.json`) для демо.

## Что сделать вам

1. **Токен бота** — в `.env`: `TELEGRAM_BOT_TOKEN=...`

2. **Если раньше на этом боте был webhook** (например, n8n), отключите его, иначе long polling не получит апдейты:

   ```bash
   curl "https://api.telegram.org/bot<TOKEN>/deleteWebhook?drop_pending_updates=false"
   ```

3. **Сборка и запуск**

   ```bash
   cd gordost-telegram-miniapp
   cp .env.example .env   # при необходимости
   npm install
   npm run build
   npm start
   ```

   Нужен **HTTPS** на публичном URL (Telegram откроет только `https://`).

4. **BotFather**  
   - **Domain** для Mini Apps: ваш домен.  
   - **Menu button** / Web App: URL = `https://ваш-домен/`.

5. Пользователь должен один раз нажать **/start** в боте — иначе бот не сможет прислать ответ из мини-приложения (ошибка 403).

## Разработка

```bash
npm run dev
```

Vite: `http://127.0.0.1:5173`, `/api` проксируется на `8787`. Для проверки `initData` удобнее открывать мини-приложение из Telegram.

## Старый сценарий n8n

Скрипт `scripts/patch-n8n-workflow.mjs` оставлен только для истории; текущий сервер **не вызывает** n8n.
