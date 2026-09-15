import type { Locale } from "@/i18n";

export type LocalizedGuideText = Record<Locale, string>;

export type DarkSoulsStatId =
  | "vitality"
  | "attunement"
  | "endurance"
  | "strength"
  | "dexterity"
  | "resistance"
  | "intelligence"
  | "faith";

export type StatBreakpoint = {
  level: string;
  label: LocalizedGuideText;
  description: LocalizedGuideText;
};

export type DarkSoulsStatGuideEntry = {
  id: DarkSoulsStatId;
  abbreviation: string;
  name: LocalizedGuideText;
  summary: LocalizedGuideText;
  beginner: LocalizedGuideText;
  advanced: LocalizedGuideText;
  affects: LocalizedGuideText[];
  doesNotAffect: LocalizedGuideText[];
  favors: LocalizedGuideText[];
  breakpoints: StatBreakpoint[];
  practicalTip: LocalizedGuideText;
  caution?: LocalizedGuideText;
};

const t = (pt: string, en: string, es: string): LocalizedGuideText => ({ "pt-BR": pt, en, es });

export const DARK_SOULS_STATS: DarkSoulsStatGuideEntry[] = [
  {
    id: "vitality",
    abbreviation: "VIT",
    name: t("Vitalidade", "Vitality", "Vitalidad"),
    summary: t("Aumenta o HP máximo e a margem de erro da sua build.", "Raises maximum HP and your build's margin for error.", "Aumenta los PS máximos y el margen de error de tu build."),
    beginner: t("É o atributo defensivo mais simples: mais Vitalidade significa uma barra de vida maior. Para quem está aprendendo chefes e padrões de ataque, isso costuma valer mais do que buscar poucos pontos extras de dano cedo demais.", "It is the simplest defensive stat: more Vitality means a larger health bar. While learning bosses and attack patterns, this often matters more than chasing a few extra damage points too early.", "Es el atributo defensivo más sencillo: más Vitalidad significa una barra de vida mayor. Mientras aprendes jefes y patrones, suele importar más que buscar unos pocos puntos extra de daño demasiado pronto."),
    advanced: t("Os ganhos não são lineares. O crescimento é forte até 30 VIT, desacelera depois disso e cai novamente a partir de 50. Como referência: 30 VIT = 1100 HP, 50 VIT = 1500 HP e 99 VIT = 1900 HP antes de modificadores de equipamento.", "Returns are not linear. Growth is strong up to 30 VIT, slows afterward and drops again from 50. Reference points: 30 VIT = 1100 HP, 50 VIT = 1500 HP and 99 VIT = 1900 HP before equipment modifiers.", "Los rendimientos no son lineales. El crecimiento es fuerte hasta 30 VIT, se ralentiza después y vuelve a caer a partir de 50. Referencias: 30 VIT = 1100 PS, 50 VIT = 1500 PS y 99 VIT = 1900 PS antes de modificadores de equipo."),
    affects: [t("HP máximo", "Maximum HP", "PS máximos")],
    doesNotAffect: [t("Stamina", "Stamina", "Aguante"), t("Carga de equipamento", "Equip burden", "Carga de equipo"), t("Dano de armas", "Weapon damage", "Daño de armas")],
    favors: [t("Sobrevivência", "Survivability", "Supervivencia"), t("PvE e PvP", "PvE and PvP", "PvE y PvP")],
    breakpoints: [
      { level: "30", label: t("Primeiro soft cap", "First soft cap", "Primer soft cap"), description: t("Os ganhos de HP por nível começam a cair de forma perceptível.", "HP gained per level begins to fall noticeably.", "Los PS ganados por nivel empiezan a caer de forma perceptible.") },
      { level: "50", label: t("Segundo soft cap", "Second soft cap", "Segundo soft cap"), description: t("Os retornos ficam bem menores; subir além disso passa a ser uma decisão específica de build.", "Returns become much smaller; going beyond this is usually build-specific.", "Los rendimientos se vuelven mucho menores; subir más suele ser específico de la build.") },
    ],
    practicalTip: t("Se você ainda morre em poucos golpes, VIT normalmente traz mais consistência do que aumentar um atributo ofensivo que já está perto do soft cap.", "If you still die in only a few hits, VIT usually adds more consistency than raising an offensive stat already near its soft cap.", "Si todavía mueres en pocos golpes, VIT suele aportar más consistencia que subir un atributo ofensivo ya cerca de su soft cap."),
  },
  {
    id: "attunement",
    abbreviation: "ATT",
    name: t("Sintonia", "Attunement", "Sintonización"),
    summary: t("Define quantos espaços de magia você possui para feitiçarias, milagres e piromancias.", "Determines how many spell slots you have for sorceries, miracles and pyromancies.", "Determina cuántos espacios de magia tienes para hechicerías, milagros y piromancias."),
    beginner: t("Sintonia não aumenta o dano das magias. Ela aumenta quantas magias você consegue equipar ao mesmo tempo. Algumas magias ocupam dois slots, então conjuradores podem precisar de ATT mesmo sem ganhar dano diretamente.", "Attunement does not increase spell damage. It increases how many spells you can equip at once. Some spells consume two slots, so casters may need ATT even though it does not directly add damage.", "Sintonización no aumenta el daño de la magia. Aumenta cuántos hechizos puedes equipar a la vez. Algunos ocupan dos espacios, así que un lanzador puede necesitar ATT aunque no añada daño directo."),
    advanced: t("É um atributo de marcos: abaixo de 10 não há slots; novos slots aparecem em 10, 12, 14, 16, 19, 23, 28, 34, 41 e 50. O limite natural é 10 slots em 50 ATT. Darkmoon Seance Ring e White Seance Ring adicionam um slot cada e podem levar o total a 12.", "It is a breakpoint stat: below 10 there are no slots; new slots appear at 10, 12, 14, 16, 19, 23, 28, 34, 41 and 50. The natural limit is 10 slots at 50 ATT. Darkmoon Seance Ring and White Seance Ring add one each, allowing 12 total.", "Es un atributo de hitos: por debajo de 10 no hay espacios; aparecen en 10, 12, 14, 16, 19, 23, 28, 34, 41 y 50. El límite natural es 10 espacios con 50 ATT. Darkmoon Seance Ring y White Seance Ring añaden uno cada uno, hasta 12."),
    affects: [t("Slots de magia", "Spell slots", "Espacios de magia")],
    doesNotAffect: [t("Dano de feitiçaria", "Sorcery damage", "Daño de hechicería"), t("Dano de milagres", "Miracle damage", "Daño de milagros"), t("Dano de piromancia", "Pyromancy damage", "Daño de piromancia")],
    favors: [t("Conjuradores", "Casters", "Lanzadores"), t("Builds híbridas", "Hybrid builds", "Builds híbridas")],
    breakpoints: [
      { level: "10", label: t("1 slot", "1 slot", "1 espacio"), description: t("Primeiro espaço de magia.", "First spell slot.", "Primer espacio de magia.") },
      { level: "12 / 14 / 16", label: t("2–4 slots", "2–4 slots", "2–4 espacios"), description: t("Faixa comum para builds híbridas com poucas magias utilitárias.", "Common range for hybrid builds carrying a few utility spells.", "Rango común para builds híbridas con algunas magias de utilidad.") },
      { level: "19 / 23 / 28", label: t("5–7 slots", "5–7 slots", "5–7 espacios"), description: t("Permite misturar ataque, buffs e utilidade com folga.", "Allows a broad mix of offense, buffs and utility.", "Permite una mezcla amplia de ataque, mejoras y utilidad.") },
      { level: "34 / 41 / 50", label: t("8–10 slots", "8–10 slots", "8–10 espacios"), description: t("Faixa de conjuradores dedicados; 50 é o último slot natural.", "Dedicated-caster territory; 50 is the final natural slot.", "Territorio de lanzadores dedicados; 50 es el último espacio natural.") },
    ],
    practicalTip: t("Conte quantos slots sua seleção real precisa e pare no marco correspondente. Pontos entre dois marcos não criam um slot parcial.", "Count how many slots your actual loadout needs and stop at that breakpoint. Points between breakpoints do not grant a partial slot.", "Cuenta cuántos espacios necesita tu selección real y detente en ese hito. Los puntos entre hitos no dan un espacio parcial."),
  },
  {
    id: "endurance",
    abbreviation: "END",
    name: t("Endurance", "Endurance", "Aguante"),
    summary: t("Aumenta Stamina, carga máxima de equipamento e resistência a sangramento.", "Raises Stamina, maximum equip burden and bleed resistance.", "Aumenta el aguante, la carga máxima de equipo y la resistencia al sangrado."),
    beginner: t("Ataques, esquivas e bloqueios gastam a mesma barra de Stamina. Mais END significa mais ações antes de recuar. A carga máxima maior também permite usar equipamento mais pesado sem necessariamente cair para uma rolagem pior.", "Attacks, rolls and blocks all consume the same Stamina bar. More END means more actions before backing off. Higher equip burden also lets you use heavier gear without necessarily dropping into a worse roll class.", "Ataques, rodadas y bloqueos consumen la misma barra de aguante. Más END significa más acciones antes de retirarte. Una carga mayor también permite usar equipo más pesado sin caer necesariamente a una rodada peor."),
    advanced: t("A Stamina chega ao máximo natural de 160 em 40 END e não aumenta mais por nível, embora a carga continue crescendo. A carga base segue 40 + END. Menos de 25% da carga = fast roll; de 25% até 50% = medium roll; acima de 50% e abaixo de 100% = heavy roll; 100% ou mais impede a rolagem normal.", "Stamina reaches its natural maximum of 160 at 40 END and no longer rises from levels, while burden keeps increasing. Base burden follows 40 + END. Below 25% = fast roll; 25% through 50% = medium roll; above 50% and below 100% = heavy roll; 100% or more prevents normal rolling.", "El aguante alcanza su máximo natural de 160 con 40 END y ya no aumenta por nivel, aunque la carga sigue creciendo. La carga base sigue 40 + END. Menos del 25% = rodada rápida; 25% a 50% = media; más del 50% y menos del 100% = pesada; 100% o más impide rodar normalmente."),
    affects: [t("Stamina máxima", "Maximum Stamina", "Aguante máximo"), t("Carga de equipamento", "Equip burden", "Carga de equipo"), t("Resistência a sangramento", "Bleed resistance", "Resistencia al sangrado")],
    doesNotAffect: [t("HP máximo", "Maximum HP", "PS máximos")],
    favors: [t("Todas as builds corpo a corpo", "All melee builds", "Todas las builds cuerpo a cuerpo"), t("Armadura pesada", "Heavy armor", "Armadura pesada")],
    breakpoints: [
      { level: "<25%", label: t("Fast roll", "Fast roll", "Rodada rápida"), description: t("Mantenha o peso equipado abaixo de 25% da carga máxima para a rolagem mais rápida.", "Keep equipped weight below 25% of maximum burden for the fastest roll.", "Mantén el peso equipado por debajo del 25% de la carga máxima para la rodada más rápida.") },
      { level: "40", label: t("Cap de Stamina", "Stamina cap", "Límite de aguante"), description: t("160 de Stamina; níveis posteriores continuam aumentando carga, mas não a barra verde.", "160 Stamina; later levels keep raising burden but not the green bar.", "160 de aguante; niveles posteriores siguen aumentando la carga, pero no la barra verde.") },
    ],
    practicalTip: t("Ao montar equipamento, compare o peso total com sua carga máxima. Uma armadura melhor no papel pode piorar muito sua mobilidade.", "When choosing gear, compare total weight with maximum burden. A stronger armor piece on paper can badly hurt mobility.", "Al elegir equipo, compara el peso total con tu carga máxima. Una armadura mejor sobre el papel puede perjudicar mucho tu movilidad."),
  },
  {
    id: "strength",
    abbreviation: "STR",
    name: t("Força", "Strength", "Fuerza"),
    summary: t("Cumpre requisitos e aumenta o dano de armas que possuem scaling de Força.", "Meets requirements and raises damage on weapons with Strength scaling.", "Cumple requisitos y aumenta el daño de armas con escalado de Fuerza."),
    beginner: t("Uma arma pode exigir 24 STR para ser usada corretamente. Isso é requisito, não garantia de bom scaling. Para saber se continuar investindo aumenta bastante o dano, olhe também a letra de scaling de STR.", "A weapon may require 24 STR to be wielded properly. That is a requirement, not a guarantee of good scaling. To know whether more STR adds meaningful damage, also inspect its STR scaling grade.", "Un arma puede exigir 24 STR para usarse correctamente. Eso es un requisito, no garantía de buen escalado. Para saber si más STR añade daño relevante, mira también su letra de escalado STR."),
    advanced: t("Nas curvas físicas comuns de Normal, Raw, Crystal e muitas armas únicas, o ganho de scaling cai após 20 e despenca depois de 40. Magic, Enchanted, Divine e Occult usam curvas diferentes e podem continuar aproveitando atributos até perto de 50. A rota de upgrade importa tanto quanto o número bruto de STR.", "On common physical curves used by Normal, Raw, Crystal and many unique weapons, scaling gains slow after 20 and fall sharply after 40. Magic, Enchanted, Divine and Occult use different curves and can keep benefiting from stats toward 50. Upgrade path matters as much as raw STR.", "En las curvas físicas comunes de Normal, Raw, Crystal y muchas armas únicas, el escalado baja después de 20 y cae mucho tras 40. Magic, Enchanted, Divine y Occult usan curvas distintas y pueden seguir beneficiándose hasta cerca de 50. La ruta de mejora importa tanto como el STR bruto."),
    affects: [t("Requisitos de armas e escudos", "Weapon and shield requirements", "Requisitos de armas y escudos"), t("Dano de armas com scaling STR", "Damage on STR-scaling weapons", "Daño de armas con escalado STR")],
    doesNotAffect: [t("Velocidade de ataque", "Attack speed", "Velocidad de ataque")],
    favors: [t("Martelos, grandes machados e armas pesadas", "Hammers, greataxes and heavy weapons", "Martillos, grandes hachas y armas pesadas"), t("Scaling STR", "STR scaling", "Escalado STR")],
    breakpoints: [
      { level: "20", label: t("Primeira queda", "First drop", "Primera caída"), description: t("O ganho ofensivo por ponto começa a diminuir nas curvas físicas comuns.", "Offensive gain per point begins to slow on common physical curves.", "La ganancia ofensiva por punto empieza a disminuir en curvas físicas comunes.") },
      { level: "40", label: t("Soft cap físico", "Physical soft cap", "Soft cap físico"), description: t("Depois daqui o scaling STR em rotas físicas comuns rende muito pouco por nível.", "Beyond this point STR scaling on common physical paths gives much less per level.", "Después de aquí el escalado STR en rutas físicas comunes da mucho menos por nivel.") },
      { level: "27 2H", label: t("~40 STR efetiva", "~40 effective STR", "~40 STR efectiva"), description: t("Com duas mãos, 27 STR recebe o multiplicador de 1,5 e alcança aproximadamente o soft cap físico de 40 para scaling.", "Two-handing gives 27 STR the 1.5 multiplier, effectively reaching about the 40 physical soft cap for scaling.", "A dos manos, 27 STR recibe el multiplicador de 1,5 y alcanza aproximadamente el soft cap físico de 40 para escalado.") },
    ],
    practicalTip: t("Duas mãos usam 1,5× sua Força para requisitos e scaling. 18 STR cumpre um requisito de 26; 27 STR funciona como cerca de 40 para scaling. O bônus não aumenta DEX, INT ou FAI.", "Two-handing uses 1.5× your Strength for requirements and scaling. 18 STR satisfies a 26 requirement; 27 STR behaves like roughly 40 for scaling. It does not increase DEX, INT or FAI.", "A dos manos se usa 1,5× tu Fuerza para requisitos y escalado. 18 STR cumple un requisito de 26; 27 STR funciona como cerca de 40 para escalado. No aumenta DEX, INT ni FAI."),
  },
  {
    id: "dexterity",
    abbreviation: "DEX",
    name: t("Destreza", "Dexterity", "Destreza"),
    summary: t("Cumpre requisitos, aumenta o dano de armas com scaling DEX e acelera o início de determinadas conjurações.", "Meets requirements, raises damage on DEX-scaling weapons and speeds up the startup of certain spells.", "Cumple requisitos, aumenta el daño de armas con escalado DEX y acelera el inicio de determinados hechizos."),
    beginner: t("DEX aparece muito em armas rápidas, lanças, katanas e arcos, mas colocar mais DEX não acelera a animação de ataque da arma. O que aumenta é o dano adicional quando a arma realmente possui scaling de Destreza.", "DEX commonly appears on fast weapons, spears, katanas and bows, but adding DEX does not make weapon attack animations faster. What rises is bonus damage when the weapon actually has Dexterity scaling.", "DEX aparece mucho en armas rápidas, lanzas, katanas y arcos, pero subir DEX no acelera la animación de ataque. Lo que aumenta es el daño adicional si el arma realmente escala con Destreza."),
    advanced: t("O scaling físico comum perde eficiência depois de 20 e cai fortemente após 40. Separadamente, DEX pode reduzir o startup de algumas piromancias, feitiçarias e milagres. O benefício começa em valores diferentes conforme a animação — aproximadamente entre 27 e 43 DEX — cresce até 45 e não melhora além disso. Buffs, curas e várias magias específicas não são acelerados.", "Common physical scaling loses efficiency after 20 and drops sharply after 40. Separately, DEX can shorten the startup of some pyromancies, sorceries and miracles. The effect starts at different values depending on the animation—roughly between 27 and 43 DEX—scales up to 45 and does not improve beyond it. Buffs, heals and several specific spells are not accelerated.", "El escalado físico común pierde eficiencia después de 20 y cae mucho tras 40. Por separado, DEX puede acortar el inicio de algunas piromancias, hechicerías y milagros. El efecto empieza en valores distintos según la animación —aproximadamente entre 27 y 43 DEX— mejora hasta 45 y no aumenta más. Buffs, curas y varias magias no se aceleran."),
    affects: [t("Requisitos de equipamento", "Equipment requirements", "Requisitos de equipo"), t("Dano de armas com scaling DEX", "Damage on DEX-scaling weapons", "Daño de armas con escalado DEX"), t("Startup de algumas conjurações", "Startup of some spells", "Inicio de algunos hechizos")],
    doesNotAffect: [t("Velocidade de ataque das armas", "Weapon attack speed", "Velocidad de ataque de las armas"), t("Todas as magias indiscriminadamente", "Every spell indiscriminately", "Todos los hechizos indiscriminadamente")],
    favors: [t("Armas rápidas e técnicas", "Fast and technical weapons", "Armas rápidas y técnicas"), t("Scaling DEX", "DEX scaling", "Escalado DEX")],
    breakpoints: [
      { level: "20", label: t("Primeira queda", "First drop", "Primera caída"), description: t("O ganho físico por ponto começa a desacelerar.", "Physical gain per point begins to slow.", "La ganancia física por punto empieza a disminuir.") },
      { level: "40", label: t("Soft cap físico", "Physical soft cap", "Soft cap físico"), description: t("Depois de 40, armas físicas comuns recebem muito menos AR por nível de DEX.", "After 40, common physical weapons gain much less AR per DEX level.", "Después de 40, las armas físicas comunes ganan mucho menos AR por nivel de DEX.") },
      { level: "45", label: t("Cap de conjuração", "Casting-speed cap", "Límite de lanzamiento"), description: t("Conjurações elegíveis não ficam mais rápidas por DEX acima de 45.", "Eligible spells do not become any faster from DEX above 45.", "Los hechizos elegibles no se vuelven más rápidos por DEX por encima de 45.") },
    ],
    practicalTip: t("Para uma build física de DEX, 40 é o alvo clássico de dano. Só considere 45 se sua build realmente usa magias cuja animação recebe o bônus de velocidade.", "For a physical DEX build, 40 is the classic damage target. Consider 45 only if your build actually uses spells that benefit from the casting-speed bonus.", "Para una build física de DEX, 40 es el objetivo clásico de daño. Considera 45 solo si tu build usa magias que realmente reciben el bono de velocidad."),
  },
  {
    id: "resistance",
    abbreviation: "RES",
    name: t("Resistência", "Resistance", "Resistencia"),
    summary: t("Aumenta defesa física, defesa contra fogo e resistência a veneno, mas oferece pouco valor por nível na maioria das builds.", "Raises physical defense, fire defense and poison resistance, but offers poor value per level for most builds.", "Aumenta la defensa física, la defensa contra fuego y la resistencia al veneno, pero ofrece poco valor por nivel para la mayoría de builds."),
    beginner: t("O nome parece ótimo para um iniciante, mas este é o atributo que mais engana. Parte das defesas cresce naturalmente com o nível total, enquanto armaduras, anéis e equipamento resolvem fogo e veneno de forma muito mais eficiente.", "The name sounds great to a beginner, but this is the stat most likely to mislead you. Some defenses rise naturally with overall level, while armor, rings and gear solve fire and poison much more efficiently.", "El nombre suena genial para un principiante, pero es el atributo que más engaña. Parte de las defensas sube naturalmente con el nivel total, mientras armaduras, anillos y equipo resuelven fuego y veneno mucho mejor."),
    advanced: t("Os pontos de quebra são 15 e 30, com os ganhos por nível aproximadamente reduzidos pela metade em cada faixa. A resistência a veneno chega a 60 em 15 RES e 100 em 30, mas só 107 em 40. RES não concede defesa mágica ou de raio extra além do crescimento normal associado ao nível.", "Breakpoints are 15 and 30, with per-level gains roughly halving at each stage. Poison resistance reaches 60 at 15 RES and 100 at 30, but only 107 at 40. RES does not grant extra magic or lightning defense beyond normal level-based increases.", "Los hitos son 15 y 30, con ganancias por nivel que aproximadamente se reducen a la mitad. La resistencia al veneno llega a 60 con 15 RES y 100 con 30, pero solo 107 con 40. RES no da defensa mágica o de rayo extra más allá del crecimiento normal por nivel."),
    affects: [t("Defesa física", "Physical defense", "Defensa física"), t("Defesa contra fogo", "Fire defense", "Defensa contra fuego"), t("Resistência a veneno", "Poison resistance", "Resistencia al veneno")],
    doesNotAffect: [t("Defesa mágica extra", "Extra magic defense", "Defensa mágica extra"), t("Defesa de raio extra", "Extra lightning defense", "Defensa de rayo extra")],
    favors: [t("Defesas muito específicas", "Very specific defenses", "Defensas muy específicas")],
    breakpoints: [
      { level: "15", label: t("Primeira queda", "First drop", "Primera caída"), description: t("O retorno por ponto já cai bastante depois daqui.", "Return per point drops substantially after this point.", "El rendimiento por punto ya cae bastante después de aquí.") },
      { level: "30", label: t("Segunda queda", "Second drop", "Segunda caída"), description: t("Depois de 30, o ganho defensivo é especialmente pequeno.", "After 30, defensive gains are especially small.", "Después de 30, la ganancia defensiva es especialmente pequeña.") },
    ],
    practicalTip: t("Para sobreviver melhor, normalmente invista primeiro em VIT e END e ajuste armadura, escudos, anéis e consumíveis conforme a ameaça.", "For better survivability, usually invest in VIT and END first and adjust armor, shields, rings and consumables for the threat.", "Para sobrevivir mejor, normalmente invierte primero en VIT y END y ajusta armadura, escudos, anillos y consumibles según la amenaza."),
    caution: t("Na maioria das builds, colocar níveis diretamente em RES é uma das piores trocas de Soul Level. Defesa e resistência não são inúteis; existem apenas formas melhores de obtê-las.", "For most builds, directly leveling RES is one of the weakest uses of Soul Levels. Defense and resistance are not useless; there are simply better ways to obtain them.", "Para la mayoría de builds, subir RES directamente es uno de los usos más débiles de los niveles. Defensa y resistencia no son inútiles; simplemente hay mejores formas de obtenerlas."),
  },
  {
    id: "intelligence",
    abbreviation: "INT",
    name: t("Inteligência", "Intelligence", "Inteligencia"),
    summary: t("Cumpre requisitos de feitiçarias e equipamentos, aumenta armas com scaling INT e o Magic Adjustment da maioria dos catalisadores.", "Meets sorcery and equipment requirements, raises INT-scaling weapon damage and the Magic Adjustment of most catalysts.", "Cumple requisitos de hechicerías y equipo, aumenta el daño de armas con escalado INT y el Ajuste Mágico de la mayoría de catalizadores."),
    beginner: t("Para feitiçaria, o número mais importante no catalisador é o Magic Adjustment: ele participa do cálculo da potência da maioria das magias. Um catalisador com uma letra melhor nem sempre é o melhor no seu nível atual de INT, porque as curvas são diferentes.", "For sorcery, the most important number on a catalyst is Magic Adjustment: it feeds the power calculation of most spells. A catalyst with a better letter is not always best at your current INT because their curves differ.", "Para hechicería, el número más importante del catalizador es el Ajuste Mágico: participa en el cálculo de potencia de la mayoría de hechizos. Un catalizador con mejor letra no siempre es el mejor con tu INT actual porque las curvas son distintas."),
    advanced: t("INT tem vários marcos porque armas e catalisadores não usam a mesma curva. Armas mágicas têm retornos importantes em torno de 40 e 50; Logan's Catalyst perde muito retorno depois de aproximadamente 45; vários catalisadores comuns continuam escalando bem rumo a 50. Requisitos altos de feitiçarias também podem determinar seu alvo final.", "INT has several relevant breakpoints because weapons and catalysts do not share one curve. Magic weapon paths have important returns around 40 and 50; Logan's Catalyst loses substantial returns after roughly 45; several common catalysts keep scaling well toward 50. High sorcery requirements may also determine your final target.", "INT tiene varios hitos porque armas y catalizadores no comparten una sola curva. Las rutas mágicas tienen retornos importantes alrededor de 40 y 50; Logan's Catalyst pierde mucho rendimiento después de aproximadamente 45; varios catalizadores comunes siguen escalando bien hacia 50. Los requisitos altos de hechicerías también pueden marcar tu objetivo."),
    affects: [t("Requisitos de feitiçarias", "Sorcery requirements", "Requisitos de hechicerías"), t("Magic Adjustment da maioria dos catalisadores", "Magic Adjustment of most catalysts", "Ajuste Mágico de la mayoría de catalizadores"), t("Armas com scaling INT", "INT-scaling weapons", "Armas con escalado INT")],
    doesNotAffect: [t("Dano de piromancia pela Pyromancy Flame", "Pyromancy damage through the Pyromancy Flame", "Daño de piromancia mediante la Pyromancy Flame")],
    favors: [t("Feitiçaria", "Sorcery", "Hechicería"), t("Magic / Enchanted", "Magic / Enchanted", "Magic / Enchanted")],
    breakpoints: [
      { level: "40", label: t("Marco comum de armas", "Common weapon breakpoint", "Hito común de armas"), description: t("Muitas armas e rotas com INT começam a perder eficiência nessa região.", "Many INT-scaling weapons and paths begin losing efficiency around this point.", "Muchas armas y rutas con INT empiezan a perder eficiencia alrededor de este punto.") },
      { level: "45", label: t("Logan's Catalyst", "Logan's Catalyst", "Logan's Catalyst"), description: t("A curva de Magic Adjustment desse catalisador perde muito retorno depois de aproximadamente 45 INT.", "This catalyst's Magic Adjustment curve loses substantial returns after roughly 45 INT.", "La curva de Ajuste Mágico de este catalizador pierde bastante rendimiento después de aproximadamente 45 INT.") },
      { level: "50", label: t("Segundo marco", "Second breakpoint", "Segundo hito"), description: t("Diversas curvas de catalisadores e rotas mágicas já estão em forte retorno decrescente.", "Several catalyst and magic-path curves are already deep into diminishing returns.", "Varias curvas de catalizadores y rutas mágicas ya están en fuertes rendimientos decrecientes.") },
    ],
    practicalTip: t("Compare o Magic Adjustment real dos catalisadores no seu INT atual. Entre Magic e Enchanted, compare também o AR final: Enchanted favorece mais INT, mas a melhor opção depende da arma e da sua distribuição.", "Compare actual catalyst Magic Adjustment at your current INT. Between Magic and Enchanted, also compare final AR: Enchanted leans harder into INT, but the best result depends on the weapon and your spread.", "Compara el Ajuste Mágico real de los catalizadores con tu INT actual. Entre Magic y Enchanted, compara también el AR final: Enchanted favorece más INT, pero el mejor resultado depende del arma y tu distribución."),
  },
  {
    id: "faith",
    abbreviation: "FAI",
    name: t("Fé", "Faith", "Fe"),
    summary: t("Cumpre requisitos de milagres e equipamentos, aumenta armas com scaling FAI, melhora o Magic Adjustment da maioria dos talismãs e contribui para defesa mágica.", "Meets miracle and equipment requirements, raises FAI-scaling weapon damage, improves the Magic Adjustment of most talismans and contributes to magic defense.", "Cumple requisitos de milagros y equipo, aumenta el daño de armas con escalado FAI, mejora el Ajuste Mágico de la mayoría de talismanes y contribuye a la defensa mágica."),
    beginner: t("Fé é a base das builds de milagres. A maioria dos requisitos importantes aparece até 30 FAI, mas há milagres avançados que exigem 36, 48 ou 50. O talismã escolhido é tão importante quanto o valor de Fé.", "Faith is the foundation of miracle builds. Most important requirements appear by 30 FAI, but advanced miracles can require 36, 48 or 50. Your talisman choice matters as much as the Faith value.", "Fe es la base de las builds de milagros. La mayoría de requisitos importantes aparece hasta 30 FAI, pero hay milagros avanzados que exigen 36, 48 o 50. El talismán elegido importa tanto como el valor de Fe."),
    advanced: t("Talismãs usam curvas diferentes. Thorolund tem MagAdjust efetivamente fixo e é forte em Fé baixa; Canvas costuma liderar numa faixa intermediária; Darkmoon, Ivory e Sunlight dominam em valores altos. Nos talismãs que realmente escalam com FAI, o retorno cai fortemente após 50. Divine e Occult adicionam scaling de Fé à porção mágica da arma, com perfis diferentes.", "Talismans use different curves. Thorolund has effectively fixed MagAdjust and is strong at low Faith; Canvas often leads in the middle range; Darkmoon, Ivory and Sunlight dominate at high values. For talismans that actually scale with FAI, returns fall sharply after 50. Divine and Occult add Faith scaling to a weapon's magic component with different profiles.", "Los talismanes usan curvas distintas. Thorolund tiene Ajuste Mágico prácticamente fijo y funciona bien con Fe baja; Canvas suele liderar en valores medios; Darkmoon, Ivory y Sunlight dominan en valores altos. Para los talismanes que sí escalan con FAI, el rendimiento cae mucho después de 50. Divine y Occult añaden escalado de Fe al componente mágico del arma con perfiles distintos."),
    affects: [t("Requisitos de milagres", "Miracle requirements", "Requisitos de milagros"), t("Magic Adjustment da maioria dos talismãs", "Magic Adjustment of most talismans", "Ajuste Mágico de la mayoría de talismanes"), t("Armas com scaling FAI", "FAI-scaling weapons", "Armas con escalado FAI"), t("Defesa mágica", "Magic defense", "Defensa mágica")],
    doesNotAffect: [t("Dano de piromancia", "Pyromancy damage", "Daño de piromancia")],
    favors: [t("Milagres", "Miracles", "Milagros"), t("Divine / Occult", "Divine / Occult", "Divine / Occult")],
    breakpoints: [
      { level: "30", label: t("Marco de requisitos", "Requirement breakpoint", "Hito de requisitos"), description: t("A maior parte dos milagres e equipamentos de Fé já está disponível nessa região, embora existam exceções acima dela.", "Most Faith miracles and equipment are available around this region, though important exceptions exist above it.", "La mayoría de milagros y equipo de Fe ya está disponible en esta zona, aunque hay excepciones por encima.") },
      { level: "50", label: t("Soft cap de talismãs", "Talisman soft cap", "Soft cap de talismanes"), description: t("O ganho de Magic Adjustment da maioria dos talismãs que escalam com FAI cai fortemente depois daqui.", "Magic Adjustment gains on most Faith-scaling talismans fall sharply after this point.", "Las ganancias de Ajuste Mágico de la mayoría de talismanes que escalan con FAI caen mucho después de aquí.") },
    ],
    practicalTip: t("Não escolha talismã só pela letra. Em Fé baixa, um talismã com MagAdjust fixo pode superar outro com scaling melhor no papel. Compare o Magic Adjustment mostrado no personagem.", "Do not choose a talisman only by its letter. At low Faith, a fixed-MagAdjust talisman can outperform one with better scaling on paper. Compare the Magic Adjustment shown on your character.", "No elijas un talismán solo por su letra. Con Fe baja, uno con Ajuste Mágico fijo puede superar a otro con mejor escalado sobre el papel. Compara el Ajuste Mágico mostrado en tu personaje."),
  },
];

