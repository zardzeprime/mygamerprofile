import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import darkSoulsAtmosphere from "../assets/dark-souls-atmosphere.jpg";
import appCss from "../styles.css?url";
import responsiveCss from "../responsive.css?url";
import routeTransitionCss from "../route-transition.css?url";
import profileBackgroundCss from "../profile-backgrounds.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { I18nProvider } from "../i18n";
import { ThemeProvider, themeBootstrapScript } from "../lib/theme";
import { SoundProvider } from "../lib/sound";
import { RouteTransitionLoader } from "../components/common/RouteTransitionLoader";
import { AppHeader } from "../components/layout/AppHeader";
import { AppFooter } from "../components/layout/AppFooter";
import { NexusChat } from "../components/nexus/NexusChat";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-full border border-input bg-surface px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            Go home
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
      { title: "MGP — My Gamer Profile" },
      {
        name: "description",
        content:
          "MGP é a plataforma de identidade gamer: perfil, jogos, Game Profiles, comunidades e LFG.",
      },
      { property: "og:site_name", content: "MGP — My Gamer Profile" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "stylesheet", href: responsiveCss },
      { rel: "stylesheet", href: routeTransitionCss },
      { rel: "stylesheet", href: profileBackgroundCss },
      { rel: "icon", href: "/brand/mgp-logo.png", type: "image/png" },
      { rel: "apple-touch-icon", href: "/brand/mgp-logo.png" },
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
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <HeadContent />
        <script dangerouslySetInnerHTML={{ __html: themeBootstrapScript }} />
      </head>
      <body>
        <I18nProvider>{children}</I18nProvider>
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
      const isCreativeUncut = hostname === "creativeuncut.com" || hostname === "www.creativeuncut.com";
      if (!isFandom && !isCreativeUncut) return;

      image.removeAttribute("srcset");

      // Some external media hosts reject no-referrer hotlinks or unstable redirect URLs.
      // Retry once with the browser's normal cross-origin referrer policy and a stable
      // MediaWiki file-path alias before falling back to a same-origin MGP asset.
      if (image.dataset.mgpExternalRetry !== "1") {
        image.dataset.mgpExternalRetry = "1";
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

      if (image.dataset.mgpFallbackApplied === "1") return;
      image.dataset.mgpFallbackApplied = "1";

      const isDarkSoulsThree =
        window.location.pathname.includes("dark-souls-iii") || parsed.pathname.includes("/gallery-30/");
      image.src = isDarkSoulsThree ? "/game-covers/ds3.webp" : darkSoulsAtmosphere;
    };

    window.addEventListener("error", handleExternalArtworkError, true);
    return () => window.removeEventListener("error", handleExternalArtworkError, true);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <SoundProvider>
          <RouteTransitionLoader />
          <div className="flex min-h-screen flex-col bg-background">
            <AppHeader />
            <main className="flex-1">
              {/* Required: nested routes render here. */}
              <Outlet />
            </main>
            <AppFooter />
          </div>
          <NexusChat />
        </SoundProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
