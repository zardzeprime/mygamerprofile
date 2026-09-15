import { useMemo, useState } from "react";
import { Crown, Search, Sparkles, Swords } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { Locale } from "@/i18n";
import { localeCopy } from "@/i18n/locale-utils";
import { cn } from "@/lib/utils";

type SoulsGameSlug = "dark-souls-iii" | "elden-ring";
type BossKind = "story" | "optional" | "dlc";

type BossEntry = {
  name: string;
  area: string;
  kind: BossKind;
  note?: Record<Locale, string>;
};

const DS3_BOSSES: BossEntry[] = [
  { name: "Iudex Gundyr", area: "Cemetery of Ash", kind: "story" },
  { name: "Vordt of the Boreal Valley", area: "High Wall of Lothric", kind: "story" },
  { name: "Curse-Rotted Greatwood", area: "Undead Settlement", kind: "optional" },
  { name: "Crystal Sage", area: "Road of Sacrifices", kind: "story" },
  { name: "Deacons of the Deep", area: "Cathedral of the Deep", kind: "story" },
  { name: "Abyss Watchers", area: "Farron Keep", kind: "story" },
  { name: "High Lord Wolnir", area: "Catacombs of Carthus", kind: "story" },
  { name: "Old Demon King", area: "Smouldering Lake", kind: "optional" },
  { name: "Pontiff Sulyvahn", area: "Irithyll of the Boreal Valley", kind: "story" },
  { name: "Yhorm the Giant", area: "Profaned Capital", kind: "story" },
  { name: "Aldrich, Devourer of Gods", area: "Anor Londo", kind: "story" },
  { name: "Dancer of the Boreal Valley", area: "High Wall of Lothric", kind: "story" },
  { name: "Dragonslayer Armour", area: "Lothric Castle", kind: "story" },
  { name: "Oceiros, the Consumed King", area: "Consumed King's Garden", kind: "optional" },
  { name: "Champion Gundyr", area: "Untended Graves", kind: "optional" },
  { name: "Lothric, Younger Prince & Lorian, Elder Prince", area: "Grand Archives", kind: "story" },
  { name: "Ancient Wyvern", area: "Archdragon Peak", kind: "optional" },
  { name: "The Nameless King", area: "Archdragon Peak", kind: "optional" },
  { name: "Soul of Cinder", area: "Kiln of the First Flame", kind: "story" },
  { name: "Champion's Gravetender & Gravetender Greatwolf", area: "Painted World of Ariandel", kind: "dlc" },
  { name: "Sister Friede & Father Ariandel", area: "Painted World of Ariandel", kind: "dlc" },
  { name: "Demon in Pain, Demon from Below & Demon Prince", area: "The Dreg Heap", kind: "dlc" },
  { name: "Halflight, Spear of the Church", area: "The Ringed City", kind: "dlc" },
  { name: "Darkeater Midir", area: "The Ringed City", kind: "dlc" },
  { name: "Slave Knight Gael", area: "Filianore's Rest", kind: "dlc" },
];