export const SCALING_GRADES = [
  { grade: "S", range: "140+" },
  { grade: "A", range: "100–139" },
  { grade: "B", range: "80–99" },
  { grade: "C", range: "52–79" },
  { grade: "D", range: "22–51" },
  { grade: "E", range: "1–21" },
  { grade: "—", range: "0" },
] as const;

export const BUILD_DIRECTIONS = [
  { id: "strength", label: t("Quero armas gigantes", "I want giant weapons", "Quiero armas gigantes"), title: t("Força", "Strength", "Fuerza"), stats: "STR + VIT + END", description: t("Cumpra o requisito da arma e leve STR rumo ao soft cap apropriado. VIT e END ajudam a sobreviver às animações mais comprometidas das armas pesadas.", "Meet the weapon requirement and move STR toward the appropriate soft cap. VIT and END help you survive the commitment of heavy-weapon animations.", "Cumple el requisito del arma y lleva STR hacia el soft cap adecuado. VIT y END ayudan a sobrevivir las animaciones más comprometidas de armas pesadas.") },
  { id: "dexterity", label: t("Quero armas rápidas", "I want fast weapons", "Quiero armas rápidas"), title: t("Destreza", "Dexterity", "Destreza"), stats: "DEX + VIT + END", description: t("Leve DEX ao requisito e depois à faixa eficiente de scaling. DEX não acelera golpes da arma; aumenta dano de scaling e o startup de algumas conjurações.", "Raise DEX to the requirement and then into the efficient scaling range. DEX does not speed up weapon swings; it adds scaling damage and affects the startup of some spells.", "Lleva DEX al requisito y luego al rango eficiente de escalado. DEX no acelera golpes del arma; añade daño por escalado y afecta el inicio de algunos hechizos.") },
  { id: "quality", label: t("Quero usar muitas armas", "I want many weapon options", "Quiero muchas opciones de armas"), title: t("Quality", "Quality", "Quality"), stats: "STR + DEX + VIT + END", description: t("Quality divide investimento entre STR e DEX para aproveitar armas que escalam com ambos. É versátil, mas consome mais níveis para chegar ao dano máximo.", "Quality splits investment between STR and DEX to exploit weapons that scale from both. It is versatile, but costs more levels to reach peak damage.", "Quality divide la inversión entre STR y DEX para aprovechar armas que escalan con ambos. Es versátil, pero consume más niveles para alcanzar el daño máximo.") },
  { id: "sorcery", label: t("Quero usar feitiçaria", "I want sorcery", "Quiero hechicería"), title: t("Feitiçaria", "Sorcery", "Hechicería"), stats: "INT + ATT + VIT", description: t("INT cobre requisitos e potência via catalisador; ATT define quantas magias você equipa. Compare Magic Adjustment, não só a letra de scaling.", "INT covers requirements and power through the catalyst; ATT determines how many spells you equip. Compare Magic Adjustment, not just the scaling letter.", "INT cubre requisitos y potencia mediante el catalizador; ATT determina cuántos hechizos equipas. Compara el Ajuste Mágico, no solo la letra.") },
  { id: "faith", label: t("Quero usar milagres", "I want miracles", "Quiero milagros"), title: t("Fé", "Faith", "Fe"), stats: "FAI + ATT + VIT", description: t("FAI abre milagres, fortalece a maioria dos talismãs e combina com Divine/Occult. O melhor talismã muda conforme sua Fé.", "FAI unlocks miracles, strengthens most talismans and pairs with Divine/Occult. The best talisman changes with your Faith.", "FAI desbloquea milagros, fortalece la mayoría de talismanes y combina con Divine/Occult. El mejor talismán cambia con tu Fe.") },
  { id: "pyromancy", label: t("Quero usar piromancia", "I want pyromancy", "Quiero piromancia"), title: t("Piromancia", "Pyromancy", "Piromancia"), stats: "ATT + upgrades da Flame", description: t("O dano das piromancias não cresce com INT ou FAI. Ele depende do upgrade da Pyromancy Flame e de modificadores próprios. ATT define quantas piromancias você equipa.", "Pyromancy damage does not grow from INT or FAI. It depends on upgrading the Pyromancy Flame and its own modifiers. ATT determines how many pyromancies you equip.", "El daño de piromancia no aumenta con INT ni FAI. Depende de mejorar la Pyromancy Flame y de sus propios modificadores. ATT define cuántas piromancias equipas.") },
] as const;

