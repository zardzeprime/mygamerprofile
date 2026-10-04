import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/i18n";
import { localeCopy } from "@/i18n/locale-utils";
import { consumeAccountEntryPending, hasSeenEntryIntro, markEntryIntroSeen } from "@/lib/entry-experience";

type EntryScreen = "hidden" | "welcome" | "loading" | "warp";
type EntryDestination = "home" | "register";

export function EntryExperience() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const { user, loading: authLoading } = useAuth();
  const { locale } = useI18n();
  const navigate = useNavigate();
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);
  const [screen, setScreen] = useState<EntryScreen>("hidden");
  const [destination, setDestination] = useState<EntryDestination>("home");
  const [lineIndex, setLineIndex] = useState(0);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const reducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const loadingLines = [
    copy("Ajustando os portais…", "Aligning the portals…", "Ajustando los portales…"),
    copy("Conferindo se Yasuo já salvou Ionia…", "Checking whether Yasuo saved Ionia yet…", "Comprobando si Yasuo ya salvó Jonia…"),
    copy("Pedindo aos Orokin cinco minutos sem outra guerra…", "Asking the Orokin for five minutes without another war…", "Pidiendo a los Orokin cinco minutos sin otra guerra…"),
    copy("Preparando seu espaço gamer…", "Preparing your gaming space…", "Preparando tu espacio gamer…"),
  ];

  useEffect(() => {
    if (pathname === "/onboarding") {
      if (authLoading || !user) return;
      if (consumeAccountEntryPending()) {
        setDestination("home");
        setLineIndex(0);
        setScreen("loading");
      }
      return;
    }

    if (pathname !== "/" || authLoading || user) {
      setScreen("hidden");
      return;
    }

    if (!hasSeenEntryIntro()) setScreen("welcome");
    else setScreen("hidden");
  }, [pathname, authLoading, user]);

  useEffect(() => {
    if (screen === "welcome") titleRef.current?.focus();
  }, [screen]);

  useEffect(() => {
    if (screen === "loading") {
      const timeout = window.setTimeout(() => setScreen("warp"), reducedMotion ? 850 : 2500);
      const interval = window.setInterval(() => {
        setLineIndex((current) => (current + 1) % loadingLines.length);
      }, 740);
      return () => {
        window.clearTimeout(timeout);
        window.clearInterval(interval);
      };
    }

    if (screen === "warp") {
      const timeout = window.setTimeout(() => {
        setScreen("hidden");
        if (destination === "register") void navigate({ to: "/register" });
      }, reducedMotion ? 140 : 1650);
      return () => window.clearTimeout(timeout);
    }
  }, [screen, destination, navigate, reducedMotion, loadingLines.length]);

  const beginWarp = (next: EntryDestination) => {
    markEntryIntroSeen();
    setDestination(next);
    setScreen("warp");
  };

  const skip = () => {
    markEntryIntroSeen();
    setScreen("hidden");
    if (destination === "register") void navigate({ to: "/register" });
  };

  if (screen === "hidden") return null;

  return (
    <div
      className={`impar-entry impar-entry--${screen}`}
      data-screen={screen}
      onKeyDown={(event) => {
        if (event.key === "Escape") skip();
      }}
    >
      <div className="impar-entry__stars" aria-hidden="true" />
      {screen === "welcome" ? (
        <section
          className="impar-entry__dialog"
          role="dialog"
          aria-modal="true"
          aria-labelledby="impar-entry-title"
          aria-describedby="impar-entry-copy"
        >
          <div className="impar-entry__mascot-wrap" aria-hidden="true">
            <img
              className="impar-entry__mascot"
              src="/assets/noctis/noctis-impar-web-hd.webp"
              alt=""
              width="360"
              height="420"
              fetchPriority="high"
            />
            <span className="impar-entry__mascot-glow" />
          </div>
          <div className="impar-entry__welcome-copy">
            <img className="impar-entry__logo" src="/brand/impar-logo-white.png" alt="" width="52" height="52" />
            <p className="impar-entry__eyebrow">ÍMPAR · UM LUGAR PRA SER SEU</p>
            <h1 id="impar-entry-title" ref={titleRef} tabIndex={-1}>
              Opa! Eu sou o Noctis.
            </h1>
            <p id="impar-entry-copy" className="impar-entry__body">
              Seja bem-vindo ao Ímpar: um espaço pra mostrar sua identidade gamer, descobrir coisas novas e encontrar gente pra jogar do seu jeito.
            </p>
            <p className="impar-entry__subcopy">
              Crie seu perfil e participe da comunidade, ou entre sem conta e dê uma olhada primeiro.
            </p>
            <div className="impar-entry__actions">
              <button className="impar-entry__button impar-entry__button--primary" onClick={() => beginWarp("register")}>
                Criar minha conta
              </button>
              <button className="impar-entry__button impar-entry__button--secondary" onClick={() => beginWarp("home")}>
                Continuar sem conta
              </button>
            </div>
            <p className="impar-entry__privacy">
              Ao criar uma conta, você aceita os <Link to="/terms">Termos de Uso</Link> e a <Link to="/privacy">Política de Privacidade</Link>.
            </p>
          </div>
        </section>
      ) : screen === "loading" ? (
        <section className="impar-entry__loading" role="status" aria-live="polite" aria-atomic="true">
          <img className="impar-entry__loading-mascot" src="/assets/noctis/noctis-impar-web-hd.webp" alt="" width="200" height="230" />
          <p className="impar-entry__eyebrow">ACESSO CONFIRMADO</p>
          <h2>Agora vamos preparar seu espaço.</h2>
          <p className="impar-entry__loading-line">{loadingLines[lineIndex]}</p>
          <div className="impar-entry__progress" aria-hidden="true"><span /></div>
          <button className="impar-entry__skip" onClick={skip}>Pular animação</button>
        </section>
      ) : (
        <section className="impar-entry__warp" aria-label="Abrindo o Ímpar">
          <div className="impar-entry__black-hole" aria-hidden="true">
            <span />
          </div>
          <img className="impar-entry__reveal-logo" src="/brand/impar-logo-white.png" alt="Ímpar" width="118" height="118" />
          <button className="impar-entry__skip impar-entry__skip--warp" onClick={skip}>Pular</button>
        </section>
      )}
    </div>
  );
}
