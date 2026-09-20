import { PackageOpen } from "lucide-react";
import { useEffect, useState } from "react";

import {
  LeagueBuildCreator,
  type LeagueBuildChampionSummary,
  type LeagueBuildItemSummary,
} from "@/components/games/LeagueBuildCreator";
import type { Locale } from "@/i18n";
import { localeCopy } from "@/i18n/locale-utils";
import {
  getLeagueChampionBuilds,
  type LeagueBuildResponse,
  type LeagueBuildVariant,
} from "@/lib/league-builds";
import { cn } from "@/lib/utils";

const DDRAGON = "https://ddragon.leagueoflegends.com";
const FALLBACK_VERSION = "16.17.1";
const DATA_DRAGON_LOCALE: Record<Locale, string> = {
  "pt-BR": "pt_BR",
  en: "en_US",
  es: "es_ES",
};

type ChampionSummary = LeagueBuildChampionSummary;
type ItemSummary = LeagueBuildItemSummary;

type ItemPayload = {
  data: Record<string, ItemSummary>;
};

function slugifyChampion(name: string) {
  const normalized = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

  const aliases: Record<string, string> = {
    nunuwillump: "nunu",
    renataglasc: "renata",
  };
  return aliases[normalized] ?? normalized;
}

function itemIcon(version: string, itemId: string, item?: ItemSummary) {
  const file = item?.image?.full || `${itemId}.png`;
  return `${DDRAGON}/cdn/${version}/img/item/${file}`;
}

function championIcon(version: string, champion: ChampionSummary) {
  return `${DDRAGON}/cdn/${version}/img/champion/${champion.image.full}`;
}