export const UPGRADE_PATH_NOTES = [
  { name: "Normal / Crystal", text: t("Mantêm foco em STR/DEX e costumam ser as rotas mais diretas para builds físicas com atributos altos. Crystal oferece dano alto, mas sofre limitações severas de durabilidade e reparo.", "Keep the focus on STR/DEX and are direct paths for high-stat physical builds. Crystal offers high damage but severe durability and repair limitations.", "Mantienen el foco en STR/DEX y son rutas directas para builds físicas con atributos altos. Crystal ofrece mucho daño, pero con fuertes limitaciones de durabilidad y reparación.") },
  { name: "Raw", text: t("Aumenta o dano base e reduz o scaling de STR/DEX. Pode ser eficiente cedo ou com atributos ofensivos baixos, mas perde valor conforme STR/DEX crescem.", "Raises base damage while reducing STR/DEX scaling. It can be efficient early or with low offensive stats, but loses value as STR/DEX rise.", "Aumenta el daño base y reduce el escalado STR/DEX. Puede ser eficiente al principio o con atributos ofensivos bajos, pero pierde valor al subir STR/DEX.") },
  { name: "Magic / Enchanted", text: t("Adicionam dano mágico e scaling INT. Enchanted inclina ainda mais a arma para INT; Magic preserva uma distribuição mais equilibrada.", "Add magic damage and INT scaling. Enchanted leans harder into INT; Magic keeps a more balanced distribution.", "Añaden daño mágico y escalado INT. Enchanted inclina más el arma hacia INT; Magic mantiene una distribución más equilibrada.") },
  { name: "Divine / Occult", text: t("Adicionam dano mágico e scaling FAI. Também carregam efeitos auxiliares próprios contra categorias específicas de inimigos.", "Add magic damage and FAI scaling. They also carry auxiliary effects against specific enemy categories.", "Añaden daño mágico y escalado FAI. También tienen efectos auxiliares contra categorías específicas de enemigos.") },
  { name: "Fire / Lightning", text: t("Removem o scaling tradicional de atributos e entregam dano dividido entre físico e elemental. São úteis sem investimento pesado em STR/DEX, mas o dano dividido enfrenta duas defesas.", "Remove traditional stat scaling and deal split physical plus elemental damage. They work without heavy STR/DEX investment, but split damage faces two defenses.", "Eliminan el escalado tradicional y causan daño dividido físico + elemental. Funcionan sin gran inversión en STR/DEX, pero el daño dividido enfrenta dos defensas.") },
  { name: "Chaos", text: t("Remove scaling STR/DEX e adiciona scaling com Humanity no contador. O bônus de dano chega ao limite em 10 Humanity.", "Removes STR/DEX scaling and adds scaling from Humanity in the counter. The damage bonus caps at 10 Humanity.", "Elimina el escalado STR/DEX y añade escalado con Humanidad en el contador. El bono de daño se limita a 10 Humanidad.") },
] as const;
