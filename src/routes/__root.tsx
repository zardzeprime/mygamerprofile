import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import darkSoulsAtmosphere from "../assets/dark-souls-atmosphere.jpg";
import appCss from "../styles.css?url";
import responsiveCss from "../responsive.css?url";
import routeTransitionCss from "../route-transition.css?url";
import profileBackgroundCss from "../profile-backgrounds.css?url";
import imparBrandCss from "../impar-brand.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { I18nProvider } from "../i18n";
import { ThemeProvider, themeBootstrapScript } from "../lib/theme";
import { SoundProvider } from "../lib/sound";
import { RouteTransitionLoader } from "../components/common/RouteTransitionLoader";
import { AppHeader } from "../components/layout/AppHeader";
import { AppFooter } from "../components/layout/AppFooter";
import { NoctisChat } from "../components/noctis/NoctisChat";
import { DEFAULT_OG_IMAGE, SITE_STRUCTURED_DATA } from "../lib/seo";

function NotFoundComponent() {
  return (
    <div className="impar-shell flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <p className="impar-kicker">ÍMPAR / ARQUIVO PERDIDO</p>
        <h1 className="mt-3 font-display text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Página não encontrada</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Esse registro não existe, foi movido ou ainda não faz parte dos Arquivos.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Voltar ao ÍMPAR
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <p className="impar-kicker">ÍMPAR / FALHA DE ROTA</p>
        <h1 className="mt-3 text-xl font-semibold tracking-tight text-foreground">
          Esta página não carregou
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Algo falhou por aqui. Você pode tentar novamente ou voltar para o início.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Tentar novamente
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-full border border-input bg-surface px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            Ir para o início
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "ÍMPAR — Sua identidade gamer" },
      {
        name: "description",
        content:
          "ÍMPAR é uma plataforma brasileira de identidade gamer: perfis, jogos, Códice, Comunidades, conteúdo e LFG do seu jeito.",
      },
      { name: "robots", content: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" },
      { name: "theme-color", content: "#0a0e17" },
      { property: "og:site_name", content: "ÍMPAR" },
      { property: "og:type", content: "website" },
      { property: "og:image", content: DEFAULT_OG_IMAGE },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: DEFAULT_OG_IMAGE },
      { name: "google-adsense-account", content: "ca-pub-7774329183197175" },
    ],
    scripts: [{ type: "application/ld+json", children: SITE_STRUCTURED_DATA }],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "stylesheet", href: responsiveCss },
      { rel: "stylesheet", href: routeTransitionCss },
      { rel: "stylesheet", href: profileBackgroundCss },
      { rel: "stylesheet", href: imparBrandCss },
      { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
      { rel: "apple-touch-icon", href: "/brand/impar-logo.svg" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Sora:wght@500;600;700&family=Manrope:wght@400;500;600;700&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR" className="dark" suppressHydrationWarning>
      <head>
        <HeadContent />
        <script dangerouslySetInnerHTML={{ __html: themeBootstrapScript }} />
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7774329183197175"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  useEffect(() => {
    const handleExternalArtworkError = (event: Event) => {
      const image = event.target;
      if (!(image instanceof HTMLImageElement)) return;

      const source = image.currentSrc || image.src;
      if (!source) return;

      let parsed: URL;
      try {
        parsed = new URL(source, window.location.href);
      } catch {
        return;
      }

      const hostname = parsed.hostname.toLowerCase();
      const isFandom = hostname.endsWith("fandom.com") || hostname.endsWith("wikia.nocookie.net");
      const isCreativeUncut =
        hostname === "creativeuncut.com" || hostname === "www.creativeuncut.com";
      if (!isFandom && !isCreativeUncut) return;

      image.removeAttribute("srcset");

      // Technical mgp-* data attributes are intentionally preserved as stable
      // compatibility identifiers during the public ÍMPAR rebrand.
      if (image.dataset["mgpExternalRetry"] !== "1") {
        image.dataset["mgpExternalRetry"] = "1";
        image.referrerPolicy = "strict-origin-when-cross-origin";

        if (isFandom && source.includes("/Special:Redirect/file/")) {
          image.src = source.replace("/Special:Redirect/file/", "/Special:FilePath/");
          return;
        }

        const retryUrl = new URL(source, window.location.href);
        retryUrl.searchParams.set("mgp_retry", "1");
        image.src = retryUrl.toString();
        return;
      }

      if (image.dataset["mgpFallbackApplied"] === "1") return;
      image.dataset["mgpFallbackApplied"] = "1";

      const isDarkSoulsThree =
        window.location.pathname.includes("dark-souls-iii") ||
        parsed.pathname.includes("/gallery-30/");
      image.src = isDarkSoulsThree ? "/game-covers/ds3.webp" : darkSoulsAtmosphere;
    };

    window.addEventListener("error", handleExternalArtworkError, true);
    return () => window.removeEventListener("error", handleExternalArtworkError, true);
  }, []);

  return (
    <I18nProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <SoundProvider>
            <div className="impar-starry-sky" aria-hidden="true" />
            <RouteTransitionLoader />
            <div className="relative z-10 flex min-h-screen flex-col bg-transparent">
              <AppHeader />
              <div aria-hidden="true" className="h-[4.25rem] shrink-0" />
              <main className="flex-1">
                <Outlet />
              </main>
              <AppFooter />
            </div>
            <NoctisChat />
          </SoundProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </I18nProvider>
  );
}
