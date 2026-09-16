// ---------------------------------------------------------------------------
// Fanorona game engine
//
// Board: 5 rows x 9 columns = 45 points (the classic "Fanorontelo" board).
// Points are connected horizontally, vertically, and (on even-parity points)
// diagonally. Same adjacency as the JavaFX reference (Board.buildAdjacency):
// diagonals are only present at points where (r + c) is even; both \ and /
// exist there when the neighbour is in bounds. Odd-parity points have only
// orthogonal links.
//
// Capturing works in two ways:
//   - Approach: the moving piece lands next to enemy piece(s) and the line
//     continuing in the direction of movement, beyond the landing point,
//     is captured until an empty point or the edge of the board is hit.
//   - Withdrawal: the moving piece moves away from enemy piece(s); the
//     line behind the piece's *starting* point, in the opposite direction
//     of movement, is captured the same way.
//
// A single move may only use one capture type. After a capturing move, the
// same piece may continue capturing (a "chain"), as long as it does not:
//   - revisit a point it already occupied this turn, or
//   - move in the same direction as its immediately preceding step.
// Continuing the chain is always optional. Capturing (in some direction,
// by some piece) is mandatory whenever it is available at all.
// ---------------------------------------------------------------------------

export type Player = 1 | 2; // 1 = Mainty (Black), 2 = Fotsy (White)
export type Cell = 0 | Player;
export type Board = Cell[];

export const ROWS = 5;
export const COLS = 9;
export const SIZE = ROWS * COLS;

export type Dir = readonly [number, number];

export function idx(r: number, c: number): number {
  return r * COLS + c;
}

export function rc(i: number): [number, number] {
  return [Math.floor(i / COLS), i % COLS];
}

export function inBounds(r: number, c: number): boolean {
  return r >= 0 && r < ROWS && c >= 0 && c < COLS;
}

export function opponent(p: Player): Player {
  return p === 1 ? 2 : 1;
}

/**
 * The directions a piece at (r, c) may move along.
 * Matches JavaFX Board.buildAdjacency():
 * - always orthogonal (H/V)
 * - diagonals only on points where (r + c) is even (both \ and / when in bounds)
 */
export function directions(r: number, c: number): Dir[] {
  const dirs: Dir[] = [
    [0, 1],
    [0, -1],
    [1, 0],
    [-1, 0],
  ];
  if ((r + c) % 2 === 0) {
    dirs.push([1, 1], [-1, -1], [1, -1], [-1, 1]);
  }
  return dirs.filter(([dr, dc]) => inBounds(r + dr, c + dc));
}

/** True raha misy lakana mivantana eo amin'ny teboka roa (mitovy amin'ny Board.hasEdge JavaFX). */
export function hasEdge(r1: number, c1: number, r2: number, c2: number): boolean {
  if (!inBounds(r1, c1) || !inBounds(r2, c2)) return false;
  return directions(r1, c1).some(([dr, dc]) => r1 + dr === r2 && c1 + dc === c2);
}

/**
 * Setup:
 *   andalana 0–1 : Fotsy (2) — ambony
 *   andalana 2   : M F M F _ M F M F
 *   andalana 3–4 : Mainty (1) — ambany
 */
export function initialBoard(): Board {
  const b: Board = new Array(SIZE).fill(0);
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const i = idx(r, c);
      if (r <= 1) {
        b[i] = 2; // Fotsy (White) — andalana ambony
      } else if (r >= 3) {
        b[i] = 1; // Mainty (Black) — andalana ambany
      } else if (c === 4) {
        b[i] = 0; // foibe foana
      } else if (c < 4) {
        // M F M F
        b[i] = c % 2 === 0 ? 1 : 2;
      } else {
        // M F M F  (c 5,6,7,8 → M F M F)
        b[i] = c % 2 === 1 ? 1 : 2;
      }
    }
  }
  return b;
}

export interface Step {
  from: number;
  to: number;
  dir: Dir;
  captured: number[];
  captureType: "move" | "approach" | "withdrawal";
}

export interface Turn {
  player: Player;
  steps: Step[];
  board: Board;
}

/**
 * Beam capture — mitovy amin'ny FanoronaEngine.beam (JavaFX):
 * Manomboka amin'ny (startR, startC), mandeha amin'ny (dr, dc), manangona
 * vato mpanohitra mitohy. Mijanona raha: tsy inBounds, tsy misy hasEdge,
 * na tsy opponent. Tsy manilika ny capture na dia misy vato anao any aoriana.
 * Miverina [] raha tsy misy azo lany.
 */
function beam(
  board: Board,
  startR: number,
  startC: number,
  dr: number,
  dc: number,
  opp: Player
): number[] {
  const captured: number[] = [];
  let pr = startR;
  let pc = startC;
  let r = startR + dr;
  let c = startC + dc;
  while (inBounds(r, c) && hasEdge(pr, pc, r, c) && board[idx(r, c)] === opp) {
    captured.push(idx(r, c));
    pr = r;
    pc = c;
    r += dr;
    c += dc;
  }
  return captured;
}

