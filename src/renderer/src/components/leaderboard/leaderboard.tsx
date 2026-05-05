import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import "./leaderboard.scss";

export interface LeaderboardEntry {
  rank: number;
  /** Display name – truncated for privacy */
  player: string;
  score: number;
  isCurrentUser?: boolean;
}

export interface LeaderboardProps {
  gameId: string;
  /** The local user's current best score; injected into the mock table */
  localBest?: number;
}

/** Deterministic mock scores seeded from gameId */
const mockEntries = (gameId: string, localBest = 0): LeaderboardEntry[] => {
  // Simple deterministic hash to vary scores per game
  const seed = Array.from(gameId).reduce(
    (acc, ch) => (acc * 31 + ch.charCodeAt(0)) >>> 0,
    0
  );

  const names = [
    "AceViper", "PixelHawk", "NeonByte", "GridRunner", "StarShard",
    "VoltRacer", "IronPulse", "SkyWarden", "NovaKing", "ZephyrX",
  ];

  const entries: LeaderboardEntry[] = names.map((name, i) => ({
    rank: i + 1,
    player: name,
    // Vary score using seed + rank position
    score: Math.max(1, Math.round(((seed >> (i % 8)) & 0xff) * 3 + (10 - i) * 40)),
    isCurrentUser: false,
  }));

  // Sort descending
  entries.sort((a, b) => b.score - a.score);
  entries.forEach((e, i) => { e.rank = i + 1; });

  if (localBest > 0) {
    const existingIdx = entries.findIndex((e) => e.score <= localBest);
    const userEntry: LeaderboardEntry = {
      rank: existingIdx >= 0 ? existingIdx + 1 : entries.length + 1,
      player: "You",
      score: localBest,
      isCurrentUser: true,
    };

    // Insert user into the list, bump others down
    if (existingIdx >= 0) {
      entries.splice(existingIdx, 0, userEntry);
    } else {
      entries.push(userEntry);
    }

    // Recalculate ranks and trim to top 10
    entries.forEach((e, i) => { e.rank = i + 1; });
  }

  return entries.slice(0, 10);
};

export function Leaderboard({ gameId, localBest = 0 }: LeaderboardProps) {
  const { t } = useTranslation("leaderboard");

  const entries = useMemo(
    () => mockEntries(gameId, localBest),
    [gameId, localBest]
  );

  return (
    <div className="leaderboard">
      <h3 className="leaderboard__title">{t("title")}</h3>

      {entries.length === 0 ? (
        <p className="leaderboard__empty">{t("no_scores")}</p>
      ) : (
        <ol className="leaderboard__list">
          {entries.map((entry) => (
            <li
              key={`${entry.rank}-${entry.player}`}
              className={`leaderboard__row${entry.isCurrentUser ? " leaderboard__row--you" : ""}${entry.rank <= 3 ? ` leaderboard__row--top${entry.rank}` : ""}`}
            >
              <span className="leaderboard__rank">
                {entry.rank <= 3 ? ["🥇", "🥈", "🥉"][entry.rank - 1] : `#${entry.rank}`}
              </span>
              <span className="leaderboard__player">{entry.player}</span>
              <span className="leaderboard__score">
                {entry.score.toLocaleString()}
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
