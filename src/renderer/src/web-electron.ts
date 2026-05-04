import { CatalogueCategory } from "@shared";
import {
  addMockGameToLibrary,
  getMockCatalogueCategory,
  getMockGameStats,
  getMockLibrary,
  getMockRandomGame,
  getMockStorefrontGame,
  getMockTrendingGames,
  searchMockCatalogue,
} from "./storefront/mock-store";

const storageKey = (sublevelName: string | null | undefined, key: string) =>
  `hydra:web:${sublevelName ?? "default"}:${key}`;

const noopUnsubscribe = () => undefined;

const emptyList = async () => [];
const resolveUndefined = async () => undefined;

const readJson = <T>(key: string, fallback: T): T => {
  const value = window.localStorage.getItem(key);
  if (!value) return fallback;

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
};

const writeJson = (key: string, value: unknown) => {
  window.localStorage.setItem(key, JSON.stringify(value));
};

const parseStorageValue = (value: string): unknown | null => {
  try {
    return JSON.parse(value);
  } catch (error) {
    console.warn("Ignoring malformed web storage value", error);
    return null;
  }
};

const hydraApi = {
  get: async <T = unknown>(
    url: string,
    options?: { params?: Record<string, unknown> }
  ): Promise<T> => {
    if (url === "/features") return [] as T;
    if (url === "/catalogue/featured") return getMockTrendingGames() as T;
    if (
      url === `/catalogue/${CatalogueCategory.Hot}` ||
      url === `/catalogue/${CatalogueCategory.Weekly}` ||
      url === `/catalogue/${CatalogueCategory.Achievements}`
    ) {
      const category = url.split("/").pop() as CatalogueCategory;
      return getMockCatalogueCategory(category) as T;
    }
    if (url.startsWith("/catalogue/game/")) {
      const [, , , shop, objectId] = url.split("/");
      return getMockStorefrontGame(shop, objectId) as T;
    }

    if (url === "/catalogue/search") {
      return searchMockCatalogue(
        (options?.params ?? {}) as never
      ) as T;
    }

    return null as T;
  },
  post: async <T = unknown>(
    url?: string,
    options?: { data?: Record<string, unknown> }
  ): Promise<T> => {
    if (url === "/catalogue/search") {
      return searchMockCatalogue((options?.data ?? {}) as never) as T;
    }

    return null as T;
  },
  put: async <T = unknown>(): Promise<T> => null as T,
  patch: async <T = unknown>(): Promise<T> => null as T,
  delete: async <T = unknown>(): Promise<T> => null as T,
};

const leveldb = {
  get: async (
    key: string,
    sublevelName?: string | null,
    valueEncoding?: "json" | "utf8"
  ): Promise<unknown | null> => {
    const value = window.localStorage.getItem(storageKey(sublevelName, key));
    if (!value) return null;
    return valueEncoding === "utf8" ? value : parseStorageValue(value);
  },
  put: async (
    key: string,
    value: unknown,
    sublevelName?: string | null,
    valueEncoding?: "json" | "utf8"
  ) => {
    const storageValue =
      valueEncoding === "utf8" ? String(value) : JSON.stringify(value);
    window.localStorage.setItem(storageKey(sublevelName, key), storageValue);
  },
  del: async (key: string, sublevelName?: string | null) => {
    window.localStorage.removeItem(storageKey(sublevelName, key));
  },
  clear: async (sublevelName: string) => {
    const prefix = storageKey(sublevelName, "");
    Object.keys(window.localStorage)
      .filter((key) => key.startsWith(prefix))
      .forEach((key) => window.localStorage.removeItem(key));
  },
  values: async (sublevelName: string) => {
    const prefix = storageKey(sublevelName, "");
    return Object.entries(window.localStorage)
      .filter(([key]) => key.startsWith(prefix))
      .map(([, value]) => parseStorageValue(value))
      .filter((value) => value !== null);
  },
  iterator: async (sublevelName: string) => {
    const prefix = storageKey(sublevelName, "");
    return Object.entries(window.localStorage)
      .filter(([key]) => key.startsWith(prefix))
      .map(
        ([key, value]) =>
          [key.slice(prefix.length), parseStorageValue(value)] as [
            string,
            unknown,
          ]
      )
      .filter(([, value]) => value !== null);
  },
};

