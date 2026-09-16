import {
  Board,
  Player,
  Turn,
  generateTurns,
  opponent,
  countPieces,
  allStepsForPlayer,
} from "./fanorona";

export type Difficulty = "mora" | "antonony" | "sarotra";

const DEPTH: Record<Difficulty, number> = {
  mora: 1,
  antonony: 2,
  sarotra: 4,
};

const WIN_SCORE = 100000;

function mobility(board: Board, player: Player): number {
  return allStepsForPlayer(board, player).length;
}

function evaluate(board: Board, aiPlayer: Player): number {
  const opp = opponent(aiPlayer);
  const material = countPieces(board, aiPlayer) - countPieces(board, opp);
  const mob = mobility(board, aiPlayer) - mobility(board, opp);
  return material * 100 + mob * 2;
}

function minimax(
  board: Board,
  player: Player,
  depth: number,
  alpha: number,
  beta: number,
  aiPlayer: Player
): number {
  const turns = generateTurns(board, player);
  if (turns.length === 0) {
    return player === aiPlayer ? -WIN_SCORE : WIN_SCORE;
  }
  if (depth <= 0) {
    return evaluate(board, aiPlayer);
  }

  if (player === aiPlayer) {
    let best = -Infinity;
    for (const t of turns) {
      const val = minimax(t.board, opponent(player), depth - 1, alpha, beta, aiPlayer);
      if (val > best) best = val;
      if (val > alpha) alpha = val;
      if (beta <= alpha) break;
    }
    return best;
  } else {
    let best = Infinity;
    for (const t of turns) {
      const val = minimax(t.board, opponent(player), depth - 1, alpha, beta, aiPlayer);
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
  difficulty: Difficulty
): Turn | null {
  const turns = generateTurns(board, aiPlayer);
  if (turns.length === 0) return null;

  const depth = DEPTH[difficulty];
  // Easy mode: mostly greedy on immediate material, with a little randomness.
  if (difficulty === "mora" && Math.random() < 0.35) {
    return turns[Math.floor(Math.random() * turns.length)];
  }

  let bestVal = -Infinity;
  let bestTurns: Turn[] = [];
  for (const t of turns) {
    const val = minimax(t.board, opponent(aiPlayer), depth - 1, -Infinity, Infinity, aiPlayer);
    if (val > bestVal) {
      bestVal = val;
      bestTurns = [t];
    } else if (val === bestVal) {
      bestTurns.push(t);
    }
  }
  return bestTurns[Math.floor(Math.random() * bestTurns.length)];
}
