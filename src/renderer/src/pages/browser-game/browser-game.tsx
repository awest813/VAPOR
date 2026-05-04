import { Button } from "@renderer/components";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getMockStorefrontGame } from "@renderer/storefront/mock-store";
import "./browser-game.scss";

const ROUND_LENGTH_IN_SECONDS = 30;

const saveKey = (gameId: string) => `hydra:web:browser-game:${gameId}:save`;

const randomPosition = () => ({
  x: Math.floor(Math.random() * 72) + 4,
  y: Math.floor(Math.random() * 68) + 6,
});

export default function BrowserGame() {
  const { shop, objectId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useTranslation([
    "game_details",
    "hydra_cloud",
    "home",
    "sidebar",
  ]);

  const game = useMemo(
    () => (shop && objectId ? getMockStorefrontGame(shop, objectId) : null),
    [objectId, shop]
  );

  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(ROUND_LENGTH_IN_SECONDS);
  const [isRunning, setIsRunning] = useState(false);
  const [targetPosition, setTargetPosition] = useState(randomPosition);
  const [bestScore, setBestScore] = useState(() => {
    if (!game) return 0;

    const savedValue = window.localStorage.getItem(saveKey(game.id));
    return savedValue ? Number(savedValue) || 0 : 0;
  });

  useEffect(() => {
    if (!game) return;

    const savedValue = window.localStorage.getItem(saveKey(game.id));
    setBestScore(savedValue ? Number(savedValue) || 0 : 0);
  }, [game]);

  useEffect(() => {
    if (!isRunning || timeLeft === 0) return;

    const timeout = window.setTimeout(() => {
      setTimeLeft((current) => {
        const nextTime = Math.max(current - 1, 0);
        if (nextTime === 0) {
          setIsRunning(false);
        }

        return nextTime;
      });
    }, 1000);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [isRunning, timeLeft]);

  if (!game) {
    return (
      <section className="browser-game">
        <div className="browser-game__empty">
          <h1>{searchParams.get("title") ?? t("game_details:game_details")}</h1>
          <p>{t("game_details:no_shop_details")}</p>
          <Button onClick={() => navigate("/catalogue")}>{t("sidebar:catalogue")}</Button>
        </div>
      </section>
    );
  }

  const persistBestScore = (nextScore: number) => {
    setBestScore(nextScore);
    window.localStorage.setItem(saveKey(game.id), String(nextScore));
  };

  const startRound = () => {
    const nextPosition = randomPosition();
    setScore(0);
    setTimeLeft(ROUND_LENGTH_IN_SECONDS);
    setTargetPosition(nextPosition);
    setIsRunning(true);
  };

  const handleTargetClick = () => {
    if (!isRunning) return;

    const nextScore = score + 1;
    setScore(nextScore);
    setTargetPosition(randomPosition());

    if (nextScore > bestScore) {
      persistBestScore(nextScore);
    }
  };

  const clearLocalSave = () => {
    window.localStorage.removeItem(saveKey(game.id));
    setBestScore(0);
  };

  return (
    <section className="browser-game">
      <div className="browser-game__hero">
        <div className="browser-game__copy">
          <span className="browser-game__eyebrow">{t("home:hot")}</span>
          <h1>{game.title}</h1>
          <p>{game.description}</p>

          <div className="browser-game__actions">
            <Button onClick={startRound}>
              {isRunning ? t("game_details:playing_now") : t("game_details:play")}
            </Button>
            <Button theme="outline" onClick={() => window.electron.openCheckout()}>
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
        <div className="browser-game__surface">
          <div className="browser-game__hud">
            <span>{t("game_details:play")}</span>
            <strong>{score}</strong>
            <span>{timeLeft}s</span>
          </div>

          <button
            type="button"
            className="browser-game__target"
            style={{
              left: `${targetPosition.x}%`,
              top: `${targetPosition.y}%`,
              borderColor: game.accent,
            }}
            onClick={handleTargetClick}
            disabled={!isRunning}
            aria-label={game.shortDescription ?? game.title}
          >
            <span style={{ backgroundColor: game.accent }} />
          </button>

          {!isRunning && (
            <div className="browser-game__overlay">
              <h3>{game.shortDescription}</h3>
              <p>{t("hydra_cloud:free_tier_benefit")}</p>
              <Button onClick={startRound}>{t("game_details:play")}</Button>
            </div>
          )}
        </div>

        <aside className="browser-game__sidebar">
          <div className="browser-game__stat">
            <span>{t("game_details:cloud_save")}</span>
            <strong>{t("hydra_cloud:local_save_status")}</strong>
          </div>
          <div className="browser-game__stat">
            <span>{t("hydra_cloud:best_local_score")}</span>
            <strong>{bestScore}</strong>
          </div>
          <div className="browser-game__stat">
            <span>{t("hydra_cloud:save_tier_label")}</span>
            <strong>{game.cloudSaveTierLabel}</strong>
          </div>

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
