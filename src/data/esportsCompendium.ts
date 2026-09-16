export type EsportsGameSlug = "valorant" | "league-of-legends";
export type ValorantRegion = "americas" | "emea" | "pacific" | "china";
export type RosterStatus = "active" | "sub" | "inactive" | "stand-in" | "loan";

export type EsportsSource = {
  url: string;
  label: string;
  verifiedAt: string;
  note?: string;
};

export type ProPlayerSettings = {
  dpi?: number;
  sensitivity?: number;
  edpi?: number;
  crosshairCode?: string;
  mouse?: string;
  pollingRateHz?: number;
  resolution?: string;
  displayMode?: string;
  graphicsPreset?: string;
};

export type EsportsPlayer = {
  id: string;
  game: EsportsGameSlug;
  handle: string;
  realName?: string;
  countryCode?: string;
  city?: string;
  photoUrl?: string;
  role?: string;
  rosterStatus?: RosterStatus;
  teamId?: string;
  settings?: ProPlayerSettings;
  sources: EsportsSource[];
};

export type EsportsTeam = {
  id: string;
  game: EsportsGameSlug;
  name: string;
  shortName?: string;
  countryCode?: string;
  region?: ValorantRegion;
  logoUrl?: string;
  playerIds: string[];
  sources: EsportsSource[];
};

export type CompetitiveSourceLink = {
  id: "vlr" | "prosettings";
  name: string;
  url: string;
  purpose: string;
  verifiedAt: string;
};

const VERIFIED_AT = "2026-09-16";
const PROSETTINGS_VALORANT = "https://prosettings.net/games/valorant/";

const REGION_EVENT_SOURCES: Record<ValorantRegion, string> = {
  americas: "https://www.vlr.gg/event/2977/vct-2026-americas-stage-2/group-stage",
  emea: "https://www.vlr.gg/event/2976/vct-2026-emea-stage-2/group-stage",
  pacific: "https://www.vlr.gg/event/2776/vct-2026-pacific-stage-2/group-stage",
  china: "https://www.vlr.gg/event/2978/vct-2026-china-stage-2/group-stage",
};

// Provenance metadata only. The UI shows source links next to the data they support.
export const COMPETITIVE_SOURCE_LINKS: CompetitiveSourceLink[] = [
  {
    id: "vlr",
    name: "VLR.gg",
    url: "https://www.vlr.gg/",
    purpose: "Times, elencos, eventos, partidas, resultados e contexto competitivo.",
    verifiedAt: VERIFIED_AT,
  },
  {
    id: "prosettings",
    name: "ProSettings.net",
    url: PROSETTINGS_VALORANT,
    purpose: "DPI, sensibilidade/eDPI, crosshair, vídeo, periféricos e configurações profissionais.",
    verifiedAt: VERIFIED_AT,
  },
];

type PlayerSeed = {
  handle: string;
  realName?: string;
  status?: Exclude<RosterStatus, "active">;
};

type ValorantRosterSeed = {
  id: string;
  name: string;
  shortName: string;
  region: ValorantRegion;
  countryCode?: string;
  vlrUrl: string;
  logoUrl?: string;
  players: PlayerSeed[];
};

/**
 * Tier-1 scene snapshot:
 * every team that took part in the four VCT 2026 Stage 2 regional leagues.
 *
 * Team pages are used for the latest roster state checked on VERIFIED_AT.
 * Because transfers can happen after an event, the player status records the
 * current team-page state instead of pretending a historical Stage 2 lineup is current.
 */
