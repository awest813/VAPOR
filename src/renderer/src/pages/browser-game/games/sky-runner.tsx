import { useEffect, useState } from "react";
import { Button } from "@renderer/components";
import { useTranslation } from "react-i18next";

const ROUND_LENGTH = 30;

const randomPosition = () => ({
  x: Math.floor(Math.random() * 72) + 4,
  y: Math.floor(Math.random() * 68) + 6,
});

export interface GameEngineProps {
  accent: string;
  shortDescription?: string | null;
  bestScore: number;
  onBestScoreUpdate: (score: number) => void;
}

export function SkyRunner({
  accent,
  shortDescription,
  bestScore,
  onBestScoreUpdate,
}: GameEngineProps) {
  const { t } = useTranslation(["game_details", "hydra_cloud"]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(ROUND_LENGTH);
  const [isRunning, setIsRunning] = useState(false);
  const [targetPos, setTargetPos] = useState(randomPosition);

  useEffect(() => {
    if (!isRunning || timeLeft === 0) return;

    const id = window.setTimeout(() => {
      setTimeLeft((prev) => {
        const next = Math.max(prev - 1, 0);
        if (next === 0) setIsRunning(false);
        return next;
      });
    }, 1000);

    return () => window.clearTimeout(id);
  }, [isRunning, timeLeft]);

  const startRound = () => {
    setScore(0);
    setTimeLeft(ROUND_LENGTH);
    setTargetPos(randomPosition());
    setIsRunning(true);
  };

  const handleTargetClick = () => {
    if (!isRunning) return;
    const next = score + 1;
    setScore(next);
    setTargetPos(randomPosition());
    onBestScoreUpdate(next);
  };

  const showNewBest = isRunning && score > 0 && score >= bestScore;

  return (
    <>
      <div className="browser-game__hud">
        <span>Score</span>
        <strong>
          {score}
          {showNewBest ? " ★" : ""}
        </strong>
        <span>{timeLeft}s</span>
      </div>

      <button
        type="button"
        className="browser-game__target"
        style={{
          left: `${targetPos.x}%`,
          top: `${targetPos.y}%`,
          borderColor: accent,
        }}
        onClick={handleTargetClick}
        disabled={!isRunning}
        aria-label={shortDescription ?? "Target beacon"}
      >
        <span style={{ backgroundColor: accent }} />
      </button>

      {!isRunning && (
        <div className="browser-game__overlay">
          <h3>{shortDescription ?? "Sky Runner"}</h3>
          {timeLeft === 0 && score > 0 && (
            <p>
              {score >= bestScore
                ? `New best: ${score}!`
                : `Score: ${score} — Best: ${bestScore}`}
            </p>
          )}
          <p>{t("hydra_cloud:free_tier_benefit")}</p>
          <Button onClick={startRound}>{t("game_details:play")}</Button>
        </div>
      )}
    </>
  );
}
