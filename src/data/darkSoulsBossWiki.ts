import type { Locale } from "@/i18n/translations";

type LocalizedText = Record<Locale, string>;

export type BossWikiEntry = {
  souls: number;
  healthNg?: string;
  loreIntro: LocalizedText;
  spoilerLore: LocalizedText;
  drops: LocalizedText[];
  tailCut?: LocalizedText;
  notes?: LocalizedText[];
};


export const DARK_SOULS_BOSS_REVIEWED_AT = "2026-09-21";

export const DARK_SOULS_BOSS_SOURCES: Record<string, string> = {
  "asylum-demon": "https://darksouls.wikidot.com/asylum-demon",
  "taurus-demon": "https://darksouls.wikidot.com/taurus-demon",
  "bell-gargoyles": "https://darksouls.wikidot.com/bell-gargoyles",
  "capra-demon": "https://darksouls.wikidot.com/capra-demon",
  "gaping-dragon": "https://darksouls.wikidot.com/gaping-dragon",
  "chaos-witch-quelaag": "https://darksouls.wikidot.com/chaos-witch-quelaag",
  "moonlight-butterfly": "https://darksouls.wikidot.com/moonlight-butterfly",
  "great-grey-wolf-sif": "https://darksouls.wikidot.com/great-grey-wolf-sif",
  "iron-golem": "https://darksouls.wikidot.com/iron-golem",
  "ornstein-and-smough": "https://darksouls.wikidot.com/dragon-slayer-ornstein-executioner-smough",
  "dark-sun-gwyndolin": "https://darksouls.wikidot.com/dark-sun-gwyndolin",
  "crossbreed-priscilla": "https://darksouls.wikidot.com/crossbreed-priscilla",
  "stray-demon": "https://darksouls.wikidot.com/stray-demon",
  "pinwheel": "https://darksouls.wikidot.com/pinwheel",
  "gravelord-nito": "https://darksouls.wikidot.com/gravelord-nito",
  "seath-the-scaleless": "https://darksouls.wikidot.com/seath-the-scaleless",
  "four-kings": "https://darksouls.wikidot.com/four-kings",
  "ceaseless-discharge": "https://darksouls.wikidot.com/ceaseless-discharge",
  "demon-firesage": "https://darksouls.wikidot.com/demon-firesage",
  "centipede-demon": "https://darksouls.wikidot.com/centipede-demon",
  "bed-of-chaos": "https://darksouls.wikidot.com/bed-of-chaos",
  "gwyn-lord-of-cinder": "https://darksouls.wikidot.com/gwyn-lord-of-cinder",
  "sanctuary-guardian": "https://darksouls.wikidot.com/sanctuary-guardian",
  "artorias-the-abysswalker": "https://darksouls.wikidot.com/knight-artorias",
  "black-dragon-kalameet": "https://darksouls.wikidot.com/black-dragon-kalameet",
  "manus-father-of-the-abyss": "https://darksouls.wikidot.com/manus-father-of-the-abyss",
};

/**
 * ÍMPAR editorial copy for Dark Souls Remastered.
 * Facts are synthesized from in-game descriptions and established community references;
 * the prose is original and intentionally separates spoiler-light context from deeper lore.
 * "drops" focuses on unique/notable rewards instead of every generic Humanity/Homeward Bone.
 */