const VALORANT_VCT_2026: ValorantRosterSeed[] = [
  { id: "100t", name: "100 Thieves", shortName: "100T", region: "americas", countryCode: "US", vlrUrl: "https://www.vlr.gg/team/120/100-thieves", logoUrl: "https://owcdn.net/img/603c00d5c5a08.png", players: [{ handle: "vora", realName: "Jordan Pulwer" }, { handle: "Cryocells", realName: "Matthew Panganiban" }, { handle: "Asuna", realName: "Peter Mazuryk" }, { handle: "Timotino", realName: "Timothée Lavigne Dupont" }, { handle: "bang", realName: "Sean Bezerra" }] },
  { id: "c9", name: "Cloud9", shortName: "C9", region: "americas", countryCode: "US", vlrUrl: "https://www.vlr.gg/team/188/cloud9", players: [{ handle: "Zellsis", realName: "Jordan Montemurro" }, { handle: "FireBallOps", realName: "Cameron Tomaselli" }, { handle: "Jackk", realName: "Jack Foote" }, { handle: "OXY", realName: "Francis Hoang" }, { handle: "v1c", realName: "Victor Truong" }] },
  { id: "eg", name: "Evil Geniuses", shortName: "EG", region: "americas", countryCode: "US", vlrUrl: "https://www.vlr.gg/team/5248/evil-geniuses", players: [{ handle: "Paincakes", realName: "Jake Hass" }, { handle: "supamen", realName: "Phat Le" }, { handle: "bao", realName: "Bao Nguyen" }, { handle: "dgzin", realName: "Douglas Silva" }, { handle: "zerona", realName: "Javan Varela" }] },
  { id: "furia", name: "FURIA", shortName: "FUR", region: "americas", countryCode: "BR", vlrUrl: "https://www.vlr.gg/team/2406/furia", players: [{ handle: "artzin", realName: "Arthur Araujo" }, { handle: "basic", realName: "Luis Henrique Ferlin Tessaro" }, { handle: "Shyy", realName: "Fabian Usnayo" }, { handle: "C0M", realName: "Corbin Lee" }, { handle: "koalanoob", realName: "Gianfranco Potestio" }, { handle: "eeiu", realName: "Daniel Vucenovic", status: "inactive" }] },
  { id: "kru", name: "KRÜ Esports", shortName: "KRÜ", region: "americas", countryCode: "AR", vlrUrl: "https://www.vlr.gg/team/2355/kr-esports", players: [{ handle: "Less", realName: "Felipe de Loyola Basso" }, { handle: "mwzera", realName: "Leonardo Serrati" }, { handle: "Dantedeu5", realName: "Jesús Federico Larrosa" }, { handle: "heat", realName: "Olavo Marcelo" }, { handle: "saadhak", realName: "Matias Delipetro", status: "inactive" }] },
  { id: "lev", name: "LEVIATÁN", shortName: "LEV", region: "americas", countryCode: "AR", vlrUrl: "https://www.vlr.gg/team/2359/leviat-n", players: [{ handle: "kiNgg", realName: "Francisco Aravena" }, { handle: "spike", realName: "Rodrigo Lombardi" }, { handle: "blowz", realName: "Guilherme Oliviera" }, { handle: "Neon", realName: "Bruno Rodríguez" }, { handle: "Sato", realName: "Eduardo Kenzo Nagahama Sato" }] },
  { id: "loud", name: "LOUD", shortName: "LOUD", region: "americas", countryCode: "BR", vlrUrl: "https://www.vlr.gg/team/6961/loud", logoUrl: "https://owcdn.net/img/62bbec8dc1b9f.png", players: [{ handle: "erde", realName: "Roberto Lobos" }, { handle: "lukxo", realName: "Lucca Travaioli" }, { handle: "DaviH", realName: "David Cruz" }, { handle: "Darker", realName: "Sebastián Castro Cicuamia" }, { handle: "tkzin", realName: "Enzo Zimiani", status: "loan" }] },
  { id: "mibr", name: "MIBR", shortName: "MIBR", region: "americas", countryCode: "BR", vlrUrl: "https://www.vlr.gg/team/7386/mibr", players: [{ handle: "zekken", realName: "Zachary Patrone" }, { handle: "tex", realName: "Ian Botsch" }, { handle: "Mazino", realName: "Roberto Rivas" }, { handle: "Verno", realName: "Andrew Maust" }, { handle: "aspas", realName: "Erick Santos" }] },
  { id: "nrg", name: "NRG", shortName: "NRG", region: "americas", countryCode: "US", vlrUrl: "https://www.vlr.gg/team/1034/nrg", logoUrl: "https://owcdn.net/img/6610f026c1a9e.png", players: [{ handle: "Ethan", realName: "Ethan Arnold" }, { handle: "keiko", realName: "Georgio Sanassy" }, { handle: "brawk", realName: "Brock Somerhalder" }, { handle: "mada", realName: "Adam Pampuch" }, { handle: "skuba", realName: "Logan Jenkins" }] },
  { id: "sen", name: "Sentinels", shortName: "SEN", region: "americas", countryCode: "US", vlrUrl: "https://www.vlr.gg/team/2/sentinels", players: [{ handle: "johnqt", realName: "Mohamed Amine Ouarid" }, { handle: "Reduxx", realName: "Yassin Aboulalazm" }, { handle: "Jerrwin", realName: "Gurjiwan Gill" }, { handle: "cortezia", realName: "Gabriel Cortez" }, { handle: "JonahP", realName: "Jonah Pulice" }, { handle: "Marved", realName: "Jimmy Nguyen", status: "stand-in" }] },
  { id: "g2", name: "G2 Esports", shortName: "G2", region: "americas", countryCode: "US", vlrUrl: "https://www.vlr.gg/team/11058/g2-esports", logoUrl: "https://owcdn.net/img/633822848a741.png", players: [{ handle: "valyn", realName: "Jacob Batio" }, { handle: "jawgemo", realName: "Alexander Mor" }, { handle: "BABYBAY", realName: "Andrej Francisty" }, { handle: "trent", realName: "Trent Cairns" }, { handle: "leaf", realName: "Nathan Orf" }] },
  { id: "envy", name: "ENVY", shortName: "ENVY", region: "americas", countryCode: "US", vlrUrl: "https://www.vlr.gg/team/427/envy", players: [{ handle: "Eggsterr", realName: "Evan Grady" }, { handle: "nightz", realName: "Christian Smith" }, { handle: "ion", status: "inactive" }, { handle: "P0PPIN", status: "inactive" }, { handle: "Rossy", status: "inactive" }, { handle: "keznit", status: "inactive" }, { handle: "GLYPH", status: "inactive" }, { handle: "Demon1", status: "inactive" }] },
  { id: "bbl", name: "BBL Esports", shortName: "BBL", region: "emea", countryCode: "TR", vlrUrl: "https://www.vlr.gg/team/397/bbl-esports", players: [{ handle: "Lar0k", realName: "Yusuf Kaan Kanber" }, { handle: "Loita", realName: "Utku Kart" }, { handle: "Rosé", realName: "Eren Erzan", status: "inactive" }, { handle: "Crewen", realName: "Ali Eren Sargin", status: "inactive" }, { handle: "lovers rock", realName: "Umut Pekdoğan", status: "inactive" }] },
  { id: "fnc", name: "FNATIC", shortName: "FNC", region: "emea", countryCode: "EU", vlrUrl: "https://www.vlr.gg/team/2593/fnatic", players: [{ handle: "crashies", realName: "Austin Roberts" }, { handle: "kaajak", realName: "Kajetan Haremski" }, { handle: "Cloud", realName: "Kirill Nehozhin" }, { handle: "Alfajer", realName: "Emir Ali Beder" }, { handle: "Veqaj", status: "inactive" }, { handle: "Boaster", status: "inactive" }] },
  { id: "fut", name: "FUT Esports", shortName: "FUT", region: "emea", countryCode: "TR", vlrUrl: "https://www.vlr.gg/team/1184/fut-esports", logoUrl: "https://owcdn.net/img/632be9976b8fe.png", players: [{ handle: "sociablEE", realName: "Volkan Yonal" }, { handle: "s0pp", realName: "Efe Tur" }, { handle: "xeus", realName: "Doğan Gözgen" }, { handle: "yetujey", realName: "Eray Budak" }, { handle: "KROSTALY", realName: "Okan Alaçam" }] },
  { id: "gm8", name: "Gentle Mates", shortName: "M8", region: "emea", countryCode: "FR", vlrUrl: "https://www.vlr.gg/team/12694/gentle-mates", players: [{ handle: "marteen", realName: "Martin Pátek" }, { handle: "Proxh", realName: "Yusuf Emre Tunc" }, { handle: "Minny", realName: "Patrik Hušek" }, { handle: "bipo", status: "sub" }, { handle: "starxo", status: "inactive" }] },
  { id: "gx", name: "GIANTX", shortName: "GX", region: "emea", countryCode: "EU", vlrUrl: "https://www.vlr.gg/team/14419/giantx", players: [{ handle: "Flickless", realName: "Karel Maeckelbergh" }, { handle: "westside", realName: "Miłosz Duda" }, { handle: "ara", realName: "Hanceriuc Eduard-George" }, { handle: "neT", realName: "Michael Bernet" }, { handle: "tomaszy", status: "inactive" }] },
  { id: "kc", name: "Karmine Corp", shortName: "KC", region: "emea", countryCode: "FR", vlrUrl: "https://www.vlr.gg/team/8877/karmine-corp", logoUrl: "https://owcdn.net/img/627403a0d9e48.png", players: [{ handle: "Avez", realName: "Hazem Khaled" }, { handle: "dos9", realName: "Zhumagali Dastan" }, { handle: "LewN", realName: "Burak Alkan" }, { handle: "SUYGETSU", realName: "Dmitry Ilyushin" }, { handle: "N4RRATE", realName: "Marshall Massey" }, { handle: "Chaza", status: "sub" }, { handle: "sheydos", status: "inactive" }] },
  { id: "navi", name: "Natus Vincere", shortName: "NAVI", region: "emea", countryCode: "EU", vlrUrl: "https://www.vlr.gg/team/4915/natus-vincere", players: [{ handle: "chloric", realName: "Caide Heaton" }, { handle: "ExiT", realName: "Abdullah Al-Twaijri" }, { handle: "Ruxic", realName: "Uğur Güç" }, { handle: "hiro", realName: "Emirhan Kat" }, { handle: "Kolosha", status: "stand-in" }, { handle: "Shao", status: "inactive" }, { handle: "Filu", status: "inactive" }, { handle: "CyvOph", status: "inactive" }] },
  { id: "th", name: "Team Heretics", shortName: "TH", region: "emea", countryCode: "EU", vlrUrl: "https://www.vlr.gg/team/1001/team-heretics", players: [{ handle: "RieNs", realName: "Enes Ecirli" }, { handle: "Wo0t", realName: "Mert Alkan" }, { handle: "benjyfishy", realName: "Benjamin David Fish" }, { handle: "Boo", status: "inactive" }] },
  { id: "tl", name: "Team Liquid", shortName: "TL", region: "emea", countryCode: "EU", vlrUrl: "https://www.vlr.gg/team/474/team-liquid", logoUrl: "https://owcdn.net/img/640c381f0603f.png", players: [{ handle: "nAts", realName: "Ayaz Akhmetshin" }, { handle: "GSR", realName: "Ognjen Bondžić" }, { handle: "kamo", realName: "Kamil Frąckowiak" }, { handle: "trexx", realName: "Nikita Cherednichenko" }, { handle: "Kicks", realName: "Kimmie Laasner" }, { handle: "purp0", status: "sub" }, { handle: "wayne", status: "inactive" }, { handle: "MiniBoo", status: "inactive" }] },
  { id: "vit", name: "Team Vitality", shortName: "VIT", region: "emea", countryCode: "EU", vlrUrl: "https://www.vlr.gg/team/2059/team-vitality", logoUrl: "https://owcdn.net/img/6466d79e1ed40.png", players: [{ handle: "Jamppi", realName: "Elias Olkkonen" }, { handle: "PROFEK", realName: "Dawid Święć" }, { handle: "Derke", realName: "Nikita Niko Sirmitev" }, { handle: "Chronicle", realName: "Timofey Khromov" }, { handle: "Sayonara", realName: "Ștefan Mîtcu" }] },
  { id: "ef", name: "Eternal Fire", shortName: "EF", region: "emea", countryCode: "TR", vlrUrl: "https://www.vlr.gg/team/6392/eternal-fire", players: [{ handle: "nekky", realName: "Anıl Dağdeviren" }, { handle: "Spear", realName: "Arda Burak Kartal" }, { handle: "audaz", realName: "Soner Ekiz" }, { handle: "Favian", realName: "Enes Yiğiter" }, { handle: "echo", realName: "Ömür Serkan Şenol" }, { handle: "Izzy", status: "sub" }] },
  { id: "pcific", name: "PCIFIC Esports", shortName: "PCF", region: "emea", countryCode: "EU", vlrUrl: "https://www.vlr.gg/team/3478/pcific-esports", players: [{ handle: "qpert", realName: "Mateja Mijovic" }, { handle: "seven", realName: "Johann Hernandez" }, { handle: "waddle", realName: "Wadir Taraki" }] },
  { id: "dfm", name: "DetonatioN FocusMe", shortName: "DFM", region: "pacific", countryCode: "JP", vlrUrl: "https://www.vlr.gg/team/278/detonation-focusme", players: [{ handle: "SSeeS", realName: "Tomonori Okimura" }, { handle: "Meiy", realName: "Ibuki Seki" }, { handle: "yatsuka", realName: "Kazuya Ikeda" }, { handle: "Caedye", realName: "Amon Mateus Okakura" }, { handle: "Akame", realName: "Yu Gwang-hui" }] },
  { id: "drx", name: "KIWOOM DRX", shortName: "DRX", region: "pacific", countryCode: "KR", vlrUrl: "https://www.vlr.gg/team/8185/kiwoom-drx", players: [{ handle: "BeYN", realName: "Kang Ha-bin" }, { handle: "MaKo", realName: "Kim Myeong-gwan" }, { handle: "free1ng", realName: "No Ha-jun" }, { handle: "HYUNMIN", realName: "Song Hyun-min" }, { handle: "Flicker", realName: "Kim Tae-hee" }, { handle: "yong", status: "sub" }] },
  { id: "fs", name: "FULL SENSE", shortName: "FS", region: "pacific", countryCode: "TH", vlrUrl: "https://www.vlr.gg/team/4050/full-sense", players: [{ handle: "Killua", realName: "Tanate Teerasawad" }, { handle: "primmie", realName: "Papaphat Sriprapha" }, { handle: "JitBoyS", realName: "Jittana Nokngam" }, { handle: "seph1roth", realName: "Chinnakrit Phoojaroen" }, { handle: "thyy", status: "inactive" }, { handle: "Leviathan", status: "inactive" }] },
  { id: "geng", name: "Gen.G", shortName: "GEN", region: "pacific", countryCode: "KR", vlrUrl: "https://www.vlr.gg/team/17/gen-g", players: [{ handle: "Ash", realName: "Ha Hyun-cheol" }, { handle: "Karon", realName: "Kim Won-tae" }, { handle: "t3xture", realName: "Kim Na-ra" }, { handle: "Efina", realName: "Kim Nak-yeon" }, { handle: "Raxcal", realName: "Kim Min-seok" }, { handle: "Xiesta", status: "inactive" }, { handle: "ZynX", status: "inactive" }] },
  { id: "ge", name: "Global Esports", shortName: "GE", region: "pacific", countryCode: "IN", vlrUrl: "https://www.vlr.gg/team/918/global-esports", logoUrl: "https://owcdn.net/img/629f316ddd4dd.png", players: [{ handle: "xavi8k", realName: "Xavier Juan" }, { handle: "PatMen", realName: "Patrick Mendoza" }, { handle: "UdoTan", realName: "Go Kyung-won" }, { handle: "Kr1stal", realName: "Savva Fedorov" }, { handle: "Autumn", realName: "Kale Dunne" }] },
  { id: "prx", name: "Paper Rex", shortName: "PRX", region: "pacific", countryCode: "SG", vlrUrl: "https://www.vlr.gg/team/624/paper-rex", logoUrl: "https://owcdn.net/img/62bbeba74d5cb.png", players: [{ handle: "invy", realName: "Adrian Jiggs Reyes" }, { handle: "Jinggg", realName: "Wang Jing Jie" }, { handle: "f0rsakeN", realName: "Jason Susanto" }, { handle: "d4v41", realName: "Khalish Rusyaidee" }, { handle: "something", realName: "Ilya Petrov" }] },
  { id: "rrq", name: "Rex Regum Qeon", shortName: "RRQ", region: "pacific", countryCode: "ID", vlrUrl: "https://www.vlr.gg/team/878/rex-regum-qeon", players: [{ handle: "crazyguy", realName: "Ngô Công Anh" }, { handle: "Monyet", realName: "Cahya Nugraha" }, { handle: "xffero", realName: "David Monangin" }, { handle: "Xan", realName: "Xan Ng" }, { handle: "Jemkin", realName: "Maksim Batorov" }, { handle: "Kushy", realName: "Bryan Carlos Setiawan" }] },
  { id: "t1", name: "T1", shortName: "T1", region: "pacific", countryCode: "KR", vlrUrl: "https://www.vlr.gg/team/14/t1", logoUrl: "https://owcdn.net/img/62fe0b8f6b084.png", players: [{ handle: "Munchkin", realName: "Byeon Sang-beom" }, { handle: "stax", realName: "Kim Gu-taek" }, { handle: "Meteor", realName: "Kim Tae-oh" }, { handle: "BuZz", realName: "Yu Byeong-cheol" }, { handle: "DH", realName: "Kang Dong-ho" }, { handle: "iZu", realName: "Ham Woo-ju" }] },
  { id: "ts", name: "Team Secret", shortName: "TS", region: "pacific", countryCode: "PH", vlrUrl: "https://www.vlr.gg/team/6199/team-secret", players: [{ handle: "natz", realName: "Jonathan Adiputra" }, { handle: "Zeus", realName: "Jhian Vega" }, { handle: "STYRON", status: "inactive" }, { handle: "kellyS", status: "inactive" }, { handle: "Sylvan", status: "inactive" }] },
  { id: "zeta", name: "ZETA DIVISION", shortName: "ZETA", region: "pacific", countryCode: "JP", vlrUrl: "https://www.vlr.gg/team/5448/zeta-division", players: [{ handle: "SugarZ3ro", realName: "Shota Watanabe" }, { handle: "Absol", realName: "Kazuki Fujinoki" }, { handle: "SyouTa", realName: "Shota Aoki" }, { handle: "eKo", realName: "Yeom Wang-ryong" }, { handle: "Xdll", realName: "Yuto Mizomori" }] },
  { id: "varrel", name: "VARREL", shortName: "VAR", region: "pacific", countryCode: "JP", vlrUrl: "https://www.vlr.gg/team/11229/varrel", players: [{ handle: "C1ndeR", realName: "Ko Jae-hyuk" }, { handle: "Foxy9", realName: "Jung Jae-sung" }, { handle: "Klaus", realName: "Kim Min-hyuk" }, { handle: "XuNa", realName: "Kim Tae-geon" }, { handle: "oonzmlp", realName: "Shin Sang-beom" }, { handle: "Zexy", realName: "Jang Suk-hyun" }] },
  { id: "ns", name: "Nongshim RedForce", shortName: "NS", region: "pacific", countryCode: "KR", vlrUrl: "https://www.vlr.gg/team/11060/nongshim-redforce", logoUrl: "https://owcdn.net/img/6399bb707aacb.png", players: [{ handle: "Rb", realName: "Goo Sang-min" }, { handle: "WoohyuN", realName: "Moon Woo-hyun" }, { handle: "Xross", realName: "Jeonghwan" }, { handle: "Francis", realName: "Kim Mu-bin" }, { handle: "Dambi", realName: "Lee Hyuk-kyu" }, { handle: "Ivy", realName: "Park Sung-hyeon" }] },
  { id: "ag", name: "All Gamers", shortName: "AG", region: "china", countryCode: "CN", vlrUrl: "https://www.vlr.gg/team/1119/all-gamers", players: [{ handle: "Shr1mp", realName: "Yang Yong" }, { handle: "K1ra", realName: "Huang Zhihao" }, { handle: "Bai", realName: "Zhang Zeyang" }, { handle: "f4ngeer", realName: "Roman Smirnov" }, { handle: "iamgrq", realName: "Gao Ruiqi" }] },
  { id: "blg", name: "Bilibili Gaming", shortName: "BLG", region: "china", countryCode: "CN", vlrUrl: "https://www.vlr.gg/team/12010/bilibili-gaming", players: [{ handle: "whzy", realName: "Wang Haozhe" }, { handle: "rushia", realName: "Wang Xiaojie" }, { handle: "nephh", realName: "Marcus Tan" }, { handle: "yilai", realName: "Gu Yiming" }, { handle: "Knight", realName: "Liu Yuxiang" }, { handle: "bud", realName: "Yang Renyu" }, { handle: "FT", realName: "Yan Shuaibo" }, { handle: "Levius", status: "inactive" }] },
  { id: "edg", name: "EDward Gaming", shortName: "EDG", region: "china", countryCode: "CN", vlrUrl: "https://www.vlr.gg/team/1120/edward-gaming", logoUrl: "https://owcdn.net/img/62c82049253b2.png", players: [{ handle: "nobody", realName: "Wang Senxu" }, { handle: "ZmjjKK", realName: "Zheng Yongkang" }, { handle: "CHICHOO", realName: "Wan Shunzhi" }, { handle: "Smoggy", realName: "Zhang Zhao" }, { handle: "Jieni7", realName: "Zhang Juntai" }, { handle: "stew", realName: "Park Young-chan" }, { handle: "zjc", status: "sub" }] },
  { id: "fpx", name: "FunPlus Phoenix", shortName: "FPX", region: "china", countryCode: "CN", vlrUrl: "https://www.vlr.gg/team/11328/funplus-phoenix", players: [{ handle: "AAAAY", realName: "Zhang Yang" }, { handle: "coconut", realName: "Colin Patrick Chung" }, { handle: "Xlele", realName: "Zhao Yanbo" }, { handle: "Setrod", realName: "Ou Taigeng" }] },
  { id: "jdg", name: "JD Gaming", shortName: "JDG", region: "china", countryCode: "CN", vlrUrl: "https://www.vlr.gg/team/13576/jd-gaming", logoUrl: "https://owcdn.net/img/64f9825408326.png", players: [{ handle: "jkuro", realName: "Yong Haochong" }, { handle: "zhe", realName: "Niu Zhe" }, { handle: "Yuicaw", realName: "Huang Yung-chieh" }, { handle: "crownfisher", realName: "Li Ao" }, { handle: "BerLIN", realName: "Zhang Bolin" }] },
  { id: "nova", name: "Nova Esports", shortName: "NOVA", region: "china", countryCode: "CN", vlrUrl: "https://www.vlr.gg/team/12064/nova-esports", players: [{ handle: "qiutiaN", realName: "Bijan Moeinzadeh" }, { handle: "cb", realName: "Wang Qingchuan" }, { handle: "Ezeir", realName: "Zhao Zejun" }, { handle: "GuanG", realName: "Guang Honglin" }, { handle: "swagzor", realName: "Mikhail Vaniushin" }, { handle: "kodeth", status: "sub" }, { handle: "GREEN", status: "sub" }] },
  { id: "tec", name: "Titan Esports Club", shortName: "TEC", region: "china", countryCode: "CN", vlrUrl: "https://www.vlr.gg/team/14137/titan-esports-club", players: [{ handle: "Haodong", realName: "Guo Haodong" }, { handle: "lucas", realName: "Yunkun Lu" }, { handle: "Dynamite", realName: "Zhao Zihao" }, { handle: "ra1ny", realName: "Chen Baohuan" }, { handle: "Coco", realName: "Ding Dajian" }, { handle: "Spitfires", status: "sub" }] },
  { id: "trace", name: "Trace Esports", shortName: "TE", region: "china", countryCode: "CN", vlrUrl: "https://www.vlr.gg/team/12685/trace-esports", players: [{ handle: "LuoK1ng", realName: "Zhang Zhanpeng" }, { handle: "Kai", realName: "Lu Zhinan" }, { handle: "FengF", realName: "Song Xuefeng" }, { handle: "FKEY", realName: "Ke Chen" }, { handle: "deLb", realName: "Delbert Tanoto" }, { handle: "Abo", status: "sub" }, { handle: "Toosy", status: "sub" }] },
  { id: "tyloo", name: "TYLOO", shortName: "TYL", region: "china", countryCode: "CN", vlrUrl: "https://www.vlr.gg/team/731/tyloo", logoUrl: "https://owcdn.net/img/63eb60fb08390.png", players: [{ handle: "SiuFatBB", realName: "Pong Gaa Hei" }, { handle: "splash", realName: "Moses Christophe Jonathan" }, { handle: "Scales", realName: "Zhang Zhen" }, { handle: "Erv", realName: "Shen Zhiwei" }, { handle: "slowly", realName: "Kelun Sun" }, { handle: "xihe", realName: "Peng Wenbo" }] },
  { id: "wolves", name: "Wolves Esports", shortName: "WOL", region: "china", countryCode: "CN", vlrUrl: "https://www.vlr.gg/team/13790/wolves-esports", players: [{ handle: "glacier", realName: "Liang Zhekai" }, { handle: "yosemite", realName: "Wang Lei" }, { handle: "Spring", realName: "Liu Jiunting" }, { handle: "Deryeon", realName: "Derrick Yee" }, { handle: "aluba", realName: "Zhong Haojun" }, { handle: "nothing", status: "sub" }] },
  { id: "xlg", name: "Xi Lai Gaming", shortName: "XLG", region: "china", countryCode: "CN", vlrUrl: "https://www.vlr.gg/team/13581/xi-lai-gaming", logoUrl: "https://owcdn.net/img/671742f863b9b.png", players: [{ handle: "WsLeo", realName: "Huang Pinwei" }, { handle: "Sharks", realName: "Qiu Ge" }, { handle: "Lysoar", realName: "Liang Youhao" }, { handle: "NoMan", realName: "James Man" }, { handle: "Rarga", realName: "Arthur Churyumov" }, { handle: "happywei", realName: "Deng Minwei" }] },
  { id: "drg", name: "Dragon Ranger Gaming", shortName: "DRG", region: "china", countryCode: "CN", vlrUrl: "https://www.vlr.gg/team/11981/dragon-ranger-gaming", players: [{ handle: "Nicc", realName: "Shao Yi-qun" }, { handle: "Flex1n", realName: "Lo Rui" }, { handle: "Life", realName: "Qu Donghao" }, { handle: "vo0kashu", realName: "Ilya Ushakov" }, { handle: "Verse", realName: "Zhou Zijun" }, { handle: "SpiritZ1", realName: "Lin Dingyu" }] },
];