export function LeagueBuildLab({ locale }: { locale: Locale }) {
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);
  const [version, setVersion] = useState(FALLBACK_VERSION);
  const [champions, setChampions] = useState<ChampionSummary[]>([]);
  const [items, setItems] = useState<Record<string, ItemSummary>>({});
  const [selectedId, setSelectedId] = useState("Akali");
  const [buildData, setBuildData] = useState<LeagueBuildResponse | null>(null);
  const [loadingBuilds, setLoadingBuilds] = useState(false);
  const [sourceError, setSourceError] = useState(false);

  useEffect(() => {
    let active = true;

    void fetch(`${DDRAGON}/api/versions.json`)
      .then((response) => response.json() as Promise<string[]>)
      .then((versions) => {
        if (active && versions[0]) setVersion(versions[0]);
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    const lang = DATA_DRAGON_LOCALE[locale];

    void Promise.all([
      fetch(`${DDRAGON}/cdn/${version}/data/${lang}/champion.json`).then(
        (response) => response.json() as Promise<{ data: Record<string, ChampionSummary> }>,
      ),
      fetch(`${DDRAGON}/cdn/${version}/data/${lang}/item.json`).then(
        (response) => response.json() as Promise<ItemPayload>,
      ),
    ])
      .then(([championPayload, itemPayload]) => {
        if (!active) return;
        const nextChampions = Object.values(championPayload.data).sort((a, b) =>
          a.name.localeCompare(b.name, locale),
        );
        setChampions(nextChampions);
        setItems(itemPayload.data);
        if (!nextChampions.some((entry) => entry.id === selectedId)) {
          setSelectedId(nextChampions[0]?.id ?? "");
        }
      })
      .catch((error) => {
        console.warn("[LeagueBuildLab] Data Dragon load failed", error);
      });

    return () => {
      active = false;
    };
  }, [locale, version]);

  const selectedChampion =
    champions.find((champion) => champion.id === selectedId) ?? champions[0] ?? null;

  useEffect(() => {
    if (!selectedChampion) return;
    let active = true;
    setLoadingBuilds(true);
    setSourceError(false);
    setBuildData(null);

    void getLeagueChampionBuilds(selectedChampion.name)
      .then((data) => {
        if (active) setBuildData(data);
      })
      .catch((error) => {
        console.warn("[LeagueBuildLab] verified build source failed", error);
        if (active) setSourceError(true);
      })
      .finally(() => {
        if (active) setLoadingBuilds(false);
      });

    return () => {
      active = false;
    };
  }, [selectedChampion?.id]);

  return (
    <div className="space-y-6">
      <section className="surface-panel overflow-hidden">
        <div className="border-b border-border p-5 sm:p-7">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 text-gold-strong">
              <PackageOpen className="size-4" />
              <span className="section-kicker">BUILD LAB</span>
            </span>
            <span className="rounded-full border border-border bg-muted/20 px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-[0.1em] text-muted-foreground">
              Riot Data Dragon · {version}
            </span>
          </div>
          <h2 className="mt-3 font-display text-3xl font-bold text-foreground">
            {copy("Builds de League of Legends", "League of Legends builds", "Builds de League of Legends")}
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
            {copy(
              "Compare a rota de itens verificada e monte uma build completa com rota, runas, feitiços, ordem de habilidades, itens core, situacionais e botas. Tudo funciona sem depender da Riot API de conta.",
              "Compare the verified item path and create a complete build with role, runes, spells, skill order, core items, situational items and boots. Everything works without Riot account API access.",
              "Compara la ruta de objetos verificada y crea una build completa con rol, runas, hechizos, orden de habilidades, objetos core, situacionales y botas. Todo funciona sin depender de la API de cuenta de Riot.",
            )}
          </p>
        </div>

        <div className="p-5 sm:p-6">
          <div className="grid gap-4 lg:grid-cols-[18rem_minmax(0,1fr)]">
            <label>
              <span className="text-xs font-black uppercase tracking-[0.1em] text-muted-foreground">
                {copy("Campeão", "Champion", "Campeón")}
              </span>
              <select
                value={selectedChampion?.id ?? ""}
                onChange={(event) => setSelectedId(event.target.value)}
                className="mt-2 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm font-semibold text-foreground outline-none focus:border-gold/50"
              >
                {champions.map((champion) => (
                  <option key={champion.id} value={champion.id}>
                    {champion.name}
                  </option>
                ))}
              </select>
            </label>

            {selectedChampion ? (
              <div className="flex items-center gap-4 rounded-2xl border border-border bg-muted/10 p-3">
                <img
                  src={championIcon(version, selectedChampion)}
                  alt=""
                  className="size-16 rounded-xl border border-border object-cover"
                />
                <div className="min-w-0">
                  <p className="font-display text-xl font-semibold text-foreground">
                    {selectedChampion.name}
                  </p>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                    {selectedChampion.tags.join(" · ")}
                  </p>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="surface-panel p-5 sm:p-7">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="section-kicker">
              {copy("BUILD VERIFICADA", "VERIFIED BUILD", "BUILD VERIFICADA")}
            </p>
            <h3 className="mt-2 font-display text-2xl font-bold text-foreground">
              {selectedChampion?.name ?? copy("Campeão", "Champion", "Campeón")}
            </h3>
          </div>
          {buildData?.patch ? (
            <span className="rounded-full border border-gold/25 bg-gold/[0.06] px-3 py-1 text-xs font-bold text-gold-strong">
              Patch {buildData.patch}
            </span>
          ) : null}
        </div>

        {loadingBuilds ? (
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <div className="h-56 animate-pulse rounded-2xl border border-border bg-muted/20" />
            <div className="h-56 animate-pulse rounded-2xl border border-border bg-muted/20" />
          </div>
        ) : sourceError || !buildData?.builds.length ? (
          <div className="mt-5 rounded-2xl border border-border bg-muted/10 p-5 text-sm leading-6 text-muted-foreground">
            {copy(
              "A fonte estatística não respondeu agora. O criador continua disponível e o MGP não inventa uma build para preencher espaço.",
              "The statistical source is unavailable right now. The builder remains available and MGP does not invent a build to fill the gap.",
              "La fuente estadística no respondió ahora. El creador sigue disponible y MGP no inventa una build para llenar el espacio.",
            )}
          </div>
        ) : (
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            {buildData.builds.map((build, index) => (
              <VerifiedBuildCard
                key={build.id}
                build={build}
                title={
                  index === 0
                    ? copy("Principal", "Primary", "Principal")
                    : copy("Alternativa", "Alternative", "Alternativa")
                }
                version={version}
                items={items}
              />
            ))}
          </div>
        )}

        <ReferenceLinks
          championName={selectedChampion?.name ?? ""}
          source={buildData}
          locale={locale}
        />
      </section>

      <LeagueBuildCreator
        locale={locale}
        version={version}
        champion={selectedChampion}
        items={items}
        buildData={buildData}
      />
    </div>
  );
}

function VerifiedBuildCard({
  build,
  title,
  version,
  items,
}: {
  build: LeagueBuildVariant;
  title: string;
  version: string;
  items: Record<string, ItemSummary>;
}) {
  return (
    <article className="overflow-hidden rounded-2xl border border-border bg-muted/10">
      <div className="border-b border-border p-4">
        <p className="text-[0.62rem] font-black uppercase tracking-[0.1em] text-gold-strong">
          {title}
        </p>
      </div>
      <div className="p-4">
        <div className="flex flex-wrap gap-2">
          {build.items.map((entry, index) => {
            const item = items[entry.id];
            return (
              <div key={`${entry.id}-${index}`} className="w-16 shrink-0 text-center">
                <div className="relative overflow-hidden rounded-xl border border-border">
                  <img
                    src={itemIcon(version, entry.id, item)}
                    alt=""
                    className="aspect-square w-full object-cover"
                  />
                  <span className="absolute left-1 top-1 grid size-5 place-items-center rounded-md bg-black/70 text-[0.58rem] font-black text-white">
                    {index + 1}
                  </span>
                </div>
                <p className="mt-1 line-clamp-2 text-[0.62rem] leading-4 text-foreground">
                  {item?.name || entry.name}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </article>
  );
}

function ReferenceLinks({
  championName,
  source,
  locale,
}: {
  championName: string;
  source: LeagueBuildResponse | null;
  locale: Locale;
}) {
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);
  if (!championName) return null;
  const slug = slugifyChampion(championName);
  const checks = source?.crossChecks ?? [];
  const fallbackLinks = [
    { id: "riot", label: "Riot", url: `https://www.leagueoflegends.com/en-us/champions/${slug}/` },
    { id: "opgg", label: "OP.GG", url: `https://www.op.gg/champions/${slug}/build` },
    { id: "mobalytics", label: "Mobalytics", url: `https://mobalytics.gg/lol/champions/${slug}/build` },
    { id: "leagueofgraphs", label: "League of Graphs", url: `https://www.leagueofgraphs.com/champions/builds/${slug}` },
  ];

  const links = [
    source?.source.url
      ? {
          id: "lolalytics",
          label: "LoLalytics",
          url: source.source.url,
          status: "confirmed" as const,
          detail: source.patch ? `Patch ${source.patch}` : null,
        }
      : null,
    ...fallbackLinks.map((entry) => {
      const check = checks.find((item) => item.id === entry.id);
      const detail =
        check?.matchedPrimaryItems != null && check.primaryItemsChecked
          ? `${check.matchedPrimaryItems}/${check.primaryItemsChecked} core`
          : check?.patch
            ? `Patch ${check.patch}`
            : null;
      return {
        ...entry,
        status: check?.status ?? ("reachable" as const),
        detail,
      };
    }),
  ].filter((entry): entry is NonNullable<typeof entry> => Boolean(entry));

  return (
    <div className="mt-5 rounded-2xl border border-border bg-background/50 p-4">
      <p className="text-xs font-black uppercase tracking-[0.1em] text-muted-foreground">
        {copy("Referências para revisão", "Review references", "Referencias para revisión")}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {links.map((entry) => (
          <a
            key={entry.id}
            href={entry.url}
            target="_blank"
            rel="noreferrer"
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs font-bold transition-colors",
              entry.status === "confirmed"
                ? "border-success/35 bg-success/10 text-foreground hover:border-success/60"
                : entry.status === "blocked"
                  ? "border-border bg-muted/10 text-muted-foreground"
                  : "border-border bg-muted/10 text-foreground hover:border-gold/35 hover:text-gold-strong",
            )}
          >
            {entry.label}
            {entry.status === "confirmed" ? " ✓" : entry.status === "blocked" ? " · manual" : ""}
            {entry.detail ? ` · ${entry.detail}` : ""}
            {" ↗"}
          </a>
        ))}
      </div>
      <p className="mt-3 text-xs leading-5 text-muted-foreground">
        {copy(
          "A build-base vem do LoLalytics. Fontes com ✓ responderam à verificação automática; fontes bloqueadas continuam apenas como referência de revisão e nunca contam como confirmação.",
          "The base build comes from LoLalytics. Sources with ✓ answered the automatic cross-check; blocked sources remain review references only and never count as confirmation.",
          "La build base viene de LoLalytics. Las fuentes con ✓ respondieron al cross-check automático; las fuentes bloqueadas quedan solo como referencias y nunca cuentan como confirmación.",
        )}
      </p>
    </div>
  );
}