export const DARK_SOULS_BOSS_WIKI: Record<string, BossWikiEntry> = {
  "asylum-demon": {
    souls: 2000,
    healthNg: "825",
    loreIntro: {
      "pt-BR": "Um grande demônio que guarda a saída do Northern Undead Asylum. Ele apresenta o jogador à linhagem de demônios ligada ao caos de Izalith sem exigir contexto prévio da história.",
      en: "A massive demon guarding the way out of the Northern Undead Asylum. It introduces the player to the demon lineage tied to Izalith's Chaos without requiring prior story context.",
    },
    spoilerLore: {
      "pt-BR": "O Asylum Demon não ocupa um papel político importante em Lordran; seu valor narrativo está em conectar o tutorial aos demônios nascidos do desastre de Izalith e em estabelecer a linguagem dos chefes do jogo.",
      en: "The Asylum Demon is not a major political figure in Lordran; its narrative value is in linking the tutorial to the demons born from Izalith's disaster and establishing the game's boss language.",
    },
    drops: [
      { "pt-BR": "Demon's Great Hammer — obtido ao derrotá-lo no primeiro encontro", en: "Demon's Great Hammer — obtained by defeating it during the first encounter" },
    ],
  },
  "stray-demon": {
    souls: 20000,
    healthNg: "5,250",
    loreIntro: {
      "pt-BR": "Uma versão muito mais poderosa da mesma família demoníaca encontrada sob o Asilo. Sua presença sugere que o local guarda perigos que o tutorial apenas deixava entrever.",
      en: "A far stronger member of the same demonic family found beneath the Asylum. Its presence suggests the area hides dangers the tutorial only hinted at.",
    },
    spoilerLore: {
      "pt-BR": "O jogo não entrega uma biografia individual para o Stray Demon. Ele funciona principalmente como uma variação tardia do arquétipo do Asylum Demon, reforçando a conexão entre os demônios e o legado do Chaos.",
      en: "The game gives the Stray Demon no individual biography. It mainly serves as a later variation of the Asylum Demon archetype, reinforcing the link between demons and the legacy of Chaos.",
    },
    drops: [{ "pt-BR": "Titanite Slab", en: "Titanite Slab" }],
  },
  "taurus-demon": {
    souls: 3000,
    healthNg: "1,215",
    loreIntro: {
      "pt-BR": "Um demônio taurino que bloqueia uma muralha do Undead Burg. Criaturas semelhantes aparecem mais tarde próximas às ruínas de Izalith, conectando esse encontro inicial a uma ameaça muito maior.",
      en: "A bull-like demon blocking a wall in the Undead Burg. Similar creatures later appear near Izalith's ruins, connecting this early encounter to a much larger threat.",
    },
    spoilerLore: {
      "pt-BR": "A presença de Taurus Demons fora de Demon Ruins mostra como os demônios se espalharam por Lordran após o colapso de Izalith. Este indivíduo, porém, não recebe uma identidade própria no texto do jogo.",
      en: "The presence of Taurus Demons outside the Demon Ruins shows how demons spread across Lordran after Izalith's collapse. This individual, however, receives no personal identity in the game's text.",
    },
    drops: [{ "pt-BR": "Demon's Greataxe — chance de drop", en: "Demon's Greataxe — chance drop" }],
  },
  "bell-gargoyles": {
    souls: 10000,
    healthNg: "1,000 (primeira gárgula)",
    loreIntro: {
      "pt-BR": "As gárgulas protegem o primeiro Bell of Awakening no topo da igreja de Undead Parish. A luta coloca o objetivo da jornada literalmente atrás de seus guardiões.",
      en: "The gargoyles guard the first Bell of Awakening atop the Undead Parish church. The fight places a key journey objective literally behind its guardians.",
    },
    spoilerLore: {
      "pt-BR": "Gárgulas semelhantes também vigiam Anor Londo, reforçando sua função como guardiões ligados à arquitetura e às instituições dos deuses, mais do que como personagens individuais.",
      en: "Similar gargoyles also guard Anor Londo, reinforcing their role as guardians tied to divine architecture and institutions rather than individual characters.",
    },
    drops: [
      { "pt-BR": "Gargoyle Helm — chance de drop", en: "Gargoyle Helm — chance drop" },
      { "pt-BR": "Gargoyle Halberd — chance de drop", en: "Gargoyle Halberd — chance drop" },
      { "pt-BR": "Gargoyle's Shield — chance de drop", en: "Gargoyle's Shield — chance drop" },
      { "pt-BR": "Twin Humanities", en: "Twin Humanities" },
    ],
    tailCut: { "pt-BR": "Gargoyle Tail Axe", en: "Gargoyle Tail Axe" },
  },
  "capra-demon": {
    souls: 6000,
    healthNg: "1,176",
    loreIntro: {
      "pt-BR": "Um demônio de duas lâminas que ocupa as ruas inferiores do Undead Burg. O encontro mostra que a ameaça demoníaca já alcançou regiões habitadas muito longe de Izalith.",
      en: "A dual-bladed demon occupying the Lower Undead Burg. The encounter shows that the demonic threat has reached inhabited regions far from Izalith.",
    },
    spoilerLore: {
      "pt-BR": "Capra Demons também aparecem em Demon Ruins, deixando clara a origem comum dessa espécie. O chefe do Burg não possui história pessoal confirmada.",
      en: "Capra Demons also appear in the Demon Ruins, making the species' common origin clear. The Burg boss has no confirmed personal history.",
    },
    drops: [
      { "pt-BR": "Key to Depths", en: "Key to Depths" },
      { "pt-BR": "Demon Great Machete — chance de drop", en: "Demon Great Machete — chance drop" },
    ],
  },
  "gaping-dragon": {
    souls: 25000,
    healthNg: "4,401",
    loreIntro: {
      "pt-BR": "Um descendente distante dos dragões antigos, deformado por uma fome sem fim. Sua anatomia extrema transforma o próprio torso em uma enorme mandíbula.",
      en: "A distant descendant of the ancient dragons, warped by endless hunger. Its extreme anatomy turns much of its torso into a gigantic maw.",
    },
    spoilerLore: {
      "pt-BR": "A descrição ligada ao Dragon King Greataxe associa diretamente a criatura aos descendentes dos Everlasting Dragons e à degradação causada por sua voracidade.",
      en: "The Dragon King Greataxe's associated description directly links the creature to descendants of the Everlasting Dragons and to degeneration caused by its voracious appetite.",
    },
    drops: [{ "pt-BR": "Blighttown Key", en: "Blighttown Key" }],
    tailCut: { "pt-BR": "Dragon King Greataxe", en: "Dragon King Greataxe" },
  },
  "chaos-witch-quelaag": {
    souls: 20000,
    healthNg: "3,139",
    loreIntro: {
      "pt-BR": "Quelaag é uma das filhas da Witch of Izalith. A catástrofe da Flame of Chaos alterou seu corpo, mas não apagou sua consciência nem sua ligação com a família.",
      en: "Quelaag is one of the Witch of Izalith's daughters. The Flame of Chaos catastrophe transformed her body without erasing her mind or her bond with her family.",
    },
    spoilerLore: {
      "pt-BR": "Quelaag e sua irmã conhecida como Fair Lady escaparam parcialmente da transformação que consumiu Izalith. Quelaag protege o domínio e reúne Humanity, enquanto sua irmã permanece debilitada pela doença absorvida dos habitantes de Blighttown.",
      en: "Quelaag and the sister known as the Fair Lady partially escaped the transformation that consumed Izalith. Quelaag protects their domain and gathers Humanity while her sister remains weakened by the sickness taken from Blighttown's inhabitants.",
    },
    drops: [
      { "pt-BR": "Soul of Quelaag", en: "Soul of Quelaag" },
      { "pt-BR": "Twin Humanities", en: "Twin Humanities" },
    ],
  },
  "moonlight-butterfly": {
    souls: 10000,
    healthNg: "1,255",
    loreIntro: {
      "pt-BR": "Uma criatura mágica que paira sobre Darkroot Garden. O jogo a relaciona aos experimentos e criações de Seath the Scaleless.",
      en: "A magical creature hovering over Darkroot Garden. The game links it to the experiments and creations of Seath the Scaleless.",
    },
    spoilerLore: {
      "pt-BR": "A Soul of the Moonlight Butterfly é usada para criar equipamentos de natureza mágica, reforçando a ligação da criatura com a pesquisa cristalina de Seath.",
      en: "The Soul of the Moonlight Butterfly can be used to create magic-oriented equipment, reinforcing the creature's connection to Seath's crystal research.",
    },
    drops: [{ "pt-BR": "Soul of the Moonlight Butterfly", en: "Soul of the Moonlight Butterfly" }],
  },
  "great-grey-wolf-sif": {
    souls: 40000,
    healthNg: "3,432",
    loreIntro: {
      "pt-BR": "Sif é o grande lobo companheiro de Artorias e guarda seu túmulo em Darkroot Garden. A espada que carrega transforma o encontro em um eco direto do legado do cavaleiro.",
      en: "Sif is Artorias' great wolf companion and guards his grave in Darkroot Garden. The sword it carries turns the encounter into a direct echo of the knight's legacy.",
    },
    spoilerLore: {
      "pt-BR": "No passado de Oolacile, Artorias protegeu o jovem Sif com seu grande escudo quando ambos foram cercados pelo Abyss. Depois da queda do cavaleiro, Sif permaneceu ligado ao túmulo e ao Covenant of Artorias.",
      en: "In Oolacile's past, Artorias protected the young Sif with his greatshield when both were overwhelmed by the Abyss. After the knight's fall, Sif remained tied to the grave and the Covenant of Artorias.",
    },
    drops: [
      { "pt-BR": "Soul of Sif", en: "Soul of Sif" },
      { "pt-BR": "Covenant of Artorias", en: "Covenant of Artorias" },
    ],
  },
  "iron-golem": {
    souls: 40000,
    healthNg: "2,880",
    loreIntro: {
      "pt-BR": "O guardião de Sen's Fortress é um gigante de ferro criado ao redor do osso de um Everlasting Dragon. Sua função é impedir que qualquer aventureiro indigno alcance Anor Londo.",
      en: "The guardian of Sen's Fortress is an iron giant built around the bone of an Everlasting Dragon. Its purpose is to stop unworthy adventurers from reaching Anor Londo.",
    },
    spoilerLore: {
      "pt-BR": "Seu Core of an Iron Golem preserva a força que anima a construção e pode ser transformado em armas especiais por um ferreiro capaz de trabalhar almas de chefes.",
      en: "Its Core of an Iron Golem preserves the force animating the construct and can be turned into special weapons by a smith capable of working boss souls.",
    },
    drops: [{ "pt-BR": "Core of an Iron Golem", en: "Core of an Iron Golem" }],
  },
  "ornstein-and-smough": {
    souls: 50000,
    healthNg: "Ornstein 1,642 · Smough 2,645 (formas normais)",
    loreIntro: {
      "pt-BR": "Dragon Slayer Ornstein e Executioner Smough defendem a grande catedral de Anor Londo. Ornstein pertenceu aos Four Knights of Gwyn; Smough era o carrasco da cidade e nunca recebeu a mesma honra.",
      en: "Dragon Slayer Ornstein and Executioner Smough defend Anor Londo's great cathedral. Ornstein belonged to Gwyn's Four Knights; Smough was the city's executioner and never received the same honor.",
    },
    spoilerLore: {
      "pt-BR": "O desfecho da luta depende de quem cai primeiro: o sobrevivente absorve o poder do outro e muda de forma. A recompensa também muda conforme o último derrotado.",
      en: "The fight's conclusion depends on who falls first: the survivor absorbs the other's power and changes form. The reward also changes according to who is defeated last.",
    },
    drops: [
      { "pt-BR": "Soul of Ornstein — se Ornstein for derrotado por último", en: "Soul of Ornstein — if Ornstein is defeated last" },
      { "pt-BR": "Leo Ring — se Ornstein for derrotado por último", en: "Leo Ring — if Ornstein is defeated last" },
      { "pt-BR": "Soul of Smough — se Smough for derrotado por último", en: "Soul of Smough — if Smough is defeated last" },
    ],
  },
  "dark-sun-gwyndolin": {
    souls: 40000,
    healthNg: "2,000",
    loreIntro: {
      "pt-BR": "Gwyndolin é o filho mais jovem de Gwyn e a divindade ligada à lua que permanece em Anor Londo. Ele lidera os Blades of the Darkmoon e guarda a tumba honorária do pai.",
      en: "Gwyndolin is Gwyn's youngest child and the moon-aligned deity who remains in Anor Londo. He leads the Blades of the Darkmoon and guards his father's honorary tomb.",
    },
    spoilerLore: {
      "pt-BR": "Gwyndolin mantém a ilusão de Gwynevere e a aparência ensolarada de Anor Londo, preservando uma imagem de grandeza mesmo depois da partida de muitos deuses.",
      en: "Gwyndolin maintains the illusion of Gwynevere and Anor Londo's sunlit appearance, preserving an image of grandeur after many of the gods have departed.",
    },
    drops: [{ "pt-BR": "Soul of Gwyndolin", en: "Soul of Gwyndolin" }],
  },
  "crossbreed-priscilla": {
    souls: 30000,
    healthNg: "2,300",
    loreIntro: {
      "pt-BR": "Priscilla é uma híbrida de dragão e outro ser, isolada no Painted World of Ariamis. Ela não inicia o combate e permite que o jogador deixe seu mundo em paz.",
      en: "Priscilla is a crossbreed of a dragon and another being, isolated within the Painted World of Ariamis. She does not initiate combat and allows the player to leave her world in peace.",
    },
    spoilerLore: {
      "pt-BR": "Seu poder de Lifehunt é descrito como algo temido pelos deuses. A origem exata de sua linhagem não é confirmada pelo jogo, por isso o ÍMPAR não apresenta teorias de parentesco como fato.",
      en: "Her Lifehunt power is described as something feared by the gods. Her exact lineage is not confirmed by the game, so ÍMPAR does not present parentage theories as fact.",
    },
    drops: [{ "pt-BR": "Soul of Priscilla", en: "Soul of Priscilla" }],
    tailCut: { "pt-BR": "Priscilla's Dagger", en: "Priscilla's Dagger" },
  },
  "seath-the-scaleless": {
    souls: 60000,
    healthNg: "5,525",
    loreIntro: {
      "pt-BR": "Seath nasceu sem as escamas de imortalidade dos Everlasting Dragons. Ele traiu sua própria espécie, aliou-se a Gwyn e recebeu o título de Duke junto de um fragmento de Lord Soul.",
      en: "Seath was born without the immortal scales of the Everlasting Dragons. He betrayed his own kind, allied with Gwyn and received a dukedom along with a fragment of a Lord Soul.",
    },
    spoilerLore: {
      "pt-BR": "Obcecado pela imortalidade, Seath conduziu pesquisas com cristais e experimentos em seres vivos. O Primordial Crystal sustenta sua invulnerabilidade até ser destruído no confronto final.",
      en: "Obsessed with immortality, Seath pursued crystal research and experiments on living beings. The Primordial Crystal sustains his invulnerability until it is destroyed in the final confrontation.",
    },
    drops: [{ "pt-BR": "Bequeathed Lord Soul Shard", en: "Bequeathed Lord Soul Shard" }],
    tailCut: { "pt-BR": "Moonlight Greatsword", en: "Moonlight Greatsword" },
  },
  "pinwheel": {
    souls: 15000,
    healthNg: "1,326",
    loreIntro: {
      "pt-BR": "Um necromante mascarado que tomou parte do poder de Gravelord Nito e governa as profundezas das Catacombs. Sua imagem mistura três máscaras associadas a pai, mãe e filho.",
      en: "A masked necromancer who stole some of Gravelord Nito's power and rules the depths of the Catacombs. Its image combines three masks associated with father, mother and child.",
    },
    spoilerLore: {
      "pt-BR": "O jogo mantém a identidade de Pinwheel deliberadamente obscura. As máscaras alimentam interpretações sobre uma família, mas não existe confirmação canônica suficiente para tratar uma teoria específica como biografia oficial.",
      en: "The game keeps Pinwheel's identity deliberately obscure. The masks invite interpretations involving a family, but there is not enough canonical confirmation to present a specific theory as official biography.",
    },
    drops: [
      { "pt-BR": "Rite of Kindling", en: "Rite of Kindling" },
      { "pt-BR": "Mask of the Child, Mother ou Father — uma delas por vitória", en: "Mask of the Child, Mother or Father — one per victory" },
    ],
  },
  "gravelord-nito": {
    souls: 60000,
    healthNg: "4,317",
    loreIntro: {
      "pt-BR": "Nito, o First of the Dead, foi um dos seres que encontrou uma Lord Soul no início da Age of Fire. Seu poder está ligado à morte, doença e decomposição.",
      en: "Nito, the First of the Dead, was one of the beings who found a Lord Soul at the dawn of the Age of Fire. His power is tied to death, disease and decay.",
    },
    spoilerLore: {
      "pt-BR": "Nito participou da guerra contra os dragões liberando uma miasma mortal. Depois, retirou-se para as profundezas e ofereceu grande parte do poder de sua alma à própria morte, tornando-se também a figura central do Gravelord Servant covenant.",
      en: "Nito fought in the war against the dragons by unleashing a deadly miasma. He later withdrew underground and offered much of his soul's power to death itself, also becoming the central figure of the Gravelord Servant covenant.",
    },
    drops: [{ "pt-BR": "Lord Soul", en: "Lord Soul" }],
  },
  "four-kings": {
    souls: 60000,
    healthNg: "9,604 (barra compartilhada)",
    loreIntro: {
      "pt-BR": "Os Four Kings eram governantes de New Londo reconhecidos por Gwyn, que lhes concedeu seus títulos e fragmentos de uma grande alma.",
      en: "The Four Kings were rulers of New Londo recognized by Gwyn, who granted them their titles and fragments of a great soul.",
    },
    spoilerLore: {
      "pt-BR": "Após receberem de uma Primordial Serpent a arte de drenar vida, os reis caíram ao Dark e se tornaram o centro da corrupção de New Londo e dos Darkwraiths.",
      en: "After receiving the art of Lifedrain from a Primordial Serpent, the kings fell to the Dark and became central to New Londo's corruption and the Darkwraiths.",
    },
    drops: [
      { "pt-BR": "Bequeathed Lord Soul Shard", en: "Bequeathed Lord Soul Shard" },
      { "pt-BR": "Humanity x4", en: "Humanity x4" },
    ],
  },
  "ceaseless-discharge": {
    souls: 20000,
    healthNg: "4,200",
    loreIntro: {
      "pt-BR": "O único filho conhecido da Witch of Izalith nasceu consumido por feridas de lava. Suas irmãs criaram para ele o Orange Charred Ring na tentativa de aliviar a dor.",
      en: "The Witch of Izalith's only known son was born consumed by lava sores. His sisters created the Orange Charred Ring in an attempt to ease his pain.",
    },
    spoilerLore: {
      "pt-BR": "Depois de perder o anel, ele foi ainda mais deformado pelo Chaos. No Demon Ruins permanece junto ao corpo de uma das irmãs e sua existência está diretamente ligada ao mar de lava que bloqueia a progressão.",
      en: "After losing the ring, he was further warped by Chaos. In the Demon Ruins he remains beside the body of one of his sisters, and his existence is directly tied to the lava sea blocking progression.",
    },
    drops: [{ "pt-BR": "Nenhum drop único", en: "No unique drop" }],
  },
  "demon-firesage": {
    souls: 20000,
    healthNg: "5,950",
    loreIntro: {
      "pt-BR": "Um demônio ancestral descrito como o último mestre das antigas artes do fogo. Apesar do nome, seus ataques explosivos não são simplesmente dano de fogo.",
      en: "An ancient demon described as the last master of the old fire arts. Despite the name, its explosive attacks are not simply fire damage.",
    },
    spoilerLore: {
      "pt-BR": "Sua aparência e movimentos lembram diretamente Asylum Demon e Stray Demon, funcionando como uma conexão tardia entre aquela linhagem demoníaca e as ruínas de Izalith.",
      en: "Its appearance and moves directly resemble the Asylum Demon and Stray Demon, serving as a late-game connection between that demonic lineage and the ruins of Izalith.",
    },
    drops: [{ "pt-BR": "Demon's Catalyst", en: "Demon's Catalyst" }],
  },
  "centipede-demon": {
    souls: 40000,
    healthNg: "3,432",
    loreIntro: {
      "pt-BR": "Uma criatura nascida no local onde o filho da Witch of Izalith perdeu o Orange Charred Ring. O corpo do demônio parece ter crescido ao redor dessa ligação com a lava.",
      en: "A creature born where the Witch of Izalith's son lost the Orange Charred Ring. The demon's body appears to have grown around that connection to lava.",
    },
    spoilerLore: {
      "pt-BR": "Derrotá-lo garante o Orange Charred Ring, item que permite atravessar grandes áreas de lava e seguir em direção a Lost Izalith.",
      en: "Defeating it guarantees the Orange Charred Ring, allowing travel across large lava fields on the way to Lost Izalith.",
    },
    drops: [{ "pt-BR": "Orange Charred Ring", en: "Orange Charred Ring" }],
    tailCut: { "pt-BR": "O próprio Orange Charred Ring pode ser obtido durante a luta ao cortar o apêndice", en: "The Orange Charred Ring itself can be obtained during the fight by severing the appendage" },
  },
  "bed-of-chaos": {
    souls: 60000,
    healthNg: "2 pontos de objetivo (gimmick)",
    loreIntro: {
      "pt-BR": "O Bed of Chaos é o resultado da tentativa da Witch of Izalith de reproduzir a First Flame. O experimento criou a Flame of Chaos e transformou Izalith para sempre.",
      en: "The Bed of Chaos is the result of the Witch of Izalith's attempt to recreate the First Flame. The experiment created the Flame of Chaos and changed Izalith forever.",
    },
    spoilerLore: {
      "pt-BR": "A Witch e seguidores foram consumidos pela nova chama, e o Bed of Chaos tornou-se a fonte dos demônios. O Lord Soul obtido aqui ainda carrega poder suficiente para alimentar o Lordvessel.",
      en: "The Witch and her followers were consumed by the new flame, and the Bed of Chaos became the source of demons. The Lord Soul obtained here still carries enough power to feed the Lordvessel.",
    },
    drops: [{ "pt-BR": "Lord Soul", en: "Lord Soul" }],
  },
  "gwyn-lord-of-cinder": {
    souls: 70000,
    healthNg: "4,250",
    loreIntro: {
      "pt-BR": "Gwyn encontrou uma Lord Soul no início da Age of Fire e liderou a guerra que derrubou os Everlasting Dragons. Seu nome está ligado ao sol, aos raios e à fundação da ordem dos deuses em Anor Londo.",
      en: "Gwyn found a Lord Soul at the dawn of the Age of Fire and led the war that overthrew the Everlasting Dragons. His name is tied to sunlight, lightning and the divine order centered on Anor Londo.",
    },
    spoilerLore: {
      "pt-BR": "Quando a First Flame começou a apagar, Gwyn entregou grande parte de seu poder e se ofereceu como combustível para prolongar a Age of Fire. O ato o reduziu ao Lord of Cinder encontrado no Kiln of the First Flame.",
      en: "When the First Flame began to fade, Gwyn gave away much of his power and offered himself as fuel to prolong the Age of Fire. The act reduced him to the Lord of Cinder encountered in the Kiln of the First Flame.",
    },
    drops: [{ "pt-BR": "Soul of Gwyn, Lord of Cinder", en: "Soul of Gwyn, Lord of Cinder" }],
    notes: [{ "pt-BR": "Derrotá-lo encerra a run atual e leva ao final/NG+; conclua pendências antes da luta.", en: "Defeating him ends the current run and leads into the ending/NG+; finish unfinished business before the fight." }],
  },
  "sanctuary-guardian": {
    souls: 30000,
    healthNg: "2,560",
    loreIntro: {
      "pt-BR": "Uma criatura quimérica semelhante a uma manticora que protege a entrada de Oolacile Sanctuary. É o primeiro grande obstáculo do conteúdo adicional.",
      en: "A manticore-like chimeric creature guarding the entrance to Oolacile Sanctuary. It is the first major obstacle of the additional content.",
    },
    spoilerLore: {
      "pt-BR": "O jogo oferece pouca biografia individual para o Guardian. Sua função narrativa é marcar que o jogador entrou em uma região do passado protegida por criaturas muito diferentes das encontradas em Lordran atual.",
      en: "The game offers little individual biography for the Guardian. Its narrative role is to mark entry into a past region protected by creatures very different from those found in present-day Lordran.",
    },
    drops: [{ "pt-BR": "Guardian Soul", en: "Guardian Soul" }],
    tailCut: { "pt-BR": "Guardian Tail", en: "Guardian Tail" },
  },
  "artorias-the-abysswalker": {
    souls: 50000,
    healthNg: "3,750",
    loreIntro: {
      "pt-BR": "Sir Artorias foi um dos Four Knights of Gwyn, célebre pela habilidade com a greatsword e pela capacidade de enfrentar o Abyss. Seu símbolo é o lobo, e Sif tornou-se seu companheiro.",
      en: "Sir Artorias was one of Gwyn's Four Knights, famed for his greatsword skill and ability to face the Abyss. His symbol is the wolf, and Sif became his companion.",
    },
    spoilerLore: {
      "pt-BR": "Em Oolacile, Artorias foi vencido pelo Abyss. Antes de cair, usou seu grande escudo para proteger Sif; quando o jogador o encontra, o cavaleiro já está corrompido e luta com um braço inutilizado.",
      en: "In Oolacile, Artorias was defeated by the Abyss. Before falling, he used his greatshield to protect Sif; when the player finds him, the knight is already corrupted and fights with one arm disabled.",
    },
    drops: [{ "pt-BR": "Soul of Artorias", en: "Soul of Artorias" }],
  },
  "black-dragon-kalameet": {
    souls: 60000,
    healthNg: "5,400",
    loreIntro: {
      "pt-BR": "Kalameet é um dos últimos dragões antigos ainda vivos na era visitada em Oolacile. Mesmo guerreiros de Anor Londo evitavam enfrentá-lo diretamente.",
      en: "Kalameet is one of the last ancient dragons still alive in the era visited in Oolacile. Even Anor Londo's warriors avoided confronting it directly.",
    },
    spoilerLore: {
      "pt-BR": "Hawkeye Gough pode derrubá-lo do céu com seu greatbow, permitindo o duelo em terra. Ainda assim, Kalameet permanece um dos encontros opcionais mais perigosos do conteúdo adicional.",
      en: "Hawkeye Gough can bring it down from the sky with his greatbow, enabling a ground duel. Even then, Kalameet remains one of the additional content's most dangerous optional encounters.",
    },
    drops: [{ "pt-BR": "Calamity Ring", en: "Calamity Ring" }],
    tailCut: { "pt-BR": "Obsidian Greatsword", en: "Obsidian Greatsword" },
  },
  "manus-father-of-the-abyss": {
    souls: 60000,
    healthNg: "6,665",
    loreIntro: {
      "pt-BR": "Manus é descrito como um humano primordial cuja Humanity saiu de controle. O despertar dele está no centro da expansão do Abyss em Oolacile.",
      en: "Manus is described as a primeval human whose Humanity went wild. His awakening is central to the Abyss spreading through Oolacile.",
    },
    spoilerLore: {
      "pt-BR": "O povo de Oolacile despertou Manus por influência de uma Primordial Serpent. Sua busca pelo Broken Pendant e a humanidade descontrolada deformaram a região. A ideia de que ele seja o Furtive Pygmy é teoria, não confirmação canônica.",
      en: "Oolacile awakened Manus under the influence of a Primordial Serpent. His search for the Broken Pendant and runaway Humanity warped the region. The idea that he is the Furtive Pygmy is a theory, not confirmed canon.",
    },
    drops: [
      { "pt-BR": "Soul of Manus", en: "Soul of Manus" },
      { "pt-BR": "Humanity x10", en: "Humanity x10" },
    ],
  },
};