const VERIFIED_SETTINGS: Record<string, { settings: ProPlayerSettings; source: EsportsSource }> = {
  cryocells: {
    settings: { dpi: 1600, sensitivity: 0.087, edpi: 139.2, pollingRateHz: 8000, mouse: "Logitech G Pro X2 SUPERSTRIKE Lunar Eclipse", resolution: "1280x1024", displayMode: "Fullscreen", crosshairCode: "0;s;1;P;c;5;o;1;0l;3;0o;0;0a;1;0f;0;1b;0" },
    source: { url: "https://prosettings.net/players/cryocells/", label: "ProSettings.net", verifiedAt: VERIFIED_AT, note: "Individual settings page checked for MGP." },
  },
  jinggg: {
    settings: { dpi: 1600, sensitivity: 0.175, edpi: 280, pollingRateHz: 2000, mouse: "Pulsar Jinggg-x", resolution: "1920x1080", displayMode: "Fullscreen", crosshairCode: "0;s;1;P;c;5;o;1;f;0;m;1;0t;3;0l;0;0v;1;0g;1;0o;0;0a;1;0f;0;1t;1;1l;4;1g;1;1o;0;1a;1;1m;0;1f;0;S;c;5;o;1" },
    source: { url: "https://prosettings.net/players/jinggg/", label: "ProSettings.net", verifiedAt: VERIFIED_AT, note: "Individual settings page checked for MGP." },
  },
  f0rsaken: {
    settings: { dpi: 800, sensitivity: 0.712, edpi: 569.6, pollingRateHz: 4000, mouse: "Pulsar Susanto-X" },
    source: { url: "https://prosettings.net/players/f0rsaken/", label: "ProSettings.net", verifiedAt: VERIFIED_AT, note: "Individual settings page checked for MGP." },
  },
  aspas: {
    settings: { dpi: 800, sensitivity: 0.4, edpi: 320, pollingRateHz: 1000, mouse: "Logitech G Pro X Superlight 2 Black", resolution: "1920x1080", displayMode: "Fullscreen", crosshairCode: "0;P;h;0;0l;4;0o;0;0a;1;0f;0;1b;0" },
    source: { url: "https://prosettings.net/players/aspas/", label: "ProSettings.net", verifiedAt: VERIFIED_AT, note: "Individual settings page checked for MGP." },
  },
  saadhak: {
    settings: { dpi: 900, sensitivity: 0.255, edpi: 229.5, pollingRateHz: 500, mouse: "Logitech G Pro X2 SUPERSTRIKE Lunar Eclipse", resolution: "1920x1080", displayMode: "Fullscreen", crosshairCode: "0;s;1;P;c;3;h;0;d;1;z;1;a;0.7;0t;1;0l;2;0a;1;0f;0;1t;3;1o;1;1a;0.7;1m;0;1f;0;S;c;5;s;0;o;1" },
    source: { url: "https://prosettings.net/players/saadhak/", label: "ProSettings.net", verifiedAt: VERIFIED_AT, note: "Individual settings page checked for MGP." },
  },
  less: {
    settings: { dpi: 800, sensitivity: 0.32, edpi: 256, pollingRateHz: 4000, mouse: "Logitech G Pro 2 LIGHTSPEED Magenta", resolution: "1920x1080", displayMode: "Fullscreen", crosshairCode: "0;s;1;P;o;1;d;1;f;0;0l;2;0o;0;0a;1;0f;0;1b;0" },
    source: { url: "https://prosettings.net/players/less/", label: "ProSettings.net", verifiedAt: VERIFIED_AT, note: "Individual settings page checked for MGP." },
  },
  splash: {
    settings: { dpi: 1600, sensitivity: 0.125, edpi: 200, pollingRateHz: 2000, mouse: "VAXEE NP-01S V3 Galapagos Green" },
    source: { url: "https://prosettings.net/players/splash/", label: "ProSettings.net", verifiedAt: VERIFIED_AT, note: "Individual settings page checked for MGP." },
  },
  c0m: {
    settings: { dpi: 800, sensitivity: 0.2, edpi: 160, pollingRateHz: 1000, mouse: "Logitech G Pro X2 SUPERSTRIKE Lunar Eclipse", resolution: "1440x1080", displayMode: "Fullscreen", crosshairCode: "0;p;0;s;1;P;c;5;o;1;f;0;0t;1;0l;3;0o;2;0a;1;0f;0;1b;0;A;c;5;o;1;0t;1;0l;3;0o;2;0a;1;0f;0;1b;0;S;s;0.823;o;1" },
    source: { url: "https://prosettings.net/players/c0m/", label: "ProSettings.net", verifiedAt: VERIFIED_AT, note: "Individual settings page checked for MGP." },
  },
  nats: {
    settings: { dpi: 800, sensitivity: 0.49, edpi: 392, pollingRateHz: 1000, mouse: "ZOWIE U2-DW Black", resolution: "1280x960", displayMode: "Fullscreen", crosshairCode: "0;P;c;1;o;1;0t;1;0l;2;0o;2;0a;1;0f;0;1b;0" },
    source: { url: "https://prosettings.net/players/nats/", label: "ProSettings.net", verifiedAt: VERIFIED_AT, note: "Individual settings page checked for MGP." },
  },
  basic: {
    settings: { dpi: 800, sensitivity: 0.28, edpi: 224, pollingRateHz: 2000, mouse: "Logitech G Pro X2 SUPERSTRIKE Lunar Eclipse" },
    source: { url: "https://prosettings.net/players/basic/", label: "ProSettings.net", verifiedAt: VERIFIED_AT, note: "Individual settings page checked for MGP." },
  },
};