const ELDEN_RING_BOSSES: BossEntry[] = [
  { name: "Margit, the Fell Omen", area: "Stormhill", kind: "story" },
  { name: "Godrick the Grafted", area: "Stormveil Castle", kind: "story" },
  { name: "Rennala, Queen of the Full Moon", area: "Academy of Raya Lucaria", kind: "story" },
  { name: "Starscourge Radahn", area: "Redmane Castle", kind: "story" },
  { name: "Regal Ancestor Spirit", area: "Nokron, Eternal City", kind: "optional" },
  { name: "Astel, Naturalborn of the Void", area: "Grand Cloister", kind: "optional" },
  { name: "Lichdragon Fortissax", area: "Deeproot Depths", kind: "optional" },
  { name: "Rykard, Lord of Blasphemy", area: "Volcano Manor", kind: "optional" },
  { name: "Morgott, the Omen King", area: "Leyndell, Royal Capital", kind: "story" },
  { name: "Fire Giant", area: "Mountaintops of the Giants", kind: "story" },
  { name: "Mohg, Lord of Blood", area: "Mohgwyn Palace", kind: "optional" },
  { name: "Malenia, Blade of Miquella", area: "Elphael, Brace of the Haligtree", kind: "optional" },
  { name: "Dragonlord Placidusax", area: "Crumbling Farum Azula", kind: "optional" },
  { name: "Godskin Duo", area: "Crumbling Farum Azula", kind: "story" },
  { name: "Maliketh, the Black Blade", area: "Crumbling Farum Azula", kind: "story" },
  { name: "Sir Gideon Ofnir, the All-Knowing", area: "Leyndell, Ashen Capital", kind: "story" },
  { name: "Godfrey, First Elden Lord / Hoarah Loux", area: "Leyndell, Ashen Capital", kind: "story" },
  { name: "Radagon of the Golden Order / Elden Beast", area: "Elden Throne", kind: "story" },
  { name: "Divine Beast Dancing Lion", area: "Belurat, Tower Settlement", kind: "dlc" },
  { name: "Rellana, Twin Moon Knight", area: "Castle Ensis", kind: "dlc" },
  { name: "Putrescent Knight", area: "Stone Coffin Fissure", kind: "dlc" },
  { name: "Commander Gaius", area: "Scaduview", kind: "dlc" },
  { name: "Scadutree Avatar", area: "Scadutree Base", kind: "dlc" },
  { name: "Metyr, Mother of Fingers", area: "Finger Ruins", kind: "dlc" },
  { name: "Midra, Lord of Frenzied Flame", area: "Midra's Manse", kind: "dlc" },
  { name: "Romina, Saint of the Bud", area: "Church of the Bud", kind: "dlc" },
  { name: "Messmer the Impaler", area: "Shadow Keep", kind: "dlc" },
  { name: "Bayle the Dread", area: "Jagged Peak", kind: "dlc" },
  { name: "Promised Consort Radahn", area: "Enir-Ilim", kind: "dlc" },
];

const COLLECTIONS: Record<SoulsGameSlug, BossEntry[]> = {
  "dark-souls-iii": DS3_BOSSES,
  "elden-ring": ELDEN_RING_BOSSES,
};

