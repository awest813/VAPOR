import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@renderer/components";
import { useTranslation } from "react-i18next";
import type { GameEngineProps } from "./sky-runner";

const ROUND_LENGTH = 30;
const INITIAL_SPEED = 90; // degrees per second
const SPEED_INCREMENT = 15; // degrees per second added every 5s
const HIT_ZONE_DEG = 40; // ±40° around 0° (top of ring)
const RING_SIZE = 200; // px – container size
const ORBIT_R = 84; // px – orbit radius from centre to dot centre
const DOT_SIZE = 18; // px – orbiting dot diameter
const FEEDBACK_DURATION_MS = 420; // must match the orbit-feedback-pop CSS animation

// Pre-compute the static target-zone arc path (never changes)
const ARC_PATH = (() => {
  const cx = RING_SIZE / 2;
  const cy = RING_SIZE / 2;
  const toRad = (deg: number) => ((deg - 90) * Math.PI) / 180;
  const x1 = cx + ORBIT_R * Math.cos(toRad(-HIT_ZONE_DEG));
  const y1 = cy + ORBIT_R * Math.sin(toRad(-HIT_ZONE_DEG));
  const x2 = cx + ORBIT_R * Math.cos(toRad(HIT_ZONE_DEG));
  const y2 = cy + ORBIT_R * Math.sin(toRad(HIT_ZONE_DEG));
  return `M ${x1} ${y1} A ${ORBIT_R} ${ORBIT_R} 0 0 1 ${x2} ${y2}`;
})();

export function OrbitClicker({
  accent,
  shortDescription,
  bestScore,
  onBestScoreUpdate,
}: GameEngineProps) {
  const { t } = useTranslation(["game_details", "hydra_cloud"]);

  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(ROUND_LENGTH);
  const [isRunning, setIsRunning] = useState(false);
  const [feedback, setFeedback] = useState<"hit" | "miss" | null>(null);
  // key trick: incrementing this remounts the feedback span to re-trigger CSS animation
  const [feedbackKey, setFeedbackKey] = useState(0);

  const angleRef = useRef(0);
  const speedRef = useRef(INITIAL_SPEED);
  const lastTsRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const isRunningRef = useRef(false);
  const dotRef = useRef<HTMLDivElement>(null);
  // keep a stable ref to the latest score so the click handler always reads fresh
  const scoreRef = useRef(0);

  const updateDot = useCallback((angle: number) => {
    if (!dotRef.current) return;
    const rad = ((angle - 90) * Math.PI) / 180;
    const x = RING_SIZE / 2 + ORBIT_R * Math.cos(rad) - DOT_SIZE / 2;
    const y = RING_SIZE / 2 + ORBIT_R * Math.sin(rad) - DOT_SIZE / 2;
    dotRef.current.style.left = `${x}px`;
    dotRef.current.style.top = `${y}px`;
  }, []);

  const animate = useCallback(
    (ts: number) => {
      if (!isRunningRef.current) return;
      if (lastTsRef.current !== null) {
        const dt = (ts - lastTsRef.current) / 1000;
        angleRef.current = (angleRef.current + speedRef.current * dt) % 360;
      }
      lastTsRef.current = ts;
      updateDot(angleRef.current);
      rafRef.current = requestAnimationFrame(animate);
    },
    [updateDot]
  );

  // Start / stop animation when isRunning changes
  useEffect(() => {
    if (isRunning) {
      isRunningRef.current = true;
      lastTsRef.current = null;
      rafRef.current = requestAnimationFrame(animate);
    } else {
      isRunningRef.current = false;
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    }
    return () => {
      isRunningRef.current = false;
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [isRunning, animate]);

  // 1-second countdown timer
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

  // Speed ramps up every 5 seconds
  useEffect(() => {
    if (!isRunning) return;
    const id = window.setInterval(() => {
      speedRef.current += SPEED_INCREMENT;
    }, 5000);
    return () => window.clearInterval(id);
  }, [isRunning]);

  const startRound = () => {
    angleRef.current = 0;
    speedRef.current = INITIAL_SPEED;
    scoreRef.current = 0;
    updateDot(0);
    setScore(0);
    setTimeLeft(ROUND_LENGTH);
    setFeedback(null);
    setIsRunning(true);
  };

  const handleClick = () => {
    if (!isRunning) return;
    const a = ((angleRef.current % 360) + 360) % 360;
    // distance from 0° (top), accounting for wrap-around
    const dist = Math.min(a, 360 - a);
    if (dist <= HIT_ZONE_DEG) {
      const next = scoreRef.current + 1;
      scoreRef.current = next;
      setScore(next);
      onBestScoreUpdate(next);
      setFeedback("hit");
    } else {
      setFeedback("miss");
    }
    setFeedbackKey((k) => k + 1);
    window.setTimeout(() => setFeedback(null), FEEDBACK_DURATION_MS);
  };

  const showNewBest = isRunning && score > 0 && score >= bestScore;

  return (
    <div
      className="orbit-game"
      onClick={handleClick}
      role="presentation"
    >
      <div className="browser-game__hud">
        <span>Score</span>
        <strong>
          {score}
          {showNewBest ? " ★" : ""}
        </strong>
        <span>{timeLeft}s</span>
      </div>

      <div className="orbit-game__arena">
        <div
          className="orbit-game__ring"
          style={{ width: RING_SIZE, height: RING_SIZE }}
        >
          {/* SVG: orbit track + highlighted target zone */}
          <svg
            width={RING_SIZE}
            height={RING_SIZE}
            className="orbit-game__ring-svg"
            aria-hidden="true"
          >
            <circle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={ORBIT_R}
              fill="none"
              stroke="rgba(255,255,255,0.12)"
              strokeWidth="4"
            />
            <path
              d={ARC_PATH}
              fill="none"
              stroke={accent}
              strokeWidth="7"
              strokeLinecap="round"
              opacity="0.8"
            />
          </svg>

          {/* Orbiting dot – positioned via direct DOM writes for smooth 60fps */}
          <div
            ref={dotRef}
            className="orbit-game__dot"
            style={{ backgroundColor: accent }}
          />

          {/* Hit / miss flash */}
          {feedback && (
            <div
              key={feedbackKey}
              className={`orbit-game__feedback orbit-game__feedback--${feedback}`}
            >
              {feedback === "hit" ? "✓" : "✗"}
            </div>
          )}
        </div>

        <p className="orbit-game__hint">
          {isRunning ? "Click anywhere to tap!" : ""}
        </p>
      </div>

      {!isRunning && (
        <div
          className="browser-game__overlay"
          role="presentation"
          onClick={(e) => e.stopPropagation()}
        >
          {timeLeft === 0 && score > 0 ? (
            <>
              <h3>Round over!</h3>
              <p>
                {score >= bestScore
                  ? `New best: ${score}!`
                  : `Score: ${score} — Best: ${bestScore}`}
              </p>
            </>
          ) : (
            <>
              <h3>{shortDescription ?? "Orbit Clicker"}</h3>
              <p>{t("hydra_cloud:free_tier_benefit")}</p>
            </>
          )}
          <Button onClick={startRound}>{t("game_details:play")}</Button>
        </div>
      )}
    </div>
  );
}