export interface StepOptions {
  excludeDir?: Dir;
  visited?: Set<number>;
}

/** All legal single steps for the piece at `from`, given optional chain constraints.
 *  Mitovy amin'ny legalFirstMoves / continuationMoves (JavaFX). */
export function singleSteps(
  board: Board,
  from: number,
  mover: Player,
  opts: StepOptions = {}
): Step[] {
  const [r, c] = rc(from);
  const opp = opponent(mover);
  const steps: Step[] = [];
  for (const dir of directions(r, c)) {
    if (opts.excludeDir && dir[0] === opts.excludeDir[0] && dir[1] === opts.excludeDir[1]) {
      continue;
    }
    const tr = r + dir[0];
    const tc = c + dir[1];
    if (!inBounds(tr, tc)) continue;
    const to = idx(tr, tc);
    if (board[to] !== 0) continue;
    if (opts.visited && opts.visited.has(to)) continue;

    // Approach: beam manomboka amin'ny landing, mizotra amin'ny dir
    const approach = beam(board, tr, tc, dir[0], dir[1], opp);
    // Withdrawal: beam manomboka amin'ny from, mizotra mifanohitra
    const withdrawal = beam(board, r, c, -dir[0], -dir[1], opp);

    if (approach.length > 0) {
      steps.push({ from, to, dir, captured: approach, captureType: "approach" });
    }
    if (withdrawal.length > 0) {
      steps.push({ from, to, dir, captured: withdrawal, captureType: "withdrawal" });
    }
    // Quiet move — toy ny Java: atao foana; ny turnStartOptions no manilika raha misy capture
    if (approach.length === 0 && withdrawal.length === 0) {
      steps.push({ from, to, dir, captured: [], captureType: "move" });
    }
  }
  return steps;
}

export function allStepsForPlayer(board: Board, player: Player): Step[] {
  const out: Step[] = [];
  for (let i = 0; i < board.length; i++) {
    if (board[i] === player) out.push(...singleSteps(board, i, player));
  }
  return out;
}

/**
 * The options available to a player at the *start* of their turn.
 * If any capturing step exists anywhere on the board, capturing is
 * mandatory and only capturing steps are returned.
 */
export function turnStartOptions(
  board: Board,
  player: Player
): { forced: boolean; steps: Step[] } {
  const all = allStepsForPlayer(board, player);
  const captures = all.filter((s) => s.captureType !== "move");
  if (captures.length > 0) return { forced: true, steps: captures };
  return { forced: false, steps: all };
}

export function applyStep(board: Board, step: Step, player: Player): Board {
  const nb = board.slice();
  nb[step.from] = 0;
  nb[step.to] = player;
  for (const cap of step.captured) nb[cap] = 0;
  return nb;
}

/**
 * Enumerate every complete "turn" available to `player`: every point at
 * which they may legally stop, including every reachable length of a
 * capture chain. Used by the AI to search the game tree; the human UI
 * walks the same rules interactively instead of using this list directly.
 */
export function generateTurns(board: Board, player: Player): Turn[] {
  const { forced, steps } = turnStartOptions(board, player);
  const turns: Turn[] = [];

  if (!forced) {
    for (const s of steps) {
      turns.push({ player, steps: [s], board: applyStep(board, s, player) });
    }
    return turns;
  }

  const dfs = (curBoard: Board, stepsSoFar: Step[], visited: Set<number>) => {
    const last = stepsSoFar[stepsSoFar.length - 1];
    turns.push({ player, steps: stepsSoFar, board: curBoard });
    const cont = singleSteps(curBoard, last.to, player, {
      excludeDir: last.dir,
      visited,
    }).filter((s) => s.captureType !== "move");
    for (const s of cont) {
      const nb = applyStep(curBoard, s, player);
      const nv = new Set(visited);
      nv.add(s.to);
      dfs(nb, [...stepsSoFar, s], nv);
    }
  };

  for (const s of steps) {
    const nb = applyStep(board, s, player);
    const visited = new Set<number>([s.from, s.to]);
    dfs(nb, [s], visited);
  }

  return turns;
}

export function countPieces(board: Board, player: Player): number {
  let n = 0;
  for (const cell of board) if (cell === player) n++;
  return n;
}

export function isGameOver(
  board: Board,
  toMove: Player
): { over: boolean; winner: Player | null } {
  if (countPieces(board, toMove) === 0) return { over: true, winner: opponent(toMove) };
  if (countPieces(board, opponent(toMove)) === 0) return { over: true, winner: toMove };
  const { steps } = turnStartOptions(board, toMove);
  if (steps.length === 0) return { over: true, winner: opponent(toMove) };
  return { over: false, winner: null };
}