export function SoulsBossExplorer({ gameSlug, locale }: { gameSlug: SoulsGameSlug; locale: Locale }) {
  const copy = (pt: string, en: string, es: string) => localeCopy(locale, pt, en, es);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | BossKind>("all");
  const bosses = COLLECTIONS[gameSlug];
  const isEldenRing = gameSlug === "elden-ring";

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return bosses.filter((boss) => {
      const kindMatch = filter === "all" || boss.kind === filter;
      const textMatch = !normalized || boss.name.toLowerCase().includes(normalized) || boss.area.toLowerCase().includes(normalized);
      return kindMatch && textMatch;
    });
  }, [bosses, filter, query]);

  return (
    <section className="space-y-6">
      <div className="surface-panel p-5 sm:p-6">
        <div className="flex items-center gap-2 text-gold-strong">
          <Crown className="size-4" />
          <span className="section-kicker">{copy("ENCICLOPÉDIA MGP", "MGP ENCYCLOPEDIA", "ENCICLOPEDIA MGP")}</span>
        </div>
        <h2 className="mt-3 font-display text-2xl font-semibold text-foreground sm:text-3xl">
          {isEldenRing ? copy("Chefes principais de Elden Ring", "Major Elden Ring bosses", "Jefes principales de Elden Ring") : copy("Chefes de Dark Souls III", "Dark Souls III bosses", "Jefes de Dark Souls III")}
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
          {isEldenRing
            ? copy("Coleção editorial do MGP focada nos confrontos principais, opcionais de destaque e chefes de Shadow of the Erdtree. Não usa imagens copiadas de wikis de terceiros.", "MGP editorial collection focused on major encounters, standout optional fights and Shadow of the Erdtree bosses. It does not copy images from third-party wikis.", "Colección editorial de MGP centrada en los encuentros principales, opcionales destacados y jefes de Shadow of the Erdtree. No copia imágenes de wikis de terceros.")
            : copy("Lista organizada do jogo base e das expansões Ashes of Ariandel e The Ringed City, com classificação por progressão.", "Organized list covering the base game plus Ashes of Ariandel and The Ringed City, classified by progression.", "Lista organizada del juego base y las expansiones Ashes of Ariandel y The Ringed City, clasificada por progresión.")}
        </p>

        <div className="mt-5 grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto]">
          <label className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 focus-within:border-gold/50">
            <Search className="size-4 text-muted-foreground" />
            <Input value={query} onChange={(event) => setQuery(event.target.value)} className="h-auto border-0 bg-transparent p-0 shadow-none focus-visible:ring-0" placeholder={copy("Buscar chefe ou área…", "Search boss or area…", "Buscar jefe o zona…")} />
          </label>
          <div className="flex gap-2 overflow-x-auto">
            <FilterButton active={filter === "all"} onClick={() => setFilter("all")}>{copy("Todos", "All", "Todos")}</FilterButton>
            <FilterButton active={filter === "story"} onClick={() => setFilter("story")}>{copy("Progressão", "Progression", "Progresión")}</FilterButton>
            <FilterButton active={filter === "optional"} onClick={() => setFilter("optional")}>{copy("Opcionais", "Optional", "Opcionales")}</FilterButton>
            <FilterButton active={filter === "dlc"} onClick={() => setFilter("dlc")}>DLC</FilterButton>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((boss, index) => (
          <article key={boss.name} className="group overflow-hidden rounded-2xl border border-border bg-surface shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-gold/35 hover:shadow-lift">
            <div className="relative grid aspect-[16/10] place-items-center overflow-hidden bg-[radial-gradient(circle_at_70%_20%,rgba(213,132,61,0.20),transparent_38%),linear-gradient(145deg,#120d0a,#2b1710_58%,#0c0a09)]">
              <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.06)_1px,transparent_1px)] [background-size:32px_32px]" />
              <div className="relative text-center">
                {boss.kind === "dlc" ? <Sparkles className="mx-auto size-7 text-gold-strong" /> : <Swords className="mx-auto size-7 text-gold-strong" />}
                <p className="mt-3 text-[0.65rem] font-black uppercase tracking-[0.18em] text-white/55">MGP · {String(index + 1).padStart(2, "0")}</p>
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between gap-2">
                <span className={cn("rounded-full border px-2 py-0.5 text-[0.62rem] font-bold uppercase tracking-[0.1em]", boss.kind === "dlc" ? "border-gold/35 bg-gold-soft/35 text-gold-strong" : "border-border bg-muted/30 text-muted-foreground")}>
                  {boss.kind === "story" ? copy("Progressão", "Progression", "Progresión") : boss.kind === "optional" ? copy("Opcional", "Optional", "Opcional") : "DLC"}
                </span>
              </div>
              <h3 className="mt-3 font-display text-lg font-semibold leading-snug text-foreground">{boss.name}</h3>
              <p className="mt-2 text-xs leading-5 text-muted-foreground">{boss.area}</p>
              {boss.note ? <p className="mt-3 text-xs leading-5 text-muted-foreground">{boss.note[locale]}</p> : null}
            </div>
          </article>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-muted/15 p-4 text-xs leading-5 text-muted-foreground">
        {copy("As fichas acima são conteúdo editorial original do MGP. Artes específicas dos chefes só serão adicionadas quando vierem de uma fonte oficial com uso autorizado ou de material claramente licenciado.", "The entries above are original MGP editorial content. Boss-specific artwork will only be added from an official authorized source or clearly licensed material.", "Las fichas anteriores son contenido editorial original de MGP. El arte específico de los jefes solo se añadirá desde una fuente oficial autorizada o material con licencia clara.")}
      </div>
    </section>
  );
}

function FilterButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} className={cn("shrink-0 rounded-full border px-3 py-2 text-xs font-semibold transition-colors", active ? "border-gold/50 bg-gold-soft/45 text-gold-strong" : "border-border bg-surface text-muted-foreground hover:text-foreground")}>{children}</button>
  );
}
