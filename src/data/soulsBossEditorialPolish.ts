import type { Locale } from "@/i18n";

type LocalizedText = Record<Locale, string>;

const text = (pt: string, en: string, es: string): LocalizedText => ({ "pt-BR": pt, en, es });

const DS3_BOSS_EDITORIAL: Record<string, LocalizedText> = {
  "iudex-gundyr": text(
    "Primeiro teste completo de Dark Souls III: Gundyr mistura alcance de alabarda, atrasos de animação e janelas claras para esquiva ou parry. Na transformação, o Pus of Man aumenta o alcance e muda a leitura da luta, premiando quem mantém a calma perto do corpo do chefe.",
    "Dark Souls III's first full combat exam: Gundyr mixes halberd reach, delayed swings and readable dodge or parry windows. His Pus of Man transformation greatly expands his reach and changes the fight's visual rhythm.",
    "La primera prueba completa de Dark Souls III: Gundyr mezcla alcance de alabarda, ataques retardados y ventanas claras de esquiva o parry. Su transformación Pus of Man amplía mucho el alcance y cambia el ritmo visual del combate.",
  ),
  "vordt-of-the-boreal-valley": text(
    "Vordt fecha o Alto Muro com uma luta de pressão frontal e acúmulo de Frostbite. Ficar sob ou atrás do corpo reduz parte da ameaça; na segunda etapa, as investidas em sequência transformam posicionamento e câmera em parte central do desafio.",
    "Vordt closes the High Wall with frontal pressure and Frostbite buildup. Staying under or behind him reduces part of the threat; repeated charges make positioning and camera control central in phase two.",
    "Vordt cierra el Gran Muro con presión frontal y acumulación de Frostbite. Mantenerse debajo o detrás reduce parte del peligro; las cargas repetidas vuelven esenciales el posicionamiento y la cámara en la segunda fase.",
  ),
  "curse-rotted-greatwood": text(
    "Um encontro de alvo específico: o dano eficiente vem dos sacos de maldição espalhados pelo corpo, não de atacar qualquer ponto da árvore. A queda para a câmara inferior altera espaço, ângulos e alcance, enquanto o braço adicional passa a punir aproximações descuidadas.",
    "A target-focused encounter: effective damage comes from the curse sacs across the body rather than attacking the tree anywhere. The fall into the lower chamber changes spacing and angles while the extra arm punishes careless approaches.",
    "Un encuentro de objetivos específicos: el daño eficaz proviene de los sacos de maldición del cuerpo, no de golpear cualquier zona. La caída a la cámara inferior cambia espacio y ángulos, mientras el brazo adicional castiga acercamientos descuidados.",
  ),
  "crystal-sage": text(
    "Crystal Sage alterna teleporte, projéteis mágicos e pressão à distância. Quando os clones aparecem, identificar rapidamente o verdadeiro Sage e limpar linhas de tiro evita que a arena vire uma sequência de impactos simultâneos.",
    "Crystal Sage alternates teleportation, magic projectiles and ranged pressure. Once clones appear, quickly identifying the real Sage and clearing firing lanes prevents the arena from becoming overlapping projectile pressure.",
    "Crystal Sage alterna teletransporte, proyectiles mágicos y presión a distancia. Cuando aparecen los clones, identificar rápido al Sage real y limpiar líneas de tiro evita una lluvia de impactos simultáneos.",
  ),
  "deacons-of-the-deep": text(
    "A luta funciona como controle de multidão: a presença vermelha marca qual diácono precisa ser atingido enquanto o grupo fecha espaço ao redor do jogador. Na etapa final, o arquidiácono e seus aliados tornam interrupção e gerenciamento de Curse mais importantes que dano bruto.",
    "This fight is crowd control: the red presence marks the Deacon that matters while the congregation closes space around you. In the final stage, interrupting the archdeacon and managing Curse matter more than raw damage.",
    "La pelea funciona como control de masas: la presencia roja marca al diácono importante mientras la congregación cierra el espacio. En la etapa final, interrumpir al archidiácono y controlar Curse importan más que el daño bruto.",
  ),
  "abyss-watchers": text(
    "Os Abyss Watchers começam como um duelo que vira conflito entre múltiplos combatentes; observar quem está hostil a quem cria janelas seguras. A segunda barra concentra o confronto em um Watcher flamejante, com combos mais longos, avanço agressivo e rastros de fogo.",
    "The Abyss Watchers begin as a duel that grows into a multi-combatant conflict; watching who is hostile to whom creates safe openings. The second health bar focuses the fight on a flaming Watcher with longer combos and fire trails.",
    "Los Abyss Watchers empiezan como un duelo que se convierte en un conflicto entre varios combatientes; observar quién ataca a quién crea ventanas seguras. La segunda barra concentra el combate en un Watcher en llamas con combos más largos.",
  ),
  "high-lord-wolnir": text(
    "Wolnir é um chefe de mecânica: os braceletes dourados são os alvos decisivos e quebrá-los conduz o encontro. A maior ameaça não é a troca de golpes tradicional, mas perder espaço para a névoa abissal e para as invocações enquanto o chefe avança.",
    "Wolnir is a mechanic-driven boss: the golden bracelets are the decisive targets and breaking them advances the fight. The main danger is losing space to abyssal mist and summons as the boss pushes forward.",
    "Wolnir es un jefe de mecánica: los brazaletes dorados son los objetivos decisivos y romperlos hace avanzar el combate. El mayor peligro es perder espacio ante la niebla abisal y las invocaciones mientras avanza.",
  ),
  "old-demon-king": text(
    "O Old Demon King combina golpes pesados com zonas de fogo que exigem leitura de distância. Conforme a vida cai, explosões e ataques de área ocupam mais espaço, tornando disciplina de stamina e saída rápida depois de cada punição mais importantes.",
    "The Old Demon King combines heavy swings with fire zones that demand distance awareness. As his health drops, explosions and area attacks occupy more space, making stamina discipline and quick exits after punishes increasingly important.",
    "Old Demon King combina golpes pesados con zonas de fuego que exigen controlar la distancia. Al bajar su vida, explosiones y ataques de área ocupan más espacio, haciendo más importante administrar stamina y salir rápido tras castigar.",
  ),
  "pontiff-sulyvahn": text(
    "Sulyvahn é uma prova de ritmo: sequências longas, duas lâminas e mudanças de timing punem esquivas automáticas. Na segunda etapa, o clone antecipa o próximo movimento do Pontífice, funcionando como uma prévia perigosa do ataque que virá logo depois.",
    "Sulyvahn is a rhythm test: long strings, twin blades and timing changes punish automatic rolls. In phase two, the clone previews the Pontiff's next move, turning each echo into a warning for the follow-up.",
    "Sulyvahn es una prueba de ritmo: cadenas largas, dos espadas y cambios de timing castigan rodar por reflejo. En la segunda fase, el clon adelanta el siguiente movimiento del Pontífice y sirve como aviso del ataque posterior.",
  ),
  "yhorm-the-giant": text(
    "Yhorm é construído em torno da Storm Ruler: carregar e liberar a habilidade da arma transforma uma luta de vida gigantesca em um duelo de execução. A participação de Siegward, quando disponível pela quest, também muda o ritmo e reforça o contexto narrativo do encontro.",
    "Yhorm is built around the Storm Ruler: charging and releasing its weapon art turns an enormous health pool into an execution-focused duel. Siegward's quest-dependent participation can also change the pacing and narrative context.",
    "Yhorm está construido alrededor de la Storm Ruler: cargar y liberar su habilidad convierte una enorme barra de vida en un duelo de ejecución. La participación de Siegward, si la misión lo permite, también cambia el ritmo y el contexto narrativo.",
  ),
  "aldrich-devourer-of-gods": text(
    "Aldrich controla distância com magia, projéteis e a conhecida chuva de flechas, obrigando movimentação constante. Na segunda etapa, o rastro de fogo e a intensidade dos feitiços reduzem o tempo seguro para atacar depois de cada teleporte.",
    "Aldrich controls distance with magic, projectiles and the signature arrow rain, forcing constant movement. In phase two, fire trails and intensified spells reduce the safe punish window after each teleport.",
    "Aldrich controla la distancia con magia, proyectiles y su característica lluvia de flechas, obligando a moverse constantemente. En la segunda fase, el rastro de fuego y los hechizos intensificados reducen las ventanas seguras de castigo.",
  ),
  "dancer-of-the-boreal-valley": text(
    "A Dancer usa um ritmo deliberadamente diferente dos inimigos comuns: pausas, arcos amplos e acelerações tornam a leitura mais importante que reagir cedo. Ao sacar a segunda lâmina, ganha sequências giratórias extensas e cobertura maior da arena.",
    "The Dancer uses a deliberately unusual rhythm: pauses, wide arcs and sudden acceleration reward reading the animation instead of reacting early. Drawing the second blade adds long spinning strings and broader arena coverage.",
    "La Dancer usa un ritmo deliberadamente extraño: pausas, arcos amplios y aceleraciones premian leer la animación en vez de reaccionar demasiado pronto. Al sacar la segunda hoja gana largas secuencias giratorias.",
  ),
  "dragonslayer-armour": text(
    "Dragonslayer Armour mistura pressão de machado, defesa de escudo e risco constante de queda na ponte. Conforme o encontro avança, projéteis externos passam a dividir a atenção; posicionar o chefe longe das bordas cria uma luta bem mais controlável.",
    "Dragonslayer Armour mixes axe pressure, shield defense and constant fall risk on the bridge. As the fight advances, outside projectiles split your attention; keeping the boss away from the edges makes the encounter much more controllable.",
    "Dragonslayer Armour mezcla presión de hacha, defensa con escudo y riesgo constante de caída en el puente. A medida que avanza la pelea, proyectiles externos dividen la atención; mantenerlo lejos de los bordes vuelve el combate más controlable.",
  ),
  "oceiros-the-consumed-king": text(
    "Oceiros começa com ataques mais medidos e uso de cristal, mas abandona a postura régia quando a luta avança. A segunda etapa é muito mais bestial, com investidas rápidas e movimentos de corpo inteiro que tornam distância lateral e câmera especialmente importantes.",
    "Oceiros begins with more measured attacks and crystal magic, then abandons that regal posture as the fight progresses. His second stage is far more feral, with fast charges and full-body movement that make lateral spacing and camera control important.",
    "Oceiros empieza con ataques más medidos y magia de cristal, pero abandona esa postura al avanzar el combate. Su segunda etapa es mucho más bestial, con cargas rápidas y movimientos de cuerpo completo que exigen buen espacio lateral y control de cámara.",
  ),
  "champion-gundyr": text(
    "Champion Gundyr remove a transformação monstruosa e transforma o conceito de Gundyr em um duelo de pressão quase contínua. Chutes, ombradas e extensões de combo punem cura ou esquiva precipitada, enquanto o parry continua sendo uma resposta de alto risco e alta recompensa.",
    "Champion Gundyr removes the monstrous transformation and turns Gundyr's concept into an almost continuous pressure duel. Kicks, shoulder checks and combo extensions punish panic healing or rolling, while parry remains a high-risk, high-reward answer.",
    "Champion Gundyr elimina la transformación monstruosa y convierte el concepto de Gundyr en un duelo de presión casi continua. Patadas, embestidas y extensiones de combo castigan curaciones o rodadas precipitadas; el parry sigue siendo una respuesta de alto riesgo.",
  ),
  "lothric-younger-prince-and-lorian-elder-prince": text(
    "Os Twin Princes alternam teleporte, golpes de Lorian e suporte mágico de Lothric. Na segunda etapa, atingir apenas Lorian prolonga o ciclo porque Lothric pode reanimá-lo; abrir ângulo para acertar o príncipe nas costas passa a ser parte central da estratégia.",
    "The Twin Princes combine teleportation, Lorian's melee pressure and Lothric's magic support. In phase two, hitting only Lorian extends the cycle because Lothric can revive him, making rear-angle damage a central objective.",
    "Los Twin Princes combinan teletransporte, presión cuerpo a cuerpo de Lorian y apoyo mágico de Lothric. En la segunda fase, golpear solo a Lorian prolonga el ciclo porque Lothric puede revivirlo; buscar ángulos hacia la espalda se vuelve central.",
  ),
  "ancient-wyvern": text(
    "Ancient Wyvern é mais percurso do que duelo tradicional: o objetivo é atravessar Archdragon Peak sob pressão até alcançar o ponto do ataque em queda. Tentar resolver tudo por dano convencional ignora a mecânica que define o encontro.",
    "Ancient Wyvern is more traversal challenge than traditional duel: the goal is to cross Archdragon Peak under pressure until reaching the plunging-attack point. Trying to solve it through conventional damage ignores the encounter's defining mechanic.",
    "Ancient Wyvern es más recorrido que duelo tradicional: el objetivo es atravesar Archdragon Peak bajo presión hasta llegar al punto del ataque en caída. Resolverlo con daño convencional ignora la mecánica que define el encuentro.",
  ),
  "the-nameless-king": text(
    "O encontro separa duas leituras: primeiro, controle de câmera e punição da cabeça do King of the Storm; depois, um duelo direto contra o Nameless King. A segunda fase usa atrasos e alcance para punir esquivas por reflexo, exigindo atenção ao momento real de cada impacto.",
    "The encounter demands two different reads: first, camera control and punishing the King of the Storm's head; then a direct duel with the Nameless King. Delayed timings in phase two punish reflex rolls and demand attention to the actual impact moment.",
    "El encuentro exige dos lecturas distintas: primero, controlar la cámara y castigar la cabeza del King of the Storm; después, un duelo directo con Nameless King. Sus ataques retardados castigan rodar por reflejo y exigen leer el instante real del impacto.",
  ),
  "soul-of-cinder": text(
    "Soul of Cinder reúne estilos de combate associados ao legado dos Lords of Cinder, alternando ferramentas antes de mudar para uma segunda fase mais focada. O encontro final testa adaptação: reconhecer rapidamente o moveset atual é tão importante quanto maximizar dano.",
    "Soul of Cinder combines combat styles tied to the legacy of the Lords of Cinder, rotating tools before shifting into a more focused second phase. The finale tests adaptation: quickly recognizing the active moveset matters as much as maximizing damage.",
    "Soul of Cinder reúne estilos de combate ligados al legado de los Lords of Cinder, alternando herramientas antes de pasar a una segunda fase más enfocada. El final prueba adaptación: reconocer rápido el moveset activo importa tanto como maximizar daño.",
  ),
  "champion-s-gravetender-and-gravetender-greatwolf": text(
    "A luta começa com controle de espaço contra o Gravetender e lobos menores, mas muda quando o Greatwolf entra em cena. Eliminar pressão inicial e evitar enfrentar os dois alvos em pleno potencial ao mesmo tempo torna o encontro muito mais previsível.",
    "The fight begins as space control against the Gravetender and smaller wolves, then changes when the Greatwolf arrives. Clearing early pressure and avoiding both main targets at full strength at once makes the encounter far more predictable.",
    "La pelea empieza como control de espacio contra el Gravetender y lobos menores, y cambia cuando entra el Greatwolf. Limpiar la presión inicial y evitar enfrentar a ambos objetivos principales al máximo al mismo tiempo vuelve el encuentro más predecible.",
  ),
  "sister-friede-and-father-ariandel": text(
    "Friede e Ariandel transformam o combate em uma maratona de três etapas, alternando invisibilidade, múltiplos alvos e uma fase final extremamente agressiva. Preservar Estus e reconhecer quando perseguir Friede ou reposicionar contra Ariandel é parte essencial da gestão do encontro.",
    "Friede and Ariandel turn the fight into a three-stage endurance test, mixing invisibility, multiple targets and an extremely aggressive final phase. Preserving Estus and knowing when to chase Friede or reposition around Ariandel are core skills here.",
    "Friede y Ariandel convierten el combate en una prueba de resistencia de tres etapas, mezclando invisibilidad, múltiples objetivos y una fase final muy agresiva. Conservar Estus y saber cuándo perseguir a Friede o reposicionarse frente a Ariandel es esencial.",
  ),
  "demon-in-pain-demon-from-below-and-demon-prince": text(
    "A primeira etapa alterna dois demônios com estados de agressividade diferentes, incentivando leitura de qual alvo está ativo. Depois, o Demon Prince concentra a luta em um único inimigo com grande alcance e ataques de fogo; a ordem dos demônios derrotados influencia o repertório final.",
    "Phase one alternates two demons with different aggression states, rewarding awareness of which target is active. The Demon Prince then condenses the fight into one large fire-based threat, and the kill order influences the final moveset.",
    "La primera fase alterna dos demonios con distintos estados de agresividad, premiando identificar cuál está activo. Luego Demon Prince concentra la pelea en una gran amenaza de fuego, y el orden de las bajas influye en su repertorio final.",
  ),
  "halflight-spear-of-the-church": text(
    "Halflight é um encontro PvP/PvE híbrido ligado ao pacto Spears of the Church: dependendo das condições online, outro jogador pode ocupar o papel do chefe. Isso torna a dificuldade e o ritmo menos previsíveis que em um boss tradicional e valoriza adaptação ao oponente.",
    "Halflight is a PvP/PvE hybrid tied to the Spears of the Church covenant: under online conditions, another player can fill the boss role. That makes difficulty and pacing less predictable than a traditional boss and rewards adapting to the opponent.",
    "Halflight es un encuentro híbrido PvP/PvE ligado al pacto Spears of the Church: en condiciones online, otro jugador puede ocupar el papel del jefe. Eso vuelve la dificultad y el ritmo menos previsibles y premia adaptarse al oponente.",
  ),
  "darkeater-midir": text(
    "Midir recompensa lutar de frente e aprender sequências longas em vez de permanecer sob o corpo. A cabeça recebe as melhores janelas de punição, enquanto fogo, investidas e ataques sombrios cobrem grandes áreas e tornam posicionamento consistente mais valioso que ganância por golpes extras.",
    "Midir rewards fighting from the front and learning long sequences instead of staying underneath him. His head offers the best punish windows while fire, charges and dark attacks cover huge areas, making consistent positioning more valuable than greedy extra hits.",
    "Midir recompensa luchar de frente y aprender secuencias largas en vez de quedarse bajo su cuerpo. La cabeza ofrece las mejores ventanas de castigo, mientras fuego, cargas y ataques oscuros cubren áreas enormes; el posicionamiento consistente vale más que golpes extra.",
  ),
  "slave-knight-gael": text(
    "Gael encerra The Ringed City como um duelo de resistência em três etapas, evoluindo de golpes físicos pesados para capas, projéteis e relâmpagos no campo de batalha. A luta recompensa aprender o ritmo completo dos combos e manter recursos para uma fase final longa.",
    "Gael closes The Ringed City as a three-stage endurance duel, evolving from heavy physical attacks into cape follow-ups, projectiles and lightning across the battlefield. The fight rewards learning full combo rhythms and preserving resources for a long finale.",
    "Gael cierra The Ringed City como un duelo de resistencia en tres etapas, evolucionando de golpes físicos pesados a ataques con capa, proyectiles y rayos. La pelea premia aprender el ritmo completo de sus combos y guardar recursos para un final largo.",
  ),
};

export function getDs3BossEditorialSummary(slug: string, locale: Locale) {
  return DS3_BOSS_EDITORIAL[slug]?.[locale] ?? null;
}
