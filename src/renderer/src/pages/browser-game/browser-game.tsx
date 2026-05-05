import { Button } from "@renderer/components";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getMockStorefrontGame } from "@renderer/storefront/mock-store";
import { SkyRunner } from "./games/sky-runner";
import { VaultSwitch } from "./games/vault-switch";
import { OrbitClicker } from "./games/orbit-clicker";
import { PulseCascade } from "./games/pulse-cascade";
import { IframeGameHost } from "./iframe-game-host";
import { Leaderboard } from "@renderer/components";
import "./browser-game.scss";

const saveKey = (gameId: string) => `hydra:web:browser-game:${gameId}:save`;

export default function BrowserGame() {
  const { shop, objectId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const surfaceRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation([
    "game_details",
    "hydra_cloud",
    "home",
    "sidebar",
  ]);

  const [isFullscreen, setIsFullscreen] = useState(false);

  const game = useMemo(
    () => (shop && objectId ? getMockStorefrontGame(shop, objectId) : null),
    [objectId, shop]
  );

  const [bestScore, setBestScore] = useState(() => {
    if (!game) return 0;
    const saved = window.localStorage.getItem(saveKey(game.id));
    return saved ? Number(saved) || 0 : 0;
  });

  // Refresh best score whenever the active game changes
  useEffect(() => {
    if (!game) return;
    const saved = window.localStorage.getItem(saveKey(game.id));
    setBestScore(saved ? Number(saved) || 0 : 0);
  }, [game]);

  const handleBestScoreUpdate = useCallback(
    (score: number) => {
      if (!game) return;
      setBestScore((prev) => {
        if (score > prev) {
          window.localStorage.setItem(saveKey(game.id), String(score));
          return score;
        }
        return prev;
      });
    },
    [game]
  );

  const clearLocalSave = useCallback(() => {
    if (!game) return;
    window.localStorage.removeItem(saveKey(game.id));
    setBestScore(0);
  }, [game]);

  const toggleFullscreen = useCallback(async () => {
    if (!surfaceRef.current) return;
    if (!document.fullscreenElement) {
      await surfaceRef.current.requestFullscreen().catch(() => {});
    } else {
      await document.exitFullscreen().catch(() => {});
    }
  }, []);

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  if (!game) {
    return (
      <section className="browser-game">
        <div className="browser-game__empty">
          <h1>{searchParams.get("title") ?? t("game_details:game_details")}</h1>
          <p>{t("game_details:no_shop_details")}</p>
          <Button onClick={() => navigate("/catalogue")}>
            {t("sidebar:catalogue")}
          </Button>
        </div>
      </section>
    );
  }

  const gameEngineProps = {
    accent: game.accent,
    shortDescription: game.shortDescription,
    bestScore,
    onBestScoreUpdate: handleBestScoreUpdate,
  };

  const renderGameEngine = () => {
    // External iframe-hosted game
    if (game.gameUrl) {
      return (
        <IframeGameHost
          gameUrl={game.gameUrl}
          gameId={game.id}
          onScoreUpdate={handleBestScoreUpdate}
          onRequestFullscreen={toggleFullscreen}
          className="browser-game__iframe"
        />
      );
    }

    if (game.id === "browser-vault-switch") {
      return <VaultSwitch {...gameEngineProps} />;
    }
    if (game.id === "browser-orbit-clicker") {
      return <OrbitClicker {...gameEngineProps} />;
    }
    if (game.id === "browser-pulse-cascade") {
      return <PulseCascade {...gameEngineProps} />;
    }
    return <SkyRunner {...gameEngineProps} />;
  };

  return (
    <section className="browser-game">
      <div className="browser-game__hero">
        <div className="browser-game__copy">
          <span className="browser-game__eyebrow">
            {game.genreLabels.join(" · ")}
          </span>
          <h1>{game.title}</h1>
          <p>{game.description}</p>

          <div className="browser-game__actions">
            <Button
              theme="outline"
              onClick={() => window.electron.openCheckout()}
            >
              {game.cloudSaveTierLabel}
            </Button>
          </div>
        </div>

        <div className="browser-game__plan">
          <h2>{t("hydra_cloud:hydra_cloud")}</h2>
          <p>{t("hydra_cloud:store_save_plan_description")}</p>
          <ul>
            <li>{t("hydra_cloud:free_tier_benefit")}</li>
            <li>{t("hydra_cloud:paid_tier_benefit")}</li>
            <li>{t("hydra_cloud:backup_history_benefit")}</li>
          </ul>
        </div>
      </div>

      <div className="browser-game__layout">
        <div
          ref={surfaceRef}
          className={`browser-game__surface${isFullscreen ? " browser-game__surface--fullscreen" : ""}`}
        >
          {renderGameEngine()}

          <button
            type="button"
            className="browser-game__fullscreen-btn"
            onClick={toggleFullscreen}
            title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          >
            {isFullscreen ? "⛉" : "⛶"}
          </button>
        </div>

        <aside className="browser-game__sidebar">
          <div className="browser-game__stat">
            <span>{t("game_details:cloud_save")}</span>
            <strong>{t("hydra_cloud:local_save_status")}</strong>
          </div>
          <div className="browser-game__stat">
            <span>{t("hydra_cloud:best_local_score")}</span>
            <strong>{bestScore || "—"}</strong>
          </div>
          <div className="browser-game__stat">
            <span>{t("hydra_cloud:save_tier_label")}</span>
            <strong>{game.cloudSaveTierLabel}</strong>
          </div>

          <Leaderboard gameId={game.id} localBest={bestScore} />

          <div className="browser-game__sidebar-actions">
            <Button theme="outline" onClick={clearLocalSave}>
              {t("hydra_cloud:clear_local_save")}
            </Button>
            <Button theme="outline" onClick={() => navigate("/catalogue")}>
              {t("sidebar:catalogue")}
            </Button>
          </div>
        </aside>
      </div>
    </section>
  );
}
