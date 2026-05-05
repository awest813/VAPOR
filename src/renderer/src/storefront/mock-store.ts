import type {
  CatalogueSearchPayload,
  CatalogueSearchResult,
  GameStats,
  LibraryGame,
  ShopAssets,
  Steam250Game,
  TrendingGame,
} from "@types";
import { CatalogueCategory } from "@shared";

type StorefrontGame = ShopAssets & {
  id: string;
  description: string;
  heroDescription: string;
  featuredReason: string;
  genreLabels: string[];
  tags: string[];
  developers: string[];
  publishers: string[];
  releaseYear: number;
  stats: GameStats;
  accent: string;
};

const svgDataUrl = (
  title: string,
  subtitle: string,
  colors: [string, string],
  ratio: "wide" | "hero" | "cover" | "logo" = "wide"
) => {
  const dimensions = {
    wide: { width: 920, height: 480 },
    hero: { width: 1600, height: 620 },
    cover: { width: 600, height: 900 },
    logo: { width: 900, height: 320 },
  }[ratio];

  const titleFont = ratio === "logo" ? 64 : ratio === "cover" ? 56 : 72;
  const subtitleFont = ratio === "logo" ? 24 : 28;

  const safeTitle = title.replace(/&/g, "&amp;");
  const safeSubtitle = subtitle.replace(/&/g, "&amp;");

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${dimensions.width}" height="${dimensions.height}" viewBox="0 0 ${dimensions.width} ${dimensions.height}">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${colors[0]}" />
          <stop offset="100%" stop-color="${colors[1]}" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" rx="24" fill="url(#grad)" />
      <circle cx="${dimensions.width - 140}" cy="110" r="96" fill="rgba(255,255,255,0.1)" />
      <circle cx="110" cy="${dimensions.height - 110}" r="88" fill="rgba(255,255,255,0.08)" />
      <text x="64" y="${dimensions.height / 2 - 12}" fill="#fff" font-family="Arial, sans-serif" font-size="${titleFont}" font-weight="700">${safeTitle}</text>
      <text x="64" y="${dimensions.height / 2 + 42}" fill="rgba(255,255,255,0.88)" font-family="Arial, sans-serif" font-size="${subtitleFont}">${safeSubtitle}</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

const buildGameArt = (
  title: string,
  tagline: string,
  colors: [string, string]
) => ({
  libraryImageUrl: svgDataUrl(title, tagline, colors, "wide"),
  libraryHeroImageUrl: svgDataUrl(title, tagline, colors, "hero"),
  coverImageUrl: svgDataUrl(title, tagline, colors, "cover"),
  logoImageUrl: svgDataUrl(title, tagline, colors, "logo"),
  iconUrl: svgDataUrl(title.slice(0, 1), tagline, colors, "cover"),
});

export const mockStorefrontGames: StorefrontGame[] = [
  {
    id: "browser-sky-runner",
    objectId: "browser-sky-runner",
    shop: "steam",
    title: "Sky Runner",
    logoPosition: "center",
    downloadSources: ["Browser"],
    isBrowserGame: true,
    isFreeToPlay: true,
    price: "Free",
    shortDescription: "Click the moving beacon before the timer expires.",
    cloudSaveSupport: "tier",
    cloudSaveTierLabel: "$2/mo hosted saves",
    description:
      "A fast arcade sprint built for the browser. Tap the moving beacon, chain streaks, and chase a new personal best in short sessions.",
    heroDescription: "Instant play arcade action with optional hosted saves.",
    featuredReason: "Play instantly in the browser",
    genreLabels: ["Arcade", "Score Attack"],
    tags: ["browser", "arcade", "free"],
    developers: ["VAPOR Originals"],
    publishers: ["VAPOR"],
    releaseYear: 2026,
    stats: {
      downloadCount: 18240,
      playerCount: 624,
      averageScore: 4.6,
      reviewCount: 231,
    },
    accent: "#7c5cff",
    ...buildGameArt("Sky Runner", "Arcade score chase", ["#7c5cff", "#1dd1ff"]),
  },
  {
    id: "browser-vault-switch",
    objectId: "browser-vault-switch",
    shop: "steam",
    title: "Vault Switch",
    logoPosition: "center",
    downloadSources: ["Browser"],
    isBrowserGame: true,
    isFreeToPlay: true,
    price: "Free",
    shortDescription: "Flip cards, match pairs, and clear the board quickly.",
    cloudSaveSupport: "tier",
    cloudSaveTierLabel: "$2/mo hosted saves",
    description:
      "A tactical memory game with short rounds and leaderboard-focused replays. Great for quick sessions across desktop and mobile browsers.",
    heroDescription: "Free browser puzzles with account-linked save hosting.",
    featuredReason: "Great for short repeat sessions",
    genreLabels: ["Puzzle", "Memory"],
    tags: ["browser", "puzzle", "free"],
    developers: ["VAPOR Originals"],
    publishers: ["VAPOR"],
    releaseYear: 2026,
    stats: {
      downloadCount: 12680,
      playerCount: 411,
      averageScore: 4.4,
      reviewCount: 144,
    },
    accent: "#1fbf75",
    ...buildGameArt("Vault Switch", "Quick memory puzzle", ["#1fbf75", "#0f766e"]),
  },
  {
    id: "browser-orbit-clicker",
    objectId: "browser-orbit-clicker",
    shop: "steam",
    title: "Orbit Clicker",
    logoPosition: "center",
    downloadSources: ["Browser", "Desktop save export"],
    isBrowserGame: true,
    isFreeToPlay: true,
    price: "Free",
    shortDescription: "Trigger perfect clicks as satellites pass the target ring.",
    cloudSaveSupport: "tier",
    cloudSaveTierLabel: "$2/mo hosted saves",
    description:
      "A rhythm-inspired browser game with escalating speed. Play free instantly, then add hosted saves if you want score history across devices.",
    heroDescription: "Play free. Upgrade only if you want cloud-hosted saves.",
    featuredReason: "Built around the save-tier pitch",
    genreLabels: ["Rhythm", "Arcade"],
    tags: ["browser", "rhythm", "free"],
    developers: ["VAPOR Originals"],
    publishers: ["VAPOR"],
    releaseYear: 2026,
    stats: {
      downloadCount: 9480,
      playerCount: 278,
      averageScore: 4.2,
      reviewCount: 92,
    },
    accent: "#f97316",
    ...buildGameArt("Orbit Clicker", "Timing challenge", ["#f97316", "#ef4444"]),
  },
  {
    id: "browser-pulse-cascade",
    objectId: "browser-pulse-cascade",
    shop: "steam",
    title: "Pulse Cascade",
    logoPosition: "center",
    downloadSources: ["Browser"],
    isBrowserGame: true,
    isFreeToPlay: true,
    price: "Free",
    shortDescription: "Repeat the pulse sequence as it grows each round.",
    cloudSaveSupport: "tier",
    cloudSaveTierLabel: "$2/mo hosted saves",
    description:
      "A Simon-style memory challenge for the browser. Watch the pads light up, repeat the sequence, and push your streak as the chain grows longer each round.",
    heroDescription: "Sequence-memory arcade with hosted save streaks.",
    featuredReason: "Replayable in 60-second bursts",
    genreLabels: ["Memory", "Arcade"],
    tags: ["browser", "memory", "free"],
    developers: ["VAPOR Originals"],
    publishers: ["VAPOR"],
    releaseYear: 2026,
    stats: {
      downloadCount: 7320,
      playerCount: 198,
      averageScore: 4.3,
      reviewCount: 67,
    },
    accent: "#22d3ee",
    ...buildGameArt("Pulse Cascade", "Sequence memory", ["#22d3ee", "#a855f7"]),
  },
  {
    id: "browser-neon-dash",
    objectId: "browser-neon-dash",
    shop: "steam",
    title: "Neon Dash",
    logoPosition: "center",
    downloadSources: ["Browser"],
    isBrowserGame: true,
    isFreeToPlay: true,
    price: "Free",
    shortDescription: "Dodge neon obstacles and survive as long as possible.",
    cloudSaveSupport: "tier",
    cloudSaveTierLabel: "$2/mo hosted saves",
    description:
      "An endless runner set in a neon-drenched cyberpunk corridor. Jump, slide, and dash your way through randomized obstacle walls. How far can you go?",
    heroDescription: "Cyberpunk endless runner — free, instant, in-browser.",
    featuredReason: "New this week — high replay value",
    genreLabels: ["Arcade", "Endless Runner"],
    tags: ["browser", "arcade", "endless", "free", "cyberpunk"],
    developers: ["VAPOR Originals"],
    publishers: ["VAPOR"],
    releaseYear: 2026,
    stats: {
      downloadCount: 5140,
      playerCount: 342,
      averageScore: 4.5,
      reviewCount: 88,
    },
    accent: "#e879f9",
    ...buildGameArt("Neon Dash", "Cyberpunk endless runner", ["#e879f9", "#7c3aed"]),
  },
  {
    id: "browser-gravity-flip",
    objectId: "browser-gravity-flip",
    shop: "steam",
    title: "Gravity Flip",
    logoPosition: "center",
    downloadSources: ["Browser"],
    isBrowserGame: true,
    isFreeToPlay: true,
    price: "Free",
    shortDescription: "Invert gravity at the right moment to survive each level.",
    cloudSaveSupport: "tier",
    cloudSaveTierLabel: "$2/mo hosted saves",
    description:
      "A physics platformer with a single mechanic — flip gravity. Navigate tight corridors, avoid spikes, and reach the exit. Each level is designed around one perfect flip.",
    heroDescription: "One-button physics platformer — satisfying and tricky.",
    featuredReason: "Puzzle lovers will flip for it",
    genreLabels: ["Puzzle", "Platformer"],
    tags: ["browser", "puzzle", "platformer", "physics", "free"],
    developers: ["VAPOR Originals"],
    publishers: ["VAPOR"],
    releaseYear: 2026,
    stats: {
      downloadCount: 4820,
      playerCount: 204,
      averageScore: 4.4,
      reviewCount: 71,
    },
    accent: "#34d399",
    ...buildGameArt("Gravity Flip", "Physics platformer", ["#34d399", "#065f46"]),
  },
  {
    id: "browser-hex-storm",
    objectId: "browser-hex-storm",
    shop: "steam",
    title: "Hex Storm",
    logoPosition: "center",
    downloadSources: ["Browser"],
    isBrowserGame: true,
    isFreeToPlay: true,
    price: "Free",
    shortDescription: "Connect matching hexes before the board fills up.",
    cloudSaveSupport: "tier",
    cloudSaveTierLabel: "$2/mo hosted saves",
    description:
      "A tile-connection puzzle where you draw paths between matching hex pairs while the board keeps filling. Quick to learn, hard to master — perfect for a 5-minute break.",
    heroDescription: "Hexagonal match puzzle — relaxing but brain-teasing.",
    featuredReason: "Top-rated puzzle this month",
    genreLabels: ["Puzzle", "Strategy"],
    tags: ["browser", "puzzle", "strategy", "hex", "free"],
    developers: ["VAPOR Originals"],
    publishers: ["VAPOR"],
    releaseYear: 2026,
    stats: {
      downloadCount: 6200,
      playerCount: 317,
      averageScore: 4.7,
      reviewCount: 115,
    },
    accent: "#fbbf24",
    ...buildGameArt("Hex Storm", "Tile connection puzzle", ["#fbbf24", "#b45309"]),
  },
  {
    id: "browser-starfield-shooter",
    objectId: "browser-starfield-shooter",
    shop: "steam",
    title: "Starfield Shooter",
    logoPosition: "center",
    downloadSources: ["Browser"],
    isBrowserGame: true,
    isFreeToPlay: true,
    price: "Free",
    shortDescription: "Classic top-down space shooter with power-up drops.",
    cloudSaveSupport: "tier",
    cloudSaveTierLabel: "$2/mo hosted saves",
    description:
      "Retro-style top-down shooter with procedurally spawned enemy waves, screen-clearing bombs, and a power-up drop system. Compete for the highest score on the global leaderboard.",
    heroDescription: "Old-school space shooter with modern leaderboards.",
    featuredReason: "Global leaderboard — new top score every day",
    genreLabels: ["Shoot 'em up", "Arcade"],
    tags: ["browser", "arcade", "shooter", "space", "free"],
    developers: ["VAPOR Originals"],
    publishers: ["VAPOR"],
    releaseYear: 2026,
    stats: {
      downloadCount: 11300,
      playerCount: 489,
      averageScore: 4.8,
      reviewCount: 183,
    },
    accent: "#60a5fa",
    ...buildGameArt("Starfield Shooter", "Space arcade", ["#60a5fa", "#1e3a8a"]),
  },
];

export const getMockStorefrontGame = (
  shop: string,
  objectId: string
): StorefrontGame | null =>
  mockStorefrontGames.find(
    (game) => game.shop === shop && game.objectId === objectId
  ) ?? null;

export const getMockTrendingGames = (): TrendingGame[] =>
  [mockStorefrontGames[7]!, mockStorefrontGames[0]!].map((game) => ({
    ...game,
    description: game.heroDescription,
    uri: `/play/${game.shop}/${game.objectId}?title=${encodeURIComponent(game.title)}`,
  }));

const categoryOrder: Record<CatalogueCategory, StorefrontGame[]> = {
  [CatalogueCategory.Featured]: [
    mockStorefrontGames[7], // Starfield Shooter
    mockStorefrontGames[6], // Hex Storm
    mockStorefrontGames[0], // Sky Runner
    mockStorefrontGames[1], // Vault Switch
  ],
  [CatalogueCategory.New]: [
    mockStorefrontGames[4], // Neon Dash
    mockStorefrontGames[5], // Gravity Flip
    mockStorefrontGames[6], // Hex Storm
    mockStorefrontGames[7], // Starfield Shooter
  ],
  [CatalogueCategory.Free]: mockStorefrontGames,
};

export const getMockCatalogueCategory = (
  category: CatalogueCategory
): ShopAssets[] => categoryOrder[category] ?? mockStorefrontGames;

const includesFilterValue = (value: string, list: string[]) =>
  list.length === 0 || list.includes(value);

export const searchMockCatalogue = (
  filters: CatalogueSearchPayload
): { edges: CatalogueSearchResult[]; count: number } => {
  const normalizedTitle = filters.title.trim().toLowerCase();

  const filtered = mockStorefrontGames.filter((game) => {
    const matchesTitle =
      !normalizedTitle ||
      game.title.toLowerCase().includes(normalizedTitle) ||
      game.shortDescription?.toLowerCase().includes(normalizedTitle);

    const matchesGenres =
      filters.genres.length === 0 ||
      filters.genres.some((genre) => game.genreLabels.includes(genre));

    const matchesTags =
      filters.tags.length === 0 ||
      filters.tags.some((tag) => game.tags.includes(String(tag)));

    const matchesDevelopers =
      filters.developers.length === 0 ||
      game.developers.some((developer) =>
        includesFilterValue(developer, filters.developers)
      );

    const matchesPublishers =
      filters.publishers.length === 0 ||
      game.publishers.some((publisher) =>
        includesFilterValue(publisher, filters.publishers)
      );

    const minYear = filters.releaseYear?.gte ?? Number.MIN_SAFE_INTEGER;
    const maxYear = filters.releaseYear?.lte ?? Number.MAX_SAFE_INTEGER;
    const matchesReleaseYear =
      game.releaseYear >= minYear && game.releaseYear <= maxYear;

    return (
      matchesTitle &&
      matchesGenres &&
      matchesTags &&
      matchesDevelopers &&
      matchesPublishers &&
      matchesReleaseYear
    );
  });

  const edges = filtered.map<CatalogueSearchResult>((game) => ({
    id: game.id,
    objectId: game.objectId,
    title: game.title,
    shop: game.shop,
    genres: game.genreLabels,
    releaseYear: game.releaseYear,
    libraryImageUrl: game.libraryImageUrl,
    downloadSources: game.downloadSources,
    isBrowserGame: game.isBrowserGame,
    isFreeToPlay: game.isFreeToPlay,
    price: game.price,
    shortDescription: game.shortDescription,
    cloudSaveSupport: game.cloudSaveSupport,
    cloudSaveTierLabel: game.cloudSaveTierLabel,
  }));

  return { edges, count: edges.length };
};

export const getMockRandomGame = (): Steam250Game => {
  const randomIndex = Math.floor(Math.random() * mockStorefrontGames.length);
  const game = mockStorefrontGames[randomIndex]!;

  return {
    title: game.title,
    objectId: game.objectId,
    isBrowserGame: true,
  };
};

const libraryStorageKey = "hydra:web:storefront:library";

const readLibraryStorage = (): LibraryGame[] => {
  if (typeof window === "undefined") return [];
  const value = window.localStorage.getItem(libraryStorageKey);
  if (!value) return [];

  try {
    return JSON.parse(value) as LibraryGame[];
  } catch {
    return [];
  }
};

const writeLibraryStorage = (library: LibraryGame[]) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(libraryStorageKey, JSON.stringify(library));
};

const toLibraryGame = (game: StorefrontGame): LibraryGame => ({
  id: game.id,
  title: game.title,
  iconUrl: game.iconUrl,
  libraryHeroImageUrl: game.libraryHeroImageUrl,
  logoImageUrl: game.logoImageUrl,
  playTimeInMilliseconds: 0,
  lastTimePlayed: null,
  objectId: game.objectId,
  shop: game.shop,
  remoteId: null,
  isDeleted: false,
  executablePath: null,
  favorite: false,
  isPinned: false,
  automaticCloudSync: false,
  download: null,
  libraryImageUrl: game.libraryImageUrl,
  logoPosition: game.logoPosition,
  coverImageUrl: game.coverImageUrl,
  downloadSources: game.downloadSources,
  isBrowserGame: game.isBrowserGame,
  isFreeToPlay: game.isFreeToPlay,
  price: game.price,
  shortDescription: game.shortDescription,
  cloudSaveSupport: game.cloudSaveSupport,
  cloudSaveTierLabel: game.cloudSaveTierLabel,
});

export const getMockLibrary = (): LibraryGame[] => readLibraryStorage();

export const addMockGameToLibrary = (shop: string, objectId: string) => {
  const game = getMockStorefrontGame(shop, objectId);
  if (!game) return;

  const library = readLibraryStorage();
  const exists = library.some(
    (entry) => entry.shop === game.shop && entry.objectId === game.objectId
  );

  if (exists) return;

  writeLibraryStorage([...library, toLibraryGame(game)]);
};

export const getMockGameStats = (
  shop: string,
  objectId: string
): GameStats | null => getMockStorefrontGame(shop, objectId)?.stats ?? null;
