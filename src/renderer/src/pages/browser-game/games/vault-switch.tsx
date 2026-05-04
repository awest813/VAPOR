import { useEffect, useMemo, useState } from "react";
import { Button } from "@renderer/components";
import { useTranslation } from "react-i18next";
import type { GameEngineProps } from "./sky-runner";

const SYMBOLS = ["♠", "♥", "♦", "♣", "★", "▲"] as const;
const TOTAL_PAIRS = SYMBOLS.length; // 6

interface Card {
  id: number;
  symbol: string;
}

function createShuffledDeck(): Card[] {
  const deck: Card[] = SYMBOLS.flatMap((symbol, i) => [
    { id: i * 2, symbol },
    { id: i * 2 + 1, symbol },
  ]);
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

export function VaultSwitch({
  shortDescription,
  bestScore,
  onBestScoreUpdate,
}: GameEngineProps) {
  const { t } = useTranslation(["game_details", "hydra_cloud"]);
  const [cards, setCards] = useState<Card[]>(() => createShuffledDeck());
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<Set<number>>(new Set());
  const [isLocked, setIsLocked] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [finalScore, setFinalScore] = useState<number | null>(null);

  const matchedPairs = matched.size / 2;
  // O(1) symbol look-up by card ID, rebuilt only when cards change
  const cardMap = useMemo(
    () => new Map(cards.map((c) => [c.id, c])),
    [cards]
  );

  useEffect(() => {
    if (!isRunning) return;
    const id = window.setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);
    return () => window.clearInterval(id);
  }, [isRunning]);

  const startRound = () => {
    setCards(createShuffledDeck());
    setFlipped([]);
    setMatched(new Set());
    setIsLocked(false);
    setElapsed(0);
    setFinalScore(null);
    setIsRunning(true);
  };

  const handleCardClick = (cardId: number) => {
    if (
      !isRunning ||
      isLocked ||
      matched.has(cardId) ||
      flipped.includes(cardId)
    )
      return;
    if (flipped.length >= 2) return;

    const newFlipped = [...flipped, cardId];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      const [aId, bId] = newFlipped as [number, number];
      const aSymbol = cardMap.get(aId)!.symbol;
      const bSymbol = cardMap.get(bId)!.symbol;

      if (aSymbol === bSymbol) {
        const newMatched = new Set([...matched, aId, bId]);
        setMatched(newMatched);
        setFlipped([]);

        if (newMatched.size / 2 === TOTAL_PAIRS) {
          setIsRunning(false);
          // Score: faster clear = higher score. Cap at a minimum of 10.
          setElapsed((currentElapsed) => {
            const score = Math.max(200 - currentElapsed * 2, 10);
            setFinalScore(score);
            onBestScoreUpdate(score);
            return currentElapsed;
          });
        }
      } else {
        setIsLocked(true);
        window.setTimeout(() => {
          setFlipped([]);
          setIsLocked(false);
        }, 800);
      }
    }
  };

  return (
    <div className="vault-game">
      <div className="browser-game__hud">
        <span>Pairs</span>
        <strong>
          {matchedPairs} / {TOTAL_PAIRS}
        </strong>
        <span>{elapsed}s</span>
      </div>

      <div className="vault-game__grid">
        {cards.map((card) => {
          const isVisible = flipped.includes(card.id) || matched.has(card.id);
          const isMatch = matched.has(card.id);
          return (
            <button
              key={card.id}
              type="button"
              className={[
                "vault-game__card",
                isVisible ? "vault-game__card--revealed" : "",
                isMatch ? "vault-game__card--matched" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() => handleCardClick(card.id)}
              disabled={!isRunning || isLocked || isMatch}
              aria-label={isVisible ? card.symbol : "Face-down card"}
            >
              {isVisible ? card.symbol : null}
            </button>
          );
        })}
      </div>

      {!isRunning && (
        <div className="browser-game__overlay">
          {finalScore !== null ? (
            <>
              <h3>Board cleared in {elapsed}s!</h3>
              <p>
                {finalScore >= bestScore
                  ? `New best: ${finalScore}!`
                  : `Score: ${finalScore} — Best: ${bestScore}`}
              </p>
            </>
          ) : (
            <>
              <h3>{shortDescription ?? "Vault Switch"}</h3>
              <p>{t("hydra_cloud:free_tier_benefit")}</p>
            </>
          )}
          <Button onClick={startRound}>{t("game_details:play")}</Button>
        </div>
      )}
    </div>
  );
}