const openExternal = async (src: string) => {
  let url: URL;

  try {
    url = new URL(src, window.location.href);
  } catch (error) {
    console.warn("Invalid external URL", error);
    return;
  }

  if (["http:", "https:", "mailto:"].includes(url.protocol)) {
    window.open(url.toString(), "_blank", "noopener,noreferrer");
  }
};

const normalizedPlatform = navigator.platform.toLowerCase();
const browserPlatform = normalizedPlatform.includes("win")
  ? "win32"
  : normalizedPlatform.includes("mac")
    ? "darwin"
    : "linux";

const webElectron = new Proxy(
  {
    hydraApi,
    leveldb,
    platform: browserPlatform,
    getVersion: async () => "web",
    isStaging: async () => false,
    ping: () => "pong",
    getUserPreferences: async () =>
      readJson("hydra:web:userPreferences", {
        language: navigator.language || "en",
      }),
    updateUserPreferences: async (preferences: unknown) => {
      const current = readJson("hydra:web:userPreferences", {});
      writeJson("hydra:web:userPreferences", {
        ...(typeof current === "object" && current ? current : {}),
        ...(typeof preferences === "object" && preferences ? preferences : {}),
      });
    },
    getAllCustomThemes: emptyList,
    getDownloadSources: emptyList,
    getLocalNotifications: emptyList,
    scanInstalledGames: emptyList,
    getLocalNotificationsCount: async () => 0,
    getAuth: async () => null,
    getMe: async () => null,
    getSessionHash: async () => null,
    getDefaultDownloadsPath: async () => "",
    isPortableVersion: async () => false,
    canInstallCommonRedist: async () => false,
    checkHomebrewFolderExists: async () => false,
    checkForUpdates: async () => false,
    isMainWindowOpen: async () => true,
    getHydraDeckyPluginInfo: async () => ({
      installed: false,
      version: null,
      path: "",
      outdated: false,
      expectedVersion: null,
    }),
    showOpenDialog: async () => ({ canceled: true, filePaths: [] }),
    openAuthWindow: async () => {
      window.location.hash = "#/settings";
    },
    openCheckout: async () => {
      window.location.hash = "#/settings";
    },
    getRandomGame: async () => getMockRandomGame(),
    getGameStats: async (objectId: string, shop: string) =>
      getMockGameStats(shop, objectId) ?? {
        downloadCount: 0,
        playerCount: 0,
        averageScore: null,
        reviewCount: 0,
      },
    addGameToLibrary: async (shop: string, objectId: string) => {
      addMockGameToLibrary(shop, objectId);
    },
    getLibrary: async () => getMockLibrary(),
    refreshLibraryAssets: async () => undefined,
    openExternal,
    onDownloadProgress: () => noopUnsubscribe,
    onHardDelete: () => noopUnsubscribe,
    onSeedingStatus: () => noopUnsubscribe,
    onAutoUpdaterEvent: () => noopUnsubscribe,
    onSignIn: () => noopUnsubscribe,
    onAccountUpdated: () => noopUnsubscribe,
    onSignOut: () => noopUnsubscribe,
    onSyncFriendRequests: () => noopUnsubscribe,
    onSyncNotificationCount: () => noopUnsubscribe,
    onLocalNotificationCreated: () => noopUnsubscribe,
    onAchievementUnlocked: () => noopUnsubscribe,
    onCombinedAchievementsUnlocked: () => noopUnsubscribe,
    onCustomThemeUpdated: () => noopUnsubscribe,
    onNewDownloadOptions: () => noopUnsubscribe,
    onLibraryBatchComplete: () => noopUnsubscribe,
    on: resolveUndefined,
    off: resolveUndefined,
  },
  {
    get(target, property: string | symbol) {
      if (property in target) return target[property as keyof typeof target];
      return resolveUndefined;
    },
  }
) as unknown as Electron;

if (!window.electron) {
  window.electron = webElectron;
}
