import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Страница не найдена</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Возможно, страница была перемещена или вы перешли по устаревшей ссылке.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            На главную
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { name: "theme-color", content: "#121721" },
      { title: "ГОРДОСТЬ — Закрытый инвестиционный клуб" },
      {
        name: "description",
        content:
          "Закрытое сообщество инвесторов с капиталом от 50 млн ₽. Правильные люди в правильном месте.",
      },
      { name: "author", content: "Инвестиционный клуб «Гордость»" },
      { property: "og:title", content: "ГОРДОСТЬ — Инвестиционный клуб" },
      {
        property: "og:description",
        content:
          "Закрытое сообщество инвесторов с капиталом от 50 млн ₽. Правильные люди в правильном месте.",
      },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "ru_RU" },
      { property: "og:site_name", content: "ГОРДОСТЬ" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "ГОРДОСТЬ — Инвестиционный клуб" },
      {
        name: "twitter:description",
        content: "Закрытое сообщество инвесторов с капиталом от 50 млн ₽.",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return <Outlet />;
}
