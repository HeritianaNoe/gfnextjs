import {
  initialBoard, countPieces, turnStartOptions, generateTurns, singleSteps,
  applyStep, isGameOver, idx, Board
} from "../lib/fanorona";

function assert(cond: boolean, msg: string) {
  if (!cond) { console.error("FAIL:", msg); process.exitCode = 1; }
  else console.log("OK:", msg);
}

// 1. Initial board sanity
const b0 = initialBoard();
assert(countPieces(b0, 1) === 22, "Black starts with 22 pieces");
assert(countPieces(b0, 2) === 22, "White starts with 22 pieces");
assert(b0[idx(2,4)] === 0, "center point starts empty");

// 2. First-move options for Black (player 1) should be exactly the pieces
// adjacent to the empty center, no captures possible yet.
const opts0 = turnStartOptions(b0, 1);
// Known Fanorona trivia: on the very first move, (2,4) is the *only* empty
// point on the board, so only pieces adjacent to it can move at all - and
// both of those moves happen to capture. The opening move is forced.
assert(opts0.forced === true, "the opening move in Fanorona is a forced capture (known property)");
const openingFroms = new Set(opts0.steps.map(s => s.from));
assert(openingFroms.size === 2, "exactly two pieces can legally move on the opening turn");
assert(openingFroms.has(idx(3,4)) && openingFroms.has(idx(3,5)), "the two opening movers are (3,4) and (3,5), both adjacent to the center");

// 3. Construct a simple known capture scenario:
// row of 5 same-row points: B . . . W  -> place a black piece that can move
// into an approach-capture position against white with an empty square beyond.
function emptyBoard(): Board { return new Array(45).fill(0); }
{
  const b = emptyBoard();
  // row 2 (r=2): c0=Black, c1=empty, c2=White, c3=empty(edge to capture into)
  b[idx(2,0)] = 1;
  b[idx(2,2)] = 2;
  const steps = singleSteps(b, idx(2,0), 1);
  const approach = steps.find(s => s.to === idx(2,1) && s.captureType === "approach");
  assert(!!approach, "approach capture detected: Black c0->c1 captures White at c2 (empty beyond at c3... let's check board edge)");
  if (approach) {
    assert(approach.captured.length === 1 && approach.captured[0] === idx(2,2), "captured exactly the White piece at (2,2)");
  }
}

// 4. Withdrawal capture scenario: W B . with black moving away from white
{
  const b = emptyBoard();
  b[idx(2,0)] = 2; // white
  b[idx(2,1)] = 1; // black, adjacent to white on the left
  // black moves right to (2,2), withdrawing from white at (2,0)
  const steps = singleSteps(b, idx(2,1), 1);
  const withdrawal = steps.find(s => s.to === idx(2,2) && s.captureType === "withdrawal");
  assert(!!withdrawal, "withdrawal capture detected when black moves away from white");
  if (withdrawal) assert(withdrawal.captured[0] === idx(2,0), "withdrawal captured the white piece behind");
}

// 5. Blocked capture: enemy run followed by own piece should NOT capture
{
  const b = emptyBoard();
  b[idx(2,0)] = 1; // black mover
  b[idx(2,2)] = 2; // white to capture
  b[idx(2,3)] = 1; // black's own piece blocks the empty-or-edge requirement
  const steps = singleSteps(b, idx(2,0), 1);
  const approach = steps.find(s => s.to === idx(2,1) && s.captureType === "approach");
  assert(!approach, "capture correctly blocked when own piece follows the enemy run (no empty/edge)");
}

// 6. Mandatory capture: if any capture exists anywhere, non-capturing moves must be excluded
{
  const b = emptyBoard();
  b[idx(0,0)] = 1; // a black piece with only a quiet move available
  b[idx(2,0)] = 1; // black mover that can capture
  b[idx(2,2)] = 2; // white to capture via approach at (2,1)
  const opts = turnStartOptions(b, 1);
  assert(opts.forced === true, "capture is forced when available");
  assert(opts.steps.every(s => s.captureType !== "move"), "only capturing steps offered when forced");
}

// 7. Chain capture with direction-change + no-revisit constraints
{
  const b = emptyBoard();
  // Set up a black piece that can capture in one direction, land, then capture again in a *different* direction.
  // Black at (2,0). White at (2,2). Empty (2,1) to land. Beyond capture at (2,2), empty at (2,3)+ so simple capture works.
  // After landing at (2,1), allow a second capture going, say, direction (1,0) or diagonal if valid at (2,1).
  b[idx(2,0)] = 1;
  b[idx(2,2)] = 2;
  b[idx(3,1)] = 2; // second white piece, to be captured going a different direction from (2,1)
  // (2,1) has r+c=3 odd -> diagonals are (1,-1)/(-1,1); orthogonal always available including (1,0) down to (3,1).
  const turns = generateTurns(b, 1);
  const chainTurn = turns.find(t => t.steps.length === 2);
  assert(!!chainTurn, "a 2-step chain capture turn was generated");
  if (chainTurn) {
    assert(chainTurn.steps[0].dir[0] === 0 && chainTurn.steps[0].dir[1] === 1, "first step moves right");
    assert(!(chainTurn.steps[1].dir[0] === 0 && chainTurn.steps[1].dir[1] === 1), "second step is a different direction (chain rule)");
  }
  // also a 1-step (stop-early) turn should exist too, since continuing is optional
  const oneStepTurn = turns.find(t => t.steps.length === 1);
  assert(!!oneStepTurn, "player may also stop after just one capture (chain continuation optional)");
}

// 8. Game over: a side with zero legal moves loses
{
  const b = emptyBoard();
  b[idx(0,0)] = 1; // lone black piece, fully boxed in by white on all its valid directions
  // (0,0) has r+c=0 even -> dirs: (0,1),(0,-1)x,(1,0),(-1,0)x,(1,1),(-1,-1)x -> valid on-board: (0,1),(1,0),(1,1)
  b[idx(0,1)] = 2;
  b[idx(1,0)] = 2;
  b[idx(1,1)] = 2;
  const res = isGameOver(b, 1);
  assert(res.over === true && res.winner === 2, "player with no legal moves loses");
}

console.log("Done.");
