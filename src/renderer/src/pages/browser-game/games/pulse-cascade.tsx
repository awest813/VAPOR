import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@renderer/components";
import { useTranslation } from "react-i18next";
import type { GameEngineProps } from "./sky-runner";

const PADS = [
  { id: 0, color: "#22d3ee", label: "Cyan" },
  { id: 1, color: "#f97316", label: "Amber" },
  { id: 2, color: "#a855f7", label: "Violet" },
  { id: 3, color: "#1fbf75", label: "Jade" },
] as const;

const PLAYBACK_FLASH_MS = 420;
const PLAYBACK_GAP_MS = 180;
const PLAYBACK_INITIAL_DELAY_MS = 600;
const INPUT_FLASH_MS = 220;

type Phase = "idle" | "playback" | "input" | "gameover";

export function PulseCascade({
  shortDescription,
  bestScore,
  onBestScoreUpdate,
}: GameEngineProps) {
  const { t } = useTranslation(["game_details", "hydra_cloud"]);
  const [sequence, setSequence] = useState<number[]>([]);
  const [inputIndex, setInputIndex] = useState(0);
  const [activePad, setActivePad] = useState<number | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");

  // Track all scheduled timers so we can cancel them on unmount or restart.
  const timersRef = useRef<number[]>([]);
  const clearTimers = useCallback(() => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
  }, []);
  const scheduleTimer = useCallback((cb: () => void, delay: number) => {
    const id = window.setTimeout(() => {
      timersRef.current = timersRef.current.filter((t) => t !== id);
      cb();
    }, delay);
    timersRef.current.push(id);
    return id;
  }, []);

  useEffect(() => clearTimers, [clearTimers]);

  // Play back the current sequence, then hand control to the player.
  useEffect(() => {
    if (phase !== "playback" || sequence.length === 0) return;

    let cancelled = false;
    const stepDuration = PLAYBACK_FLASH_MS + PLAYBACK_GAP_MS;

    sequence.forEach((padId, i) => {
      scheduleTimer(() => {
        if (cancelled) return;
        setActivePad(padId);
        scheduleTimer(() => {
          if (cancelled) return;
          setActivePad(null);
        }, PLAYBACK_FLASH_MS);
      }, PLAYBACK_INITIAL_DELAY_MS + i * stepDuration);
    });

    scheduleTimer(
      () => {
        if (cancelled) return;
        setInputIndex(0);
        setPhase("input");
      },
      PLAYBACK_INITIAL_DELAY_MS + sequence.length * stepDuration
    );

    return () => {
      cancelled = true;
    };
  }, [phase, sequence, scheduleTimer]);

  const startRound = () => {
    clearTimers();
    const first = Math.floor(Math.random() * PADS.length);
    setSequence([first]);
    setInputIndex(0);
    setActivePad(null);
    setPhase("playback");
  };

  const handlePadClick = (padId: number) => {
    if (phase !== "input") return;

    const expected = sequence[inputIndex];
    if (padId !== expected) {
      clearTimers();
      // Score = number of fully completed sequences, not the current attempt.
      const completed = sequence.length - 1;
      setActivePad(null);
      setPhase("gameover");
      if (completed > 0) onBestScoreUpdate(completed);
      return;
    }

    setActivePad(padId);
    scheduleTimer(() => setActivePad(null), INPUT_FLASH_MS);

    const nextIndex = inputIndex + 1;
    if (nextIndex < sequence.length) {
      setInputIndex(nextIndex);
      return;
    }

    // Sequence completed: bank the score and extend it.
    const completed = sequence.length;
    onBestScoreUpdate(completed);
    scheduleTimer(() => {
      const nextPad = Math.floor(Math.random() * PADS.length);
      setSequence((prev) => [...prev, nextPad]);
      setInputIndex(0);
      setPhase("playback");
    }, PLAYBACK_GAP_MS + INPUT_FLASH_MS);
  };

  const lastCompleted = phase === "gameover" ? sequence.length - 1 : 0;
  const showOverlay = phase === "idle" || phase === "gameover";
  const padsDisabled = phase !== "input";

  return (
    <div className="pulse-game">
      <div className="browser-game__hud">
        <span>Round</span>
        <strong>{sequence.length || "—"}</strong>
        <span>
          {phase === "playback"
            ? "Watch"
            : phase === "input"
              ? `${inputIndex} / ${sequence.length}`
              : "Ready"}
        </span>
      </div>

      <div className="pulse-game__board" aria-label="Pulse Cascade pads">
        {PADS.map((pad) => {
          const isActive = activePad === pad.id;
          return (
            <button
              key={pad.id}
              type="button"
              className={`pulse-game__pad${
                isActive ? " pulse-game__pad--active" : ""
              }`}
              style={{
                ["--pad-color" as string]: pad.color,
              }}
              onClick={() => handlePadClick(pad.id)}
              disabled={padsDisabled}
              aria-label={pad.label}
            />
          );
        })}
      </div>

      {showOverlay && (
        <div className="browser-game__overlay">
          {phase === "gameover" ? (
            <>
              <h3>Sequence broken at round {sequence.length}</h3>
              <p>
                {lastCompleted > bestScore
                  ? `New best: ${lastCompleted}!`
                  : `Cleared: ${lastCompleted} — Best: ${bestScore}`}
              </p>
            </>
          ) : (
            <>
              <h3>{shortDescription ?? "Pulse Cascade"}</h3>
              <p>{t("hydra_cloud:free_tier_benefit")}</p>
            </>
          )}
          <Button onClick={startRound}>{t("game_details:play")}</Button>
        </div>
      )}
    </div>
  );
}
