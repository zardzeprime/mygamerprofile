import type { Locale } from "@/i18n/translations";

export type BossRequirement = "required" | "optional";

type LocalizedText = Record<Locale, string>;

export type DarkSoulsBoss = {
  order: number;
  name: string;
  slug: string;
  location: LocalizedText;
  requiredStatus: BossRequirement;
  dlc: boolean;
  combatType: LocalizedText;
  shortSummary: LocalizedText;
  combatStyle: LocalizedText;
  spoilerContext: LocalizedText | null;
  weaknesses: LocalizedText[] | null;
  resistances: LocalizedText[] | null;
  image_url: string | null;
  hero_image_url: string | null;
};

export const DARK_SOULS_BOSSES: DarkSoulsBoss[] = [
  {
    order: 1,
    name: "Asylum Demon",
    slug: "asylum-demon",
    location: { "pt-BR": "Northern Undead Asylum", en: "Northern Undead Asylum" },
    requiredStatus: "required",
    dlc: false,
    combatType: { "pt-BR": "Corpo a corpo pesado", en: "Heavy melee" },
    shortSummary: {
      "pt-BR": "O primeiro grande teste de Dark Souls. O Asylum Demon apresenta a lógica básica dos chefes do jogo: observar animações, respeitar alcance e atacar apenas quando existe uma abertura clara.",
      en: "Dark Souls' first major test. The Asylum Demon introduces the game's basic boss language: read animations, respect range and attack only when a clear opening appears.",
    },
    combatStyle: {
      "pt-BR": "Lento e de grande alcance, usa golpes amplos e impactos no chão. A arena oferece espaço para circular, e ficar atento ao posicionamento costuma ser mais importante do que atacar sem parar.",
      en: "Slow but wide-reaching, with sweeping strikes and ground impacts. The arena gives room to circle, and positioning matters more than constant aggression.",
    },
    spoilerContext: {
      "pt-BR": "Ele funciona como a barreira final da fuga do Asilo dos Mortos-Vivos e estabelece o tom de aprendizado por tentativa, observação e exploração.",
      en: "It serves as the final barrier to escaping the Undead Asylum and establishes the game's trial, observation and exploration-driven learning loop.",
    },
    weaknesses: [{ "pt-BR": "Fogo", en: "Fire" }, { "pt-BR": "Corte", en: "Slash" }],
    resistances: [],
    image_url: null,
    hero_image_url: null,
  },
  {
    order: 2,
    name: "Taurus Demon",
    slug: "taurus-demon",
    location: { "pt-BR": "Undead Burg", en: "Undead Burg" },
    requiredStatus: "optional",
    dlc: false,
    combatType: { "pt-BR": "Corpo a corpo em espaço estreito", en: "Melee in a narrow arena" },
    shortSummary: {
      "pt-BR": "Um demônio gigantesco que bloqueia uma muralha do Undead Burg. A luta reforça a importância de ler o cenário, controlar distância e não se deixar encurralar.",
      en: "A towering demon blocking a wall in the Undead Burg. The fight reinforces environmental awareness, distance control and the danger of being cornered.",
    },
    combatStyle: {
      "pt-BR": "Ataca com saltos, golpes verticais e varridas de longo alcance. Como a ponte é estreita, administrar espaço e direção de esquiva é a principal dificuldade.",
      en: "Uses leaps, overhead blows and long sweeps. Because the bridge is narrow, managing space and dodge direction is the main challenge.",
    },
    spoilerContext: {
      "pt-BR": "Apesar de ser um encontro marcante do caminho tradicional, rotas alternativas permitem contorná-lo, por isso ele é tratado como opcional no ÍMPAR.",
      en: "Although it is a memorable encounter on the traditional route, alternate paths can bypass it, so ÍMPAR classifies it as optional.",
    },
    weaknesses: [{ "pt-BR": "Raio", en: "Lightning" }],
    resistances: [],
    image_url: null,
    hero_image_url: null,
  },
  {
    order: 3,
    name: "Bell Gargoyles",
    slug: "bell-gargoyles",
    location: { "pt-BR": "Undead Parish", en: "Undead Parish" },
    requiredStatus: "required",
    dlc: false,
    combatType: { "pt-BR": "Dupla, corpo a corpo e fogo", en: "Duo, melee and fire" },
    shortSummary: {
      "pt-BR": "Uma das primeiras lutas que muda de ritmo no meio do confronto. Quando a segunda gárgula entra, o desafio passa a ser controlar duas ameaças e evitar ficar preso entre elas.",
      en: "One of the first fights to change rhythm mid-battle. Once the second gargoyle joins, the challenge becomes tracking two threats and avoiding being trapped between them.",
    },
    combatStyle: {
      "pt-BR": "Mistura golpes de alabarda, investidas e sopro de fogo. Separar os dois inimigos e manter ambos no campo de visão reduz bastante o risco de ataques fora da tela.",
      en: "Mixes halberd strikes, lunges and fire breath. Separating the enemies and keeping both visible greatly reduces off-screen pressure.",
    },
    spoilerContext: {
      "pt-BR": "A vitória dá acesso a um dos Sinos do Despertar, um dos objetivos centrais da primeira parte da jornada.",
      en: "Victory grants access to one of the Bells of Awakening, a central objective in the first part of the journey.",
    },
    weaknesses: [{ "pt-BR": "Fogo", en: "Fire" }, { "pt-BR": "Raio", en: "Lightning" }],
    resistances: [],
    image_url: null,
    hero_image_url: null,
  },
  {
    order: 4,
    name: "Capra Demon",
    slug: "capra-demon",
    location: { "pt-BR": "Lower Undead Burg", en: "Lower Undead Burg" },
    requiredStatus: "optional",
    dlc: false,
    combatType: { "pt-BR": "Pressão imediata em arena pequena", en: "Immediate pressure in a small arena" },
    shortSummary: {
      "pt-BR": "O Capra Demon é lembrado menos pelo tamanho e mais pelo espaço apertado. A luta começa sem dar muito tempo para reorganizar câmera e posicionamento.",
      en: "The Capra Demon is remembered less for its size than for its cramped arena. The fight begins with very little time to stabilize camera and positioning.",
    },
    combatStyle: {
      "pt-BR": "É agressivo, usa duas lâminas e divide a arena com cães. Sobreviver aos primeiros segundos e criar espaço costuma ser a parte decisiva do encontro.",
      en: "It is aggressive, dual-wields blades and shares the arena with dogs. Surviving the opening seconds and creating space is usually the decisive part of the encounter.",
    },
    spoilerContext: {
      "pt-BR": "Derrotá-lo abre o caminho tradicional para The Depths, embora outras rotas possam evitar essa sequência.",
      en: "Defeating it opens the traditional route to The Depths, although alternate routes can bypass that sequence.",
    },
    weaknesses: [{ "pt-BR": "Fogo", en: "Fire" }],
    resistances: [],
    image_url: null,
    hero_image_url: null,
  },
  {
    order: 5,
    name: "Gaping Dragon",
    slug: "gaping-dragon",
    location: { "pt-BR": "The Depths", en: "The Depths" },
    requiredStatus: "optional",
    dlc: false,
    combatType: { "pt-BR": "Monstro de grande porte", en: "Large monster" },
    shortSummary: {
      "pt-BR": "Uma criatura enorme e visualmente incomum encontrada nas profundezas. O tamanho intimida, mas seus movimentos muito marcados permitem aprender o confronto com observação.",
      en: "A huge and visually unusual creature found deep below the city. Its size is intimidating, but strongly telegraphed movements make the encounter learnable through observation.",
    },
    combatStyle: {
      "pt-BR": "Alterna investidas longas, pancadas corporais e ataques de cauda. A arena ampla favorece distância e reposicionamento, mas alguns golpes cobrem uma área considerável.",
      en: "Alternates long charges, body slams and tail attacks. The large arena rewards spacing and repositioning, though several attacks cover a substantial area.",
    },
    spoilerContext: {
      "pt-BR": "É o chefe do caminho tradicional pelas profundezas rumo a Blighttown, mas não é obrigatório para concluir o jogo.",
      en: "It is the boss of the traditional route through the depths toward Blighttown, but it is not required to finish the game.",
    },
    weaknesses: [{ "pt-BR": "Raio", en: "Lightning" }],
    resistances: [],
    image_url: null,
    hero_image_url: null,
  },
  {
    order: 6,
    name: "Chaos Witch Quelaag",
    slug: "chaos-witch-quelaag",
    location: { "pt-BR": "Quelaag's Domain", en: "Quelaag's Domain" },
    requiredStatus: "required",
    dlc: false,
    combatType: { "pt-BR": "Corpo a corpo, fogo e controle de área", en: "Melee, fire and area control" },
    shortSummary: {
      "pt-BR": "Quelaag combina uma combatente humanoide com uma enorme criatura aracnídea. É um encontro de leitura visual clara, mas com fogo capaz de limitar rapidamente as rotas de fuga.",
      en: "Quelaag combines a humanoid fighter with a massive spider-like creature. Her cues are readable, but lingering fire can quickly restrict escape routes.",
    },
    combatStyle: {
      "pt-BR": "Mistura golpes de espada, jatos de lava e explosões próximas ao corpo. A dificuldade vem de equilibrar agressão com atenção ao terreno que vai ficando coberto por lava.",
      en: "Mixes sword attacks, lava streams and close-range explosions. The challenge is balancing aggression with awareness of terrain increasingly covered by lava.",
    },
    spoilerContext: {
      "pt-BR": "Após a luta, o jogador alcança o segundo Sino do Despertar, encerrando uma etapa importante da progressão inicial.",
      en: "After the fight, the player reaches the second Bell of Awakening, completing a major stage of early progression.",
    },
    weaknesses: [{ "pt-BR": "Raio", en: "Lightning" }],
    resistances: [{ "pt-BR": "Fogo", en: "Fire" }],
    image_url: null,
    hero_image_url: null,
  },
  {
    order: 7,
    name: "Moonlight Butterfly",
    slug: "moonlight-butterfly",
    location: { "pt-BR": "Darkroot Garden", en: "Darkroot Garden" },
    requiredStatus: "optional",
    dlc: false,
    combatType: { "pt-BR": "Ataques mágicos à distância", en: "Ranged magic" },
    shortSummary: {
      "pt-BR": "Um chefe incomum que passa boa parte do confronto fora do alcance de armas corpo a corpo. O encontro testa paciência e esquiva contra projéteis mágicos.",
      en: "An unusual boss that spends much of the fight outside melee range. The encounter tests patience and dodging against magical projectiles.",
    },
    combatStyle: {
      "pt-BR": "Ataca à distância enquanto voa ao lado de uma ponte estreita. Periodicamente pousa e oferece uma janela clara para dano corpo a corpo.",
      en: "Attacks from range while flying beside a narrow bridge. It periodically lands, creating a clear window for melee damage.",
    },
    spoilerContext: {
      "pt-BR": "É um encontro totalmente opcional em Darkroot Garden e recompensa exploração fora da rota principal.",
      en: "It is a fully optional encounter in Darkroot Garden and rewards exploration away from the main route.",
    },
    weaknesses: [{ "pt-BR": "Fogo", en: "Fire" }],
    resistances: [{ "pt-BR": "Magia", en: "Magic" }],
    image_url: null,
    hero_image_url: null,
  },
  {
    order: 8,
    name: "Great Grey Wolf Sif",
    slug: "great-grey-wolf-sif",
    location: { "pt-BR": "Darkroot Garden", en: "Darkroot Garden" },
    requiredStatus: "required",
    dlc: false,
    combatType: { "pt-BR": "Combate móvel com espada", en: "Mobile sword combat" },
    shortSummary: {
      "pt-BR": "Sif é um lobo gigante que empunha uma espada e transforma alcance em mobilidade. A luta é direta mecanicamente, mas ganhou destaque também pelo peso narrativo do encontro.",
      en: "Sif is a giant wolf wielding a sword, turning reach into mobility. Mechanically direct, the fight is also remembered for its narrative weight.",
    },
    combatStyle: {
      "pt-BR": "Usa varridas largas, saltos e reposicionamentos constantes. Permanecer muito longe facilita ser alcançado pela lâmina; aproximar-se exige leitura correta das sequências.",
      en: "Uses wide sweeps, leaps and constant repositioning. Staying too far away makes the sword's reach dangerous, while closing in demands accurate reads.",
    },
    spoilerContext: {
      "pt-BR": "Sif protege um túmulo e deixa um anel necessário para atravessar o Abismo durante a progressão principal.",
      en: "Sif guards a grave and leaves behind a ring required to traverse the Abyss during the main progression.",
    },
    weaknesses: [{ "pt-BR": "Fogo", en: "Fire" }],
    resistances: [],
    image_url: null,
    hero_image_url: null,
  },
  {
    order: 9,
    name: "Iron Golem",
    slug: "iron-golem",
    location: { "pt-BR": "Sen's Fortress", en: "Sen's Fortress" },
    requiredStatus: "required",
    dlc: false,
    combatType: { "pt-BR": "Gigante pesado em arena elevada", en: "Heavy giant on an elevated arena" },
    shortSummary: {
      "pt-BR": "O guardião final de Sen's Fortress é uma massa de ferro lenta, porém poderosa. O cenário é parte importante do confronto por causa das bordas da arena.",
      en: "The final guardian of Sen's Fortress is a slow but powerful mass of iron. The arena itself matters because of its exposed edges.",
    },
    combatStyle: {
      "pt-BR": "Alterna agarrões, golpes pesados e ataques de alcance. Acumular dano nas pernas pode desequilibrá-lo, enquanto lutar perto das bordas aumenta o risco para os dois lados.",
      en: "Alternates grabs, heavy strikes and ranged pressure. Sustained damage to its legs can stagger it, while fighting near the edges raises the stakes for both sides.",
    },
    spoilerContext: {
      "pt-BR": "Sua derrota libera a transição para Anor Londo, marcando uma mudança importante de escala na jornada.",
      en: "Defeating it opens the way to Anor Londo, marking a major shift in the scale of the journey.",
    },
    weaknesses: [{ "pt-BR": "Raio", en: "Lightning" }],
    resistances: [{ "pt-BR": "Corte", en: "Slash" }],
    image_url: null,
    hero_image_url: null,
  },
  {
    order: 10,
    name: "Dragon Slayer Ornstein and Executioner Smough",
    slug: "ornstein-and-smough",
    location: { "pt-BR": "Anor Londo", en: "Anor Londo" },
    requiredStatus: "required",
    dlc: false,
    combatType: { "pt-BR": "Dupla com ritmos complementares", en: "Duo with complementary rhythms" },
    shortSummary: {
      "pt-BR": "Ornstein e Smough são um dos confrontos mais conhecidos de Dark Souls. A dupla combina velocidade, alcance e pressão para obrigar o jogador a controlar câmera, distância e linha de visão.",
      en: "Ornstein and Smough are among Dark Souls' most recognizable encounters. The duo combines speed, reach and pressure, demanding camera control, spacing and line-of-sight management.",
    },
    combatStyle: {
      "pt-BR": "Ornstein é rápido e cobre distância com facilidade; Smough é mais lento, mas domina grande área. A segunda fase muda dependendo de qual deles é derrotado primeiro.",
      en: "Ornstein is fast and closes distance easily; Smough is slower but controls large areas. The second phase changes depending on which one is defeated first.",
    },
    spoilerContext: {
      "pt-BR": "A vitória permite obter o Lordvessel, item que redefine a exploração e abre a fase seguinte da progressão principal.",
      en: "Victory allows the player to obtain the Lordvessel, an item that reshapes exploration and opens the next stage of the main progression.",
    },
    weaknesses: [{ "pt-BR": "Ornstein: magia e fogo; Smough: fogo e raio na forma normal", en: "Ornstein: magic and fire; Smough: fire and lightning in normal form" }],
    resistances: [{ "pt-BR": "Ornstein: raio; Smough: impacto", en: "Ornstein: lightning; Smough: strike" }],
    image_url: null,
    hero_image_url: null,
  },
  {
    order: 11,
    name: "Dark Sun Gwyndolin",
    slug: "dark-sun-gwyndolin",
    location: { "pt-BR": "Anor Londo", en: "Anor Londo" },
    requiredStatus: "optional",
    dlc: false,
    combatType: { "pt-BR": "Perseguição e magia à distância", en: "Pursuit and ranged magic" },
    shortSummary: {
      "pt-BR": "Um encontro opcional muito diferente do restante do jogo. Gwyndolin recua por um corredor aparentemente interminável enquanto responde com ataques mágicos e projéteis.",
      en: "A very different optional encounter. Gwyndolin retreats through an apparently endless corridor while answering with magic and projectiles.",
    },
    combatStyle: {
      "pt-BR": "Exige avançar de cobertura em cobertura e reconhecer rapidamente cada tipo de disparo. O dano acontece em janelas curtas após reduzir a distância.",
      en: "Requires moving from cover to cover and quickly identifying each projectile pattern. Damage comes in short windows after closing the distance.",
    },
    spoilerContext: {
      "pt-BR": "O confronto está ligado aos segredos de Anor Londo e só ocorre quando o jogador decide desafiar diretamente essa figura.",
      en: "The encounter is tied to Anor Londo's hidden truths and only occurs when the player chooses to directly challenge this figure.",
    },
    weaknesses: [{ "pt-BR": "Fogo", en: "Fire" }],
    resistances: [],
    image_url: null,
    hero_image_url: null,
  },
  {
    order: 12,
    name: "Crossbreed Priscilla",
    slug: "crossbreed-priscilla",
    location: { "pt-BR": "Painted World of Ariamis", en: "Painted World of Ariamis" },
    requiredStatus: "optional",
    dlc: false,
    combatType: { "pt-BR": "Invisibilidade e combate corpo a corpo", en: "Invisibility and melee" },
    shortSummary: {
      "pt-BR": "Priscilla é uma chefe opcional que não inicia o combate imediatamente. Caso o jogador escolha enfrentá-la, a mecânica central passa a ser localizar seus movimentos durante a invisibilidade.",
      en: "Priscilla is an optional boss who does not begin hostile. If the player chooses to fight, the central mechanic becomes tracking her movement while invisible.",
    },
    combatStyle: {
      "pt-BR": "Usa uma foice e pode desaparecer visualmente. Marcas no chão ajudam a indicar sua posição, transformando observação do ambiente em parte da luta.",
      en: "Uses a scythe and can disappear from sight. Marks on the ground reveal her position, making environmental observation part of the fight.",
    },
    spoilerContext: {
      "pt-BR": "Ela habita uma área isolada do mundo principal e oferece ao jogador a possibilidade de sair sem iniciar o confronto.",
      en: "She inhabits an isolated area of the world and allows the player to leave without starting the battle.",
    },
    weaknesses: [{ "pt-BR": "Fogo", en: "Fire" }, { "pt-BR": "Raio", en: "Lightning" }],
    resistances: [],
    image_url: null,
    hero_image_url: null,
  },
  {
    order: 13,
    name: "Stray Demon",
    slug: "stray-demon",
    location: { "pt-BR": "Northern Undead Asylum", en: "Northern Undead Asylum" },
    requiredStatus: "optional",
    dlc: false,
    combatType: { "pt-BR": "Corpo a corpo e explosões mágicas", en: "Melee and magic blasts" },
    shortSummary: {
      "pt-BR": "Uma versão muito mais perigosa do primeiro demônio do jogo, encontrada ao retornar ao Asilo. O espaço e as explosões amplas tornam erros de posicionamento especialmente custosos.",
      en: "A far more dangerous counterpart to the game's first demon, found after returning to the Asylum. Limited space and broad explosions make positioning errors especially costly.",
    },
    combatStyle: {
      "pt-BR": "Mantém golpes pesados do arquétipo de demônio, mas adiciona ondas explosivas com grande área. Permanecer atento ao início das animações é essencial para saber quando recuar.",
      en: "Keeps the heavy demon archetype but adds large-area explosive waves. Reading the start of each animation is essential for knowing when to disengage.",
    },
    spoilerContext: {
      "pt-BR": "É um desafio de retorno: só aparece ao explorar novamente uma área que parecia já encerrada.",
      en: "It is a return challenge, discovered by revisiting an area that initially seemed complete.",
    },
    weaknesses: [{ "pt-BR": "Magia, raio e corte", en: "Magic, lightning and slash" }],
    resistances: [{ "pt-BR": "Impacto", en: "Strike" }],
    image_url: null,
    hero_image_url: null,
  },
  {
    order: 14,
    name: "Pinwheel",
    slug: "pinwheel",
    location: { "pt-BR": "The Catacombs", en: "The Catacombs" },
    requiredStatus: "required",
    dlc: false,
    combatType: { "pt-BR": "Magia e cópias", en: "Magic and clones" },
    shortSummary: {
      "pt-BR": "Pinwheel é um chefe pequeno em comparação com muitos encontros próximos, mas possui uma identidade própria baseada em magia e multiplicação de alvos.",
      en: "Pinwheel is a smaller-scale boss compared with many nearby encounters, but has a distinct identity built around magic and multiplying targets.",
    },
    combatStyle: {
      "pt-BR": "Cria cópias e dispara magia à distância. Pressão ofensiva rápida pode impedir que o número de ameaças cresça, enquanto hesitar torna a leitura da arena mais confusa.",
      en: "Creates copies and casts ranged magic. Quick offensive pressure can prevent the number of threats from growing, while hesitation makes the arena harder to read.",
    },
    spoilerContext: {
      "pt-BR": "A luta fica no caminho entre as Catacumbas e a Tomb of the Giants e concede acesso a uma mecânica importante ligada às fogueiras.",
      en: "The fight lies between the Catacombs and the Tomb of the Giants and grants access to an important bonfire-related mechanic.",
    },
    weaknesses: [{ "pt-BR": "Magia, fogo e raio", en: "Magic, fire and lightning" }],
    resistances: [],
    image_url: null,
    hero_image_url: null,
  },
  {
    order: 15,
    name: "Gravelord Nito",
    slug: "gravelord-nito",
    location: { "pt-BR": "Tomb of the Giants", en: "Tomb of the Giants" },
    requiredStatus: "required",
    dlc: false,
    combatType: { "pt-BR": "Chefe pesado com inimigos auxiliares", en: "Heavy boss with supporting enemies" },
    shortSummary: {
      "pt-BR": "Nito ocupa uma arena escura cercado por esqueletos, criando uma luta em que a ameaça não vem apenas do chefe. Seus ataques têm grande alcance e impacto visual claro.",
      en: "Nito fights in a dark arena surrounded by skeletons, creating a battle where the boss is not the only threat. His attacks have broad reach and clear visual impact.",
    },
    combatStyle: {
      "pt-BR": "Combina golpes lentos, explosões e ataques que podem atingir à distância. Controlar quais esqueletos são atraídos e evitar correr sem necessidade ajuda a manter o encontro legível.",
      en: "Combines slow swings, explosions and attacks that can reach from afar. Managing which skeletons are engaged and avoiding unnecessary movement keeps the encounter readable.",
    },
    spoilerContext: {
      "pt-BR": "Nito é um dos portadores das grandes almas necessárias para alimentar o Lordvessel na parte final da campanha.",
      en: "Nito is one of the holders of the great souls needed to fill the Lordvessel during the later campaign.",
    },
    weaknesses: [{ "pt-BR": "Fogo", en: "Fire" }],
    resistances: [],
    image_url: null,
    hero_image_url: null,
  },
  {
    order: 16,
    name: "Seath the Scaleless",
    slug: "seath-the-scaleless",
    location: { "pt-BR": "Crystal Cave", en: "Crystal Cave" },
    requiredStatus: "required",
    dlc: false,
    combatType: { "pt-BR": "Grande porte, cristais e maldição", en: "Large-scale, crystals and curse" },
    shortSummary: {
      "pt-BR": "Seath domina boa parte da arena com o próprio corpo e ataques cristalinos. É um encontro em que posicionamento lateral e atenção aos efeitos no chão têm grande peso.",
      en: "Seath controls much of the arena with his body and crystal attacks. Side positioning and awareness of ground effects play a major role in the encounter.",
    },
    combatStyle: {
      "pt-BR": "Espalha cristais em área, gira o corpo e pune quem permanece diretamente à frente por muito tempo. O tamanho do modelo também pode dificultar câmera e leitura de espaço.",
      en: "Spreads crystal growths across the arena, turns his body and punishes staying directly in front for too long. His size can also complicate camera and spatial awareness.",
    },
    spoilerContext: {
      "pt-BR": "O confronto definitivo depende de destruir a fonte de sua imortalidade dentro da Crystal Cave. Seath guarda uma das almas necessárias para a progressão final.",
      en: "The definitive confrontation depends on breaking the source of his immortality within the Crystal Cave. Seath holds one of the souls required for final progression.",
    },
    weaknesses: [{ "pt-BR": "Fogo e raio", en: "Fire and lightning" }],
    resistances: [{ "pt-BR": "Magia", en: "Magic" }],
    image_url: null,
    hero_image_url: null,
  },
  {
    order: 17,
    name: "Four Kings",
    slug: "four-kings",
    location: { "pt-BR": "The Abyss, New Londo Ruins", en: "The Abyss, New Londo Ruins" },
    requiredStatus: "required",
    dlc: false,
    combatType: { "pt-BR": "Pressão por tempo e múltiplos inimigos", en: "Time pressure and multiple enemies" },
    shortSummary: {
      "pt-BR": "Os Four Kings transformam dano por segundo em parte central da estratégia. Novos reis entram no combate com o passar do tempo, então prolongar cada duelo aumenta rapidamente a pressão.",
      en: "The Four Kings make damage output part of the core strategy. New kings enter over time, so extending each duel rapidly increases pressure.",
    },
    combatStyle: {
      "pt-BR": "Alternam golpes de espada, magia e agarrões em uma arena sem referências visuais tradicionais. A percepção de distância pode enganar, e eliminar um alvo antes da chegada do próximo simplifica muito a luta.",
      en: "They alternate sword attacks, magic and grabs in an arena without normal visual landmarks. Distance can be deceptive, and eliminating one target before the next arrives greatly simplifies the fight.",
    },
    spoilerContext: {
      "pt-BR": "Para sobreviver no Abismo, o jogador precisa de um item ligado a Sif. Os Four Kings guardam uma das almas exigidas na reta final.",
      en: "To survive in the Abyss, the player needs an item tied to Sif. The Four Kings guard one of the souls required in the late game.",
    },
    weaknesses: [{ "pt-BR": "Fogo e raio", en: "Fire and lightning" }],
    resistances: [],
    image_url: null,
    hero_image_url: null,
  },
  {
    order: 18,
    name: "Ceaseless Discharge",
    slug: "ceaseless-discharge",
    location: { "pt-BR": "Demon Ruins", en: "Demon Ruins" },
    requiredStatus: "optional",
    dlc: false,
    combatType: { "pt-BR": "Grande alcance e terreno", en: "Long reach and terrain" },
    shortSummary: {
      "pt-BR": "Uma criatura gigantesca que ataca através de grandes distâncias nas Demon Ruins. A geometria da área influencia bastante como o combate se desenvolve.",
      en: "A gigantic creature that attacks across long distances in the Demon Ruins. The area's geometry strongly influences how the encounter plays out.",
    },
    combatStyle: {
      "pt-BR": "Usa braços enormes e ataques de fogo para alcançar o jogador. Há diferentes formas de conduzir a luta dependendo de onde o chefe é atraído dentro da arena.",
      en: "Uses enormous limbs and fire attacks to reach the player. The fight can unfold differently depending on where the boss is drawn within the arena.",
    },
    spoilerContext: {
      "pt-BR": "O encontro está associado à descida pelas Demon Ruins, mas rotas alternativas podem contornar parte dessa sequência.",
      en: "The encounter is associated with the descent through the Demon Ruins, though alternate routes can bypass part of that sequence.",
    },
    weaknesses: [{ "pt-BR": "Sem fraqueza elemental dominante confirmada", en: "No dominant elemental weakness confirmed" }],
    resistances: [],
    image_url: null,
    hero_image_url: null,
  },
  {
    order: 19,
    name: "Demon Firesage",
    slug: "demon-firesage",
    location: { "pt-BR": "Demon Ruins", en: "Demon Ruins" },
    requiredStatus: "optional",
    dlc: false,
    combatType: { "pt-BR": "Corpo a corpo e explosões", en: "Melee and explosions" },
    shortSummary: {
      "pt-BR": "O Demon Firesage reutiliza a silhueta de demônios encontrados antes, mas acrescenta explosões mágicas e um espaço de luta diferente.",
      en: "The Demon Firesage revisits the silhouette of earlier demons while adding magical explosions and a different combat space.",
    },
    combatStyle: {
      "pt-BR": "Combina golpes de cajado e ondas explosivas de grande alcance. Obstáculos da arena podem interferir no movimento, então manter uma rota de saída aberta é importante.",
      en: "Combines staff strikes with wide explosive waves. Arena obstacles can interfere with movement, making a clear escape route valuable.",
    },
    spoilerContext: {
      "pt-BR": "Faz parte da rota convencional até Lost Izalith, mas pode ser evitado por uma passagem alternativa ligada ao pacto Chaos Servant.",
      en: "It sits on the conventional route to Lost Izalith, but can be bypassed through an alternate passage tied to the Chaos Servant covenant.",
    },
    weaknesses: [{ "pt-BR": "Raio", en: "Lightning" }],
    resistances: [],
    image_url: null,
    hero_image_url: null,
  },
  {
    order: 20,
    name: "Centipede Demon",
    slug: "centipede-demon",
    location: { "pt-BR": "Demon Ruins", en: "Demon Ruins" },
    requiredStatus: "optional",
    dlc: false,
    combatType: { "pt-BR": "Monstro grande em arena com lava", en: "Large monster in a lava arena" },
    shortSummary: {
      "pt-BR": "O Centipede Demon coloca o jogador em uma arena onde o terreno é tão importante quanto o chefe. A área segura é limitada e o inimigo possui membros com grande alcance.",
      en: "The Centipede Demon places the player in an arena where terrain matters as much as the boss. Safe ground is limited and the creature has extremely long-reaching limbs.",
    },
    combatStyle: {
      "pt-BR": "Usa saltos, membros extensos e ataques próximos ao corpo. Criar espaço seguro fora da lava e manter a câmera sob controle costuma definir o ritmo do encontro.",
      en: "Uses jumps, extended limbs and close-range attacks. Establishing safe ground away from lava and keeping camera control usually defines the fight's rhythm.",
    },
    spoilerContext: {
      "pt-BR": "É parte do caminho convencional rumo a Lost Izalith, mas assim como o Firesage pode ser evitado por uma rota alternativa específica.",
      en: "It lies on the conventional path to Lost Izalith, but like the Firesage can be bypassed through a specific alternate route.",
    },
    weaknesses: [{ "pt-BR": "Magia e raio", en: "Magic and lightning" }],
    resistances: [{ "pt-BR": "Fogo", en: "Fire" }],
    image_url: null,
    hero_image_url: null,
  },
  {
    order: 21,
    name: "Bed of Chaos",
    slug: "bed-of-chaos",
    location: { "pt-BR": "Lost Izalith", en: "Lost Izalith" },
    requiredStatus: "required",
    dlc: false,
    combatType: { "pt-BR": "Desafio de cenário e plataforma", en: "Environmental and platforming challenge" },
    shortSummary: {
      "pt-BR": "A Bed of Chaos foge do formato tradicional de duelo. O objetivo envolve atravessar uma arena que se transforma, lidar com empurrões e alcançar pontos específicos do cenário.",
      en: "The Bed of Chaos breaks from the traditional duel format. The objective involves crossing a changing arena, dealing with knockback and reaching specific environmental targets.",
    },
    combatStyle: {
      "pt-BR": "Grandes braços varrem o chão enquanto partes da arena desabam. Precisão de movimento e memória das mudanças do terreno importam mais do que dano bruto.",
      en: "Huge limbs sweep across the floor while parts of the arena collapse. Precise movement and remembering terrain changes matter more than raw damage.",
    },
    spoilerContext: {
      "pt-BR": "A Bed of Chaos está ligada diretamente à origem dos demônios e guarda uma das grandes almas exigidas para a conclusão da campanha.",
      en: "The Bed of Chaos is directly tied to the origin of demons and holds one of the great souls required to complete the campaign.",
    },
    weaknesses: [{ "pt-BR": "Não se aplica: encontro de cenário", en: "Not applicable: environmental encounter" }],
    resistances: [],
    image_url: null,
    hero_image_url: null,
  },
  {
    order: 22,
    name: "Gwyn, Lord of Cinder",
    slug: "gwyn-lord-of-cinder",
    location: { "pt-BR": "Kiln of the First Flame", en: "Kiln of the First Flame" },
    requiredStatus: "required",
    dlc: false,
    combatType: { "pt-BR": "Duelo corpo a corpo agressivo", en: "Aggressive melee duel" },
    shortSummary: {
      "pt-BR": "O confronto final do jogo base é um duelo rápido e direto. Gwyn pressiona o jogador com sequências de espada e pouco tempo para recuperar distância.",
      en: "The base game's final encounter is a fast, direct duel. Gwyn pressures the player with sword chains and gives little time to reset spacing.",
    },
    combatStyle: {
      "pt-BR": "Avança constantemente, alterna golpes rápidos, agarrões e ataques de fogo. O ritmo é mais próximo de um duelo humanoide do que dos chefes gigantes vistos ao longo do jogo.",
      en: "Constantly advances, alternating fast swings, grabs and fire-infused attacks. Its rhythm is closer to a humanoid duel than the giant bosses seen throughout the game.",
    },
    spoilerContext: {
      "pt-BR": "Gwyn é a figura central por trás da Era do Fogo. Derrotá-lo leva diretamente à decisão final que encerra a jornada do personagem.",
      en: "Gwyn is the central figure behind the Age of Fire. Defeating him leads directly to the final decision that closes the player's journey.",
    },
    weaknesses: [{ "pt-BR": "Fogo", en: "Fire" }],
    resistances: [{ "pt-BR": "Raio", en: "Lightning" }],
    image_url: null,
    hero_image_url: null,
  },
  {
    order: 23,
    name: "Sanctuary Guardian",
    slug: "sanctuary-guardian",
    location: { "pt-BR": "Sanctuary Garden", en: "Sanctuary Garden" },
    requiredStatus: "optional",
    dlc: true,
    combatType: { "pt-BR": "Criatura veloz com ataques elementais", en: "Fast creature with elemental attacks" },
    shortSummary: {
      "pt-BR": "O primeiro chefe de Artorias of the Abyss é uma criatura extremamente móvel. Ele combina investidas físicas, voo curto e ataques elétricos para testar reação e posicionamento.",
      en: "The first boss of Artorias of the Abyss is an extremely mobile creature, combining physical charges, short flights and lightning attacks to test reactions and positioning.",
    },
    combatStyle: {
      "pt-BR": "Alterna saltos, chifradas, golpes de cauda e projéteis elétricos. O ritmo é alto, mas várias animações deixam janelas claras depois de ataques comprometidos.",
      en: "Alternates leaps, horn attacks, tail strikes and lightning projectiles. The pace is high, but several committed attacks leave clear recovery windows.",
    },
    spoilerContext: {
      "pt-BR": "Ele protege a entrada da região acessada no conteúdo Artorias of the Abyss e funciona como porta de entrada mecânica para o DLC.",
      en: "It guards the entrance to the region explored in Artorias of the Abyss and acts as the mechanical gateway to the DLC.",
    },
    weaknesses: [{ "pt-BR": "Dano físico", en: "Physical damage" }],
    resistances: [{ "pt-BR": "Magia, fogo e raio", en: "Magic, fire and lightning" }],
    image_url: null,
    hero_image_url: null,
  },
  {
    order: 24,
    name: "Artorias the Abysswalker",
    slug: "artorias-the-abysswalker",
    location: { "pt-BR": "Royal Wood", en: "Royal Wood" },
    requiredStatus: "optional",
    dlc: true,
    combatType: { "pt-BR": "Duelo humanoide de alta mobilidade", en: "High-mobility humanoid duel" },
    shortSummary: {
      "pt-BR": "Artorias é um duelo rápido e técnico, centrado em leitura de movimentos e punição de janelas curtas. Sua mobilidade e alcance fazem dele um dos encontros mais reconhecidos do DLC.",
      en: "Artorias is a fast, technical duel built around reading movement and punishing short openings. His mobility and reach make him one of the DLC's most recognizable encounters.",
    },
    combatStyle: {
      "pt-BR": "Usa saltos, investidas, golpes giratórios e sequências que podem variar em duração. Em certos momentos tenta fortalecer a si mesmo, criando uma decisão entre atacar para interromper ou recuar.",
      en: "Uses leaps, charges, spinning attacks and chains that can vary in length. At certain moments he attempts to empower himself, forcing a choice between interrupting him or backing away.",
    },
    spoilerContext: {
      "pt-BR": "O jogador encontra Artorias depois que o cavaleiro já foi consumido pelo Abismo. O confronto redefine parte da lenda conhecida no jogo base.",
      en: "The player encounters Artorias after the knight has already been consumed by the Abyss. The fight reframes part of the legend established in the base game.",
    },
    weaknesses: [{ "pt-BR": "Impacto", en: "Strike" }],
    resistances: [{ "pt-BR": "Magia, fogo e raio", en: "Magic, fire and lightning" }],
    image_url: null,
    hero_image_url: null,
  },
  {
    order: 25,
    name: "Black Dragon Kalameet",
    slug: "black-dragon-kalameet",
    location: { "pt-BR": "Royal Wood", en: "Royal Wood" },
    requiredStatus: "optional",
    dlc: true,
    combatType: { "pt-BR": "Dragão, fogo e grande alcance", en: "Dragon, fire and long reach" },
    shortSummary: {
      "pt-BR": "Kalameet é um chefe opcional de grande porte que combina mobilidade, ataques físicos e sopro de fogo negro. A luta exige acompanhar um alvo que muda de distância com frequência.",
      en: "Kalameet is a large optional boss combining mobility, physical attacks and black flame breath. The fight demands tracking a target that frequently changes distance.",
    },
    combatStyle: {
      "pt-BR": "Alterna investidas, pisões, ataques de cauda e fogo em várias direções. Permanecer diretamente abaixo ou atrás por tempo demais pode ser tão perigoso quanto ficar de frente.",
      en: "Alternates charges, stomps, tail attacks and fire in multiple directions. Staying directly beneath or behind it for too long can be as dangerous as standing in front.",
    },
    spoilerContext: {
      "pt-BR": "Para enfrentá-lo em condições normais, o jogador precisa primeiro conseguir ajuda para limitar seu voo sobre Royal Wood.",
      en: "To fight it under normal conditions, the player must first secure help to limit its flight over the Royal Wood.",
    },
    weaknesses: [{ "pt-BR": "Impacto", en: "Strike" }],
    resistances: [{ "pt-BR": "Magia, fogo e raio", en: "Magic, fire and lightning" }],
    image_url: null,
    hero_image_url: null,
  },
  {
    order: 26,
    name: "Manus, Father of the Abyss",
    slug: "manus-father-of-the-abyss",
    location: { "pt-BR": "Chasm of the Abyss", en: "Chasm of the Abyss" },
    requiredStatus: "optional",
    dlc: true,
    combatType: { "pt-BR": "Alta agressividade, alcance e magia", en: "High aggression, reach and magic" },
    shortSummary: {
      "pt-BR": "Manus é o confronto final da linha principal de Artorias of the Abyss. Ele combina força física, ataques de alcance irregular e magia em um ritmo muito mais agressivo que grande parte do jogo base.",
      en: "Manus is the final encounter of the main Artorias of the Abyss storyline. He combines physical force, irregular reach and magic at a much more aggressive pace than much of the base game.",
    },
    combatStyle: {
      "pt-BR": "Usa braços longos, sequências rápidas, saltos e diferentes padrões de magia negra. A luta recompensa reconhecer o início de cada padrão e resistir à tentação de atacar depois de toda esquiva.",
      en: "Uses long arms, fast combinations, leaps and several dark magic patterns. The fight rewards recognizing each pattern's startup and resisting the urge to attack after every dodge.",
    },
    spoilerContext: {
      "pt-BR": "Manus é apresentado como a origem da expansão do Abismo em Oolacile, e sua derrota encerra o principal arco narrativo do conteúdo adicional.",
      en: "Manus is presented as the source behind the Abyss spreading through Oolacile, and defeating him closes the DLC's central narrative arc.",
    },
    weaknesses: [{ "pt-BR": "Dano físico", en: "Physical damage" }],
    resistances: [{ "pt-BR": "Magia, fogo e raio", en: "Magic, fire and lightning" }],
    image_url: null,
    hero_image_url: null,
  },
];

export function getDarkSoulsBoss(slug: string) {
  return DARK_SOULS_BOSSES.find((boss) => boss.slug === slug);
}


export const DARK_SOULS_BOSS_COMBAT_SOURCE = {
  label: "Soulsborndle DS1 boss dataset · community cross-check",
  url: "https://github.com/malthesers/soulsborndle/blob/main/src/bosses/dark-souls-1.ts",
  note:
    "Fraquezas e resistências são usadas como orientação de matchup e foram cruzadas com referências comunitárias. Encontros com mecânicas especiais continuam descritos qualitativamente em vez de fingir precisão numérica.",
};