const VERIFIED_ROLES: Record<string, string> = {
  cryocells: "Duelista",
  jinggg: "Duelista",
  f0rsaken: "Flex",
  aspas: "Duelista",
};

function playerId(teamId: string, handle: string) {
  return `${teamId}-${handle.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
}

export const ESPORTS_PLAYERS: EsportsPlayer[] = VALORANT_VCT_2026.flatMap((team) =>
  team.players.map((player) => {
    const normalizedHandle = player.handle.toLowerCase();
    const verified = VERIFIED_SETTINGS[normalizedHandle];
    return {
      id: playerId(team.id, player.handle),
      game: "valorant" as const,
      handle: player.handle,
      realName: player.realName,
      teamId: team.id,
      rosterStatus: player.status ?? "active",
      role: VERIFIED_ROLES[normalizedHandle],
      settings: verified?.settings,
      sources: [
        { url: team.vlrUrl, label: "VLR.gg", verifiedAt: VERIFIED_AT, note: `Current team-page roster reference — ${team.name}.` },
        ...(verified ? [verified.source] : []),
      ],
    };
  }),
);

export const ESPORTS_TEAMS: EsportsTeam[] = VALORANT_VCT_2026.map((team) => ({
  id: team.id,
  game: "valorant",
  name: team.name,
  shortName: team.shortName,
  countryCode: team.countryCode,
  region: team.region,
  logoUrl: team.logoUrl,
  playerIds: team.players.map((player) => playerId(team.id, player.handle)),
  sources: [
    { url: team.vlrUrl, label: "VLR.gg", verifiedAt: VERIFIED_AT, note: "Current team and roster page." },
    { url: REGION_EVENT_SOURCES[team.region], label: `VLR.gg — VCT 2026 ${team.region.toUpperCase()} Stage 2`, verifiedAt: VERIFIED_AT, note: "Tier-1 VCT 2026 Stage 2 participation reference." },
  ],
}));

/**
 * MGP competitive data is curated and provenance-tracked.
 * - VLR team/event pages: team participation, roster state and names.
 * - ProSettings individual pages: settings and gear snapshots.
 * - Fast-changing values remain hidden until individually verified.
 * - Media is not bulk-copied from third-party pages merely because it is public.
 */
export function getEsportsTeams(game: EsportsGameSlug) {
  return ESPORTS_TEAMS.filter((team) => team.game === game);
}

export function getEsportsPlayers(game: EsportsGameSlug) {
  return ESPORTS_PLAYERS.filter((player) => player.game === game);
}
