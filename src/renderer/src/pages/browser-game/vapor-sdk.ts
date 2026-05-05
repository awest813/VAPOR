/**
 * VAPOR Game SDK – postMessage protocol
 *
 * Games hosted inside a sandboxed <iframe> communicate with the VAPOR platform
 * by posting messages to `window.parent`.  The platform listens for these
 * messages and responds with result messages posted back to the iframe's
 * `contentWindow`.
 *
 * Message envelope
 * ─────────────────
 * Every message (both directions) is a serialisable plain object with at
 * minimum a `type` discriminant.  Requests from the game carry a `requestId`
 * (string) so the platform can correlate async responses.
 *
 * ┌────────────────────────────────────────────────────────────────────────┐
 * │  Game → Platform (posted to window.parent)                             │
 * └────────────────────────────────────────────────────────────────────────┘
 *
 *  vapor:ready          – game has loaded and is ready to receive the SDK
 *  vapor:save           – persist save data  { requestId, data: unknown }
 *  vapor:load           – load save data     { requestId }
 *  vapor:submitScore    – record a score      { requestId, score: number }
 *  vapor:achievement    – unlock achievement  { requestId, id: string }
 *  vapor:requestFullscreen – ask for fullscreen
 *
 * ┌────────────────────────────────────────────────────────────────────────┐
 * │  Platform → Game (posted to iframe.contentWindow)                      │
 * └────────────────────────────────────────────────────────────────────────┘
 *
 *  vapor:init           – injected after the game posts vapor:ready
 *                         { gameId: string, userId: string | null }
 *  vapor:saveResult     – { requestId, ok: boolean }
 *  vapor:loadResult     – { requestId, ok: boolean, data: unknown }
 *  vapor:submitScoreResult  – { requestId, ok: boolean, rank?: number }
 *  vapor:achievementResult  – { requestId, ok: boolean }
 */

export type VaporMessageType =
  // Game → Platform
  | "vapor:ready"
  | "vapor:save"
  | "vapor:load"
  | "vapor:submitScore"
  | "vapor:achievement"
  | "vapor:requestFullscreen"
  // Platform → Game
  | "vapor:init"
  | "vapor:saveResult"
  | "vapor:loadResult"
  | "vapor:submitScoreResult"
  | "vapor:achievementResult";

export interface VaporMessage {
  type: VaporMessageType;
  requestId?: string;
}

// ── Game → Platform ───────────────────────────────────────────────────────────

export interface VaporReadyMessage extends VaporMessage {
  type: "vapor:ready";
}

export interface VaporSaveMessage extends VaporMessage {
  type: "vapor:save";
  requestId: string;
  data: unknown;
}

export interface VaporLoadMessage extends VaporMessage {
  type: "vapor:load";
  requestId: string;
}

export interface VaporSubmitScoreMessage extends VaporMessage {
  type: "vapor:submitScore";
  requestId: string;
  score: number;
}

export interface VaporAchievementMessage extends VaporMessage {
  type: "vapor:achievement";
  requestId: string;
  id: string;
}

export interface VaporRequestFullscreenMessage extends VaporMessage {
  type: "vapor:requestFullscreen";
}

// ── Platform → Game ───────────────────────────────────────────────────────────

export interface VaporInitMessage extends VaporMessage {
  type: "vapor:init";
  gameId: string;
  userId: string | null;
}

export interface VaporSaveResultMessage extends VaporMessage {
  type: "vapor:saveResult";
  requestId: string;
  ok: boolean;
}

export interface VaporLoadResultMessage extends VaporMessage {
  type: "vapor:loadResult";
  requestId: string;
  ok: boolean;
  data: unknown;
}

export interface VaporSubmitScoreResultMessage extends VaporMessage {
  type: "vapor:submitScoreResult";
  requestId: string;
  ok: boolean;
  rank?: number;
}

export interface VaporAchievementResultMessage extends VaporMessage {
  type: "vapor:achievementResult";
  requestId: string;
  ok: boolean;
}

export type AnyVaporMessage =
  | VaporReadyMessage
  | VaporSaveMessage
  | VaporLoadMessage
  | VaporSubmitScoreMessage
  | VaporAchievementMessage
  | VaporRequestFullscreenMessage
  | VaporInitMessage
  | VaporSaveResultMessage
  | VaporLoadResultMessage
  | VaporSubmitScoreResultMessage
  | VaporAchievementResultMessage;

/** Type-guard: check whether an unknown MessageEvent carries a Vapor message */
export const isVaporMessage = (event: MessageEvent): event is MessageEvent<AnyVaporMessage> =>
  typeof event.data === "object" &&
  event.data !== null &&
  typeof (event.data as VaporMessage).type === "string" &&
  (event.data as VaporMessage).type.startsWith("vapor:");

/** Build a localStorage key for a game's save data */
export const vaporSaveKey = (gameId: string, userId?: string | null) =>
  `vapor:save:${gameId}${userId ? `:${userId}` : ":anon"}`;

/** Build a localStorage key for a game's best score */
export const vaporScoreKey = (gameId: string, userId?: string | null) =>
  `vapor:score:${gameId}${userId ? `:${userId}` : ":anon"}`;
