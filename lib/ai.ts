import {
  Board,
  Player,
  Turn,
  GameType,
  generateTurns,
  opponent,
  countPieces,
  allStepsForPlayer,
} from "./fanorona";

export type Difficulty = "mora" | "antonony" | "sarotra";

const DEPTH: Record<Difficulty, number> = {
  mora: 2,
  antonony: 3,
  sarotra: 4,
};

const WIN_SCORE = 100000;

function mobility(
  board: Board,
  player: Player,
  gameType: GameType,
  isVelaCapturer: boolean
): number {
  return allStepsForPlayer(board, player, gameType, isVelaCapturer).length;
}

function evaluate(
  board: Board,
  aiPlayer: Player,
  gameType: GameType,
  isVelaCapturer: boolean
): number {
  const opp = opponent(aiPlayer);
  const material = countPieces(board, aiPlayer) - countPieces(board, opp);
  const mob =
    mobility(board, aiPlayer, gameType, isVelaCapturer) -
    mobility(board, opp, gameType, !isVelaCapturer);
  return material * 100 + mob * 2;
}

function minimax(
  board: Board,
  player: Player,
  depth: number,
  alpha: number,
  beta: number,
  aiPlayer: Player,
  gameType: GameType,
  isVelaCapturer: boolean
): number {
  const turns = generateTurns(board, player, gameType, isVelaCapturer);
  if (turns.length === 0) {
    return player === aiPlayer ? -WIN_SCORE : WIN_SCORE;
  }
  if (depth <= 0) {
    return evaluate(board, aiPlayer, gameType, isVelaCapturer);
  }

  if (player === aiPlayer) {
    let best = -Infinity;
    for (const t of turns) {
      const val = minimax(
        t.board,
        opponent(player),
        depth - 1,
        alpha,
        beta,
        aiPlayer,
        gameType,
        !isVelaCapturer
      );
      if (val > best) best = val;
      if (val > alpha) alpha = val;
      if (beta <= alpha) break;
    }
    return best;
  } else {
    let best = Infinity;
    for (const t of turns) {
      const val = minimax(
        t.board,
        opponent(player),
        depth - 1,
        alpha,
        beta,
        aiPlayer,
        gameType,
        !isVelaCapturer
      );
      if (val < best) best = val;
      if (val < beta) beta = val;
      if (beta <= alpha) break;
    }
    return best;
  }
}

/** Picks (and returns) the full turn the AI will play, including every step of any capture chain. */
export function chooseAiTurn(
  board: Board,
  aiPlayer: Player,
  difficulty: Difficulty,
  /** Opening move (first move of the game): always random for variety. */
  isOpening = false,
  gameType: GameType = "riatra",
  isVelaCapturer = true
): Turn | null {
  const turns = generateTurns(board, aiPlayer, gameType, isVelaCapturer);
  if (turns.length === 0) return null;

  // First move of the game: pick randomly so the opening is not always the same.
  if (isOpening) {
    return turns[Math.floor(Math.random() * turns.length)];
  }

  const depth = DEPTH[difficulty];
  // Easy mode: mostly greedy on immediate material, with a little randomness.
  if (difficulty === "mora" && Math.random() < 0.35) {
    return turns[Math.floor(Math.random() * turns.length)];
  }

  let bestVal = -Infinity;
  let bestTurns: Turn[] = [];
  for (const t of turns) {
    const val = minimax(
      t.board,
      opponent(aiPlayer),
      depth - 1,
      -Infinity,
      Infinity,
      aiPlayer,
      gameType,
      !isVelaCapturer
    );
    if (val > bestVal) {
      bestVal = val;
      bestTurns = [t];
    } else if (val === bestVal) {
      bestTurns.push(t);
    }
  }
  return bestTurns[Math.floor(Math.random() * bestTurns.length)];
}
