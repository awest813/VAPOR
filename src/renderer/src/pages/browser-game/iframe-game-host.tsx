import { useCallback, useEffect, useRef } from "react";
import {
  isVaporMessage,
  vaporSaveKey,
  vaporScoreKey,
  type VaporInitMessage,
  type VaporLoadResultMessage,
  type VaporSaveResultMessage,
  type VaporSubmitScoreResultMessage,
  type VaporAchievementResultMessage,
} from "./vapor-sdk";

export interface IframeGameHostProps {
  /** URL of the HTML5 game to embed */
  gameUrl: string;
  /** Internal game ID used for save/score namespacing */
  gameId: string;
  /** Optional authenticated user ID (null = anonymous) */
  userId?: string | null;
  /** Called whenever the game submits a new score */
  onScoreUpdate?: (score: number) => void;
  /** Called when the game requests fullscreen */
  onRequestFullscreen?: () => void;
  className?: string;
}

export function IframeGameHost({
  gameUrl,
  gameId,
  userId = null,
  onScoreUpdate,
  onRequestFullscreen,
  className,
}: IframeGameHostProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  /** Post a message to the hosted game */
  const postToGame = useCallback((message: object) => {
    iframeRef.current?.contentWindow?.postMessage(message, "*");
  }, []);

  /** Handle messages sent by the game via postMessage */
  const handleMessage = useCallback(
    (event: MessageEvent) => {
      if (!isVaporMessage(event)) return;

      // Only accept messages from our own iframe
      if (iframeRef.current && event.source !== iframeRef.current.contentWindow) {
        return;
      }

      const msg = event.data;

      switch (msg.type) {
        case "vapor:ready": {
          const initMsg: VaporInitMessage = {
            type: "vapor:init",
            gameId,
            userId,
          };
          postToGame(initMsg);
          break;
        }

        case "vapor:save": {
          try {
            const key = vaporSaveKey(gameId, userId);
            localStorage.setItem(key, JSON.stringify(msg.data));
            const result: VaporSaveResultMessage = {
              type: "vapor:saveResult",
              requestId: msg.requestId,
              ok: true,
            };
            postToGame(result);
          } catch {
            const result: VaporSaveResultMessage = {
              type: "vapor:saveResult",
              requestId: msg.requestId,
              ok: false,
            };
            postToGame(result);
          }
          break;
        }

        case "vapor:load": {
          try {
            const key = vaporSaveKey(gameId, userId);
            const raw = localStorage.getItem(key);
            const data = raw ? JSON.parse(raw) : null;
            const result: VaporLoadResultMessage = {
              type: "vapor:loadResult",
              requestId: msg.requestId,
              ok: true,
              data,
            };
            postToGame(result);
          } catch {
            const result: VaporLoadResultMessage = {
              type: "vapor:loadResult",
              requestId: msg.requestId,
              ok: false,
              data: null,
            };
            postToGame(result);
          }
          break;
        }

        case "vapor:submitScore": {
          const scoreKey = vaporScoreKey(gameId, userId);
          const prevRaw = localStorage.getItem(scoreKey);
          const prev = prevRaw ? Number(prevRaw) : 0;
          const next = msg.score;

          if (next > prev) {
            localStorage.setItem(scoreKey, String(next));
          }

          onScoreUpdate?.(next);

          const result: VaporSubmitScoreResultMessage = {
            type: "vapor:submitScoreResult",
            requestId: msg.requestId,
            ok: true,
          };
          postToGame(result);
          break;
        }

        case "vapor:achievement": {
          // Achievement unlock — acknowledge immediately; real persistence
          // would go through the backend API.
          const result: VaporAchievementResultMessage = {
            type: "vapor:achievementResult",
            requestId: msg.requestId,
            ok: true,
          };
          postToGame(result);
          break;
        }

        case "vapor:requestFullscreen": {
          onRequestFullscreen?.();
          break;
        }

        default:
          break;
      }
    },
    [gameId, userId, postToGame, onScoreUpdate, onRequestFullscreen]
  );

  useEffect(() => {
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [handleMessage]);

  return (
    <iframe
      ref={iframeRef}
      src={gameUrl}
      title="Game"
      className={className}
      /**
       * Sandbox policy:
       *  allow-scripts        – game JS must run
       *  allow-same-origin    – needed for localStorage access within the game
       *  allow-forms          – some games use form submissions
       *  allow-pointer-lock   – FPS / mouse-captured games
       *  allow-popups         – some games open links/scoreboards
       *
       * Intentionally excluded:
       *  allow-top-navigation – prevent redirecting the top frame
       *  allow-modals         – prevent alert/confirm dialogs hijacking the UI
       */
      sandbox="allow-scripts allow-same-origin allow-forms allow-pointer-lock allow-popups"
      allow="fullscreen; autoplay"
      loading="lazy"
    />
  );
}
