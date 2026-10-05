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
  const dialogRef = useRef<HTMLDialogElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const [reducedMotion, setReducedMotion] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(preference.matches);
    preference.addEventListener("change", update);
    return () => preference.removeEventListener("change", update);
  }, []);

  const loadingLines = [
    copy("Ajustando os portais…", "Aligning the portals…", "Ajustando los portales…"),
    copy("Conferindo se Yasuo já salvou Ionia…", "Checking whether Yasuo saved Ionia yet…", "Comprobando si Yasuo ya salvó Jonia…"),
    copy("Pedindo aos Orokin cinco minutos sem outra guerra…", "Asking the Orokin for five minutes without another war…", "Pidiendo a los Orokin cinco minutos sin otra guerra…"),
    copy("Preparando seu espaço gamer…", "Preparing your gaming space…", "Preparando tu espacio gamer…"),
  ];

  useEffect(() => {
    if (pathname === "/onboarding") {
      // Keep the required profile setup immediately usable after authentication.
      setScreen("hidden");
      return;
    }

    if (pathname.startsWith("/u/") && !authLoading && user && consumeAccountEntryPending()) {
      setDestination("home");
      setLineIndex(0);
      setScreen(reducedMotion ? "hidden" : "loading");
      return;
    }

    if (pathname !== "/" || authLoading || user) {
      setScreen("hidden");
      return;
    }

    if (!hasSeenEntryIntro()) setScreen("welcome");
    else setScreen("hidden");
  }, [pathname, authLoading, user, reducedMotion]);

  useEffect(() => {
    if (screen === "hidden") return;
    const dialog = dialogRef.current;
    if (!dialog || dialog.open) return;

    const active = document.activeElement;
    previousFocusRef.current = active instanceof HTMLElement ? active : null;
    dialog.showModal();
    if (screen === "welcome") titleRef.current?.focus();

    return () => {
      if (dialog.open) dialog.close();
      const previousFocus = previousFocusRef.current;
      previousFocusRef.current = null;
      if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
    };
  }, [screen]);

  useEffect(() => {
    if (screen === "loading") {
      if (reducedMotion) {
        setScreen("hidden");
        return;
      }
      const timeout = window.setTimeout(() => setScreen("warp"), 2500);
      const interval = window.setInterval(() => {
        setLineIndex((current) => (current + 1) % loadingLines.length);
      }, 740);
      return () => {
        window.clearTimeout(timeout);
        window.clearInterval(interval);
      };
    }

    if (screen === "warp") {
      if (reducedMotion) {
        setScreen("hidden");
        if (destination === "register") void navigate({ to: "/register" });
        return;
      }
      const timeout = window.setTimeout(() => {
        setScreen("hidden");
        if (destination === "register") void navigate({ to: "/register" });
      }, 1650);
      return () => window.clearTimeout(timeout);
    }
  }, [screen, destination, navigate, reducedMotion, loadingLines.length]);

  const beginWarp = (next: EntryDestination) => {
    markEntryIntroSeen();
    setDestination(next);
    if (reducedMotion) {
      setScreen("hidden");
      if (next === "register") void navigate({ to: "/register" });
      return;
    }
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
    >
      <div className="impar-entry__stars" aria-hidden="true" />
      {screen === "welcome" ? (
        <dialog
          ref={dialogRef}
          className="impar-entry__dialog"
          aria-labelledby="impar-entry-title"
          aria-describedby="impar-entry-copy"
          onCancel={(event) => {
            event.preventDefault();
            skip();
          }}
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
            <img className="impar-entry__logo" src="/brand/noctis-mark.svg" alt="" width="52" height="52" />
            <p className="impar-entry__eyebrow">ÍMPAR · UM LUGAR PRA SER SEU</p>
            <h1 id="impar-entry-title" ref={titleRef} tabIndex={-1}>
              Opa! Eu sou o Noctis.
            </h1>
            <p id="impar-entry-copy" className="impar-entry__body">
              {copy("Bem-vindo ao Ímpar: escolha um jogo, consulte um guia, descubra uma build ou procure companhia. Dá para começar sem conta.", "Welcome to ÍMPAR: pick a game, check a guide, explore a build or find people to play with. You can start without an account.", "Bienvenido a ÍMPAR: elige un juego, consulta una guía, descubre una build o busca con quién jugar. Puedes empezar sin cuenta.")}
            </p>
            <p className="impar-entry__subcopy">
              {copy("Uma conta fica para quando você quiser publicar, responder, encontrar um grupo ou salvar algo para depois.", "An account is there when you want to post, reply, find a group or save something for later.", "La cuenta es para cuando quieras publicar, responder, buscar grupo o guardar algo para después.")}
            </p>
            <div className="impar-entry__actions">
              <button className="impar-entry__button impar-entry__button--primary" onClick={() => beginWarp("register")}>
                {copy("Criar conta", "Create account", "Crear cuenta")}
              </button>
              <button className="impar-entry__button impar-entry__button--secondary" onClick={() => beginWarp("home")}>
                {copy("Explorar sem conta", "Explore without an account", "Explorar sin cuenta")}
              </button>
            </div>
            <p className="impar-entry__privacy">
              Para criar uma conta, você precisará aceitar os <Link to="/terms">Termos de Uso</Link> e a <Link to="/privacy">Política de Privacidade</Link>.
            </p>
          </div>
        </dialog>
      ) : screen === "loading" ? (
        <dialog
          ref={dialogRef}
          className="impar-entry__loading"
          aria-label="Preparando seu perfil"
          onCancel={(event) => {
            event.preventDefault();
            skip();
          }}
        >
          <img className="impar-entry__loading-mascot" src="/assets/noctis/noctis-impar-web-hd.webp" alt="" width="200" height="230" />
          <p className="impar-entry__eyebrow">PERFIL CONCLUÍDO</p>
          <h2>Seu espaço já está pronto.</h2>
          <p className="impar-entry__loading-line" aria-live="polite">{loadingLines[lineIndex]}</p>
          <div className="impar-entry__progress" aria-hidden="true"><span /></div>
          <button className="impar-entry__skip" onClick={skip}>Pular animação</button>
        </dialog>
      ) : (
        <dialog
          ref={dialogRef}
          className="impar-entry__warp"
          aria-label="Abrindo o Ímpar"
          onCancel={(event) => {
            event.preventDefault();
            skip();
          }}
        >
          <div className="impar-entry__void" aria-hidden="true" />
          <div className="impar-entry__black-hole" aria-hidden="true">
            <span />
          </div>
          <img className="impar-entry__reveal-logo" src="/brand/noctis-mark.svg" alt="Ímpar" width="118" height="118" />
          <button className="impar-entry__skip impar-entry__skip--warp" onClick={skip}>Pular</button>
        </dialog>
      )}
    </div>
  );
}
