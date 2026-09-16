"use client";

import { useCallback, useMemo, useState } from "react";
import FanoronaBoard from "./Board";
import {
  Board,
  Player,
  Step,
  applyStep,
  countPieces,
  initialBoard,
  isGameOver,
  singleSteps,
  turnStartOptions,
} from "@/lib/fanorona";
import { Difficulty, chooseAiTurn } from "@/lib/ai";

const HUMAN: Player = 1;
const AI: Player = 2;

interface ChainState {
  pieceAt: number;
  lastDir: readonly [number, number];
  visited: Set<number>;
  steps: Step[];
}

const DIFF_LABEL: Record<Difficulty, string> = {
  mora: "Mora",
  antonony: "Antonony",
  sarotra: "Sarotra",
};

export default function FanoronaGame() {
  const [board, setBoard] = useState<Board>(() => initialBoard());
  const [current, setCurrent] = useState<Player>(HUMAN);
  const [selected, setSelected] = useState<number | null>(null);
  const [chain, setChain] = useState<ChainState | null>(null);
  const [pendingChoice, setPendingChoice] = useState<Step[] | null>(null);
  const [gameOver, setGameOver] = useState<{ winner: Player } | null>(null);
  const [aiThinking, setAiThinking] = useState(false);
  const [difficulty, setDifficulty] = useState<Difficulty>("antonony");
  const [log, setLog] = useState<string[]>([]);
  const [moveCount, setMoveCount] = useState(0);
  /** Izay mandeha aloha: HUMAN na AI */
  const [goesFirst, setGoesFirst] = useState<Player>(HUMAN);

  const turnOpts = useMemo(() => {
    if (current !== HUMAN || chain) return { forced: false, steps: [] as Step[] };
    return turnStartOptions(board, HUMAN);
  }, [board, current, chain]);

  const addLog = useCallback((text: string) => {
    setLog((l) => [text, ...l].slice(0, 6));
  }, []);

  function startFresh(first: Player = goesFirst) {
    const b = initialBoard();
    setBoard(b);
    setSelected(null);
    setChain(null);
    setPendingChoice(null);
    setGameOver(null);
    setLog([]);
    setMoveCount(0);
    setGoesFirst(first);
    if (first === AI) {
      setCurrent(AI);
      setAiThinking(true);
      setTimeout(() => runAi(b), 400);
    } else {
      setCurrent(HUMAN);
      setAiThinking(false);
    }
  }

  function resetGame() {
    startFresh(goesFirst);
  }

  function chooseFirst(who: Player) {
    if (who === goesFirst && moveCount === 0 && !aiThinking) return;
    startFresh(who);
  }

  function runAi(startBoard: Board) {
    const turn = chooseAiTurn(startBoard, AI, difficulty);
    if (!turn) {
      setAiThinking(false);
      setGameOver({ winner: HUMAN });
      return;
    }
    animateAiSteps(turn.steps, startBoard, 0);
  }

  function animateAiSteps(steps: Step[], curBoard: Board, i: number) {
    if (i >= steps.length) {
      setAiThinking(false);
      const { over, winner } = isGameOver(curBoard, HUMAN);
      if (over) {
        setGameOver({ winner: winner! });
        return;
      }
      setCurrent(HUMAN);
      return;
    }
    const step = steps[i];
    const nb = applyStep(curBoard, step, AI);
    setBoard(nb);
    if (i === 0) {
      addLog(
        `Ordinatera: namindra${step.captured.length ? `, nisambotra ${totalCaptured(steps)}` : ""}`
      );
    }
    setTimeout(() => animateAiSteps(steps, nb, i + 1), 420);
  }

  function totalCaptured(steps: Step[]) {
    return steps.reduce((n, s) => n + s.captured.length, 0);
  }

  function finishHumanTurn(finalBoard: Board, stepsThisTurn: Step[]) {
    setChain(null);
    setSelected(null);
    setPendingChoice(null);
    setMoveCount((m) => m + 1);
    const capped = totalCaptured(stepsThisTurn);
    addLog(`Ianao: namindra${capped ? `, nisambotra ${capped}` : ""}`);
    const { over, winner } = isGameOver(finalBoard, AI);
    if (over) {
      setGameOver({ winner: winner! });
      return;
    }
    setCurrent(AI);
    setAiThinking(true);
    setTimeout(() => runAi(finalBoard), 380);
  }

  function commitHumanStep(step: Step) {
    const nb = applyStep(board, step, HUMAN);
    setBoard(nb);
    setPendingChoice(null);

    if (step.captureType === "move") {
      finishHumanTurn(nb, [step]);
      return;
    }

    const visited = new Set(chain ? chain.visited : [step.from]);
    visited.add(step.to);
    const priorSteps = chain ? chain.steps : [];
    const allSteps = [...priorSteps, step];

    const cont = singleSteps(nb, step.to, HUMAN, {
      excludeDir: step.dir,
      visited,
    }).filter((s) => s.captureType !== "move");

    if (cont.length === 0) {
      finishHumanTurn(nb, allSteps);
    } else {
      setChain({ pieceAt: step.to, lastDir: step.dir, visited, steps: allSteps });
      setSelected(step.to);
    }
  }

  function stopChain() {
    if (!chain) return;
    finishHumanTurn(board, chain.steps);
  }

  function onPointClick(i: number) {
    if (gameOver || aiThinking || current !== HUMAN) return;

    // Safidy approach/withdrawal: tsindrio ny vato maitso (azo sambôrina)
    if (pendingChoice) {
      const byCap = pendingChoice.filter((s) => s.captured.includes(i));
      if (byCap.length === 1) {
        commitHumanStep(byCap[0]);
        return;
      }
      // na ny destination raha tokana
      const byDest = pendingChoice.filter((s) => s.to === i);
      if (byDest.length === 1) {
        commitHumanStep(byDest[0]);
        return;
      }
      return;
    }

    if (chain) {
      const opts = singleSteps(board, chain.pieceAt, HUMAN, {
        excludeDir: chain.lastDir,
        visited: chain.visited,
      }).filter((s) => s.captureType !== "move");
      const matches = opts.filter((s) => s.to === i);
      if (matches.length === 1) commitHumanStep(matches[0]);
      else if (matches.length > 1) setPendingChoice(matches);
      return;
    }

    if (selected === null) {
      if (turnOpts.steps.some((s) => s.from === i)) setSelected(i);
      return;
    }

    if (i === selected) {
      setSelected(null);
      return;
    }

    if (board[i] === HUMAN && turnOpts.steps.some((s) => s.from === i)) {
      setSelected(i);
      return;
    }

    const matches = turnOpts.steps.filter((s) => s.from === selected && s.to === i);
    if (matches.length === 1) commitHumanStep(matches[0]);
    else if (matches.length > 1) setPendingChoice(matches);
  }

  const selectable = useMemo(() => {
    if (chain) return new Set<number>([chain.pieceAt]);
    if (current !== HUMAN) return new Set<number>();
    return new Set(turnOpts.steps.map((s) => s.from));
  }, [chain, current, turnOpts]);

  const forcedPieces = useMemo(() => {
    if (chain || !turnOpts.forced) return new Set<number>();
    return new Set(turnOpts.steps.map((s) => s.from));
  }, [chain, turnOpts]);

  const destinations = useMemo(() => {
    if (pendingChoice) {
      return new Set(pendingChoice.map((s) => s.to));
    }
    if (chain) {
      const opts = singleSteps(board, chain.pieceAt, HUMAN, {
        excludeDir: chain.lastDir,
        visited: chain.visited,
      }).filter((s) => s.captureType !== "move");
      return new Set(opts.map((s) => s.to));
    }
    if (selected !== null) {
      return new Set(turnOpts.steps.filter((s) => s.from === selected).map((s) => s.to));
    }
    return new Set<number>();
  }, [board, chain, selected, turnOpts, pendingChoice]);

  /** Vato azo sambôrina rehefa misy safidy approach/withdrawal — highlight maitso */
  const captureHints = useMemo(() => {
    if (!pendingChoice) return new Set<number>();
    const caps = new Set<number>();
    for (const s of pendingChoice) {
      for (const c of s.captured) caps.add(c);
    }
    return caps;
  }, [pendingChoice]);

  const humanCount = countPieces(board, HUMAN);
  const aiCount = countPieces(board, AI);

  const statusText = gameOver
    ? gameOver.winner === HUMAN
      ? "Nandresy ianao! 🎉"
      : "Nandresy ny ordinatera."
    : current === HUMAN
    ? chain
      ? "Manohy misambotra, sa ajanony?"
      : turnOpts.forced
      ? "Misy azo sambôrina — tsy maintsy misambotra."
      : "Tour anao — misafidiana bilaza."
    : "Mihevitra ny ordinatera…";

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      <div className="flex flex-wrap items-center justify-between gap-4 w-full max-w-3xl">
        <div className="flex items-center gap-2">
          {/* Toggle izay mandeha aloha — tsindrio = manomboka indray miaraka amin'io */}
          <button
            type="button"
            onClick={() => chooseFirst(HUMAN)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border font-body text-sm transition-colors ${
              goesFirst === HUMAN && current === HUMAN && !gameOver
                ? "border-raffia-500 bg-bark-800 ring-1 ring-raffia-500/50"
                : goesFirst === HUMAN
                ? "border-raffia-600/60 bg-bark-900/80"
                : "border-wood-700/40 hover:border-wood-500"
            }`}
            title="Ianao no mandeha aloha"
          >
            <span className="inline-block w-3.5 h-3.5 rounded-full bg-[#1E1712] border border-black" />
            <span className="text-bone/90">Ianao</span>
            <span className="text-bone/50">{humanCount}</span>
            {goesFirst === HUMAN && (
              <span className="text-[10px] uppercase tracking-wide text-raffia-400 ml-0.5">aloha</span>
            )}
          </button>
          <span className="font-display italic text-raffia-400/70 text-lg">vs</span>
          <button
            type="button"
            onClick={() => chooseFirst(AI)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border font-body text-sm transition-colors ${
              goesFirst === AI && current === AI && !gameOver
                ? "border-raffia-500 bg-bark-800 ring-1 ring-raffia-500/50"
                : goesFirst === AI
                ? "border-raffia-600/60 bg-bark-900/80"
                : "border-wood-700/40 hover:border-wood-500"
            }`}
            title="Ordinatera no mandeha aloha"
          >
            <span className="inline-block w-3.5 h-3.5 rounded-full bg-bone border border-wood-600" />
            <span className="text-bone/90">Ordinatera</span>
            <span className="text-bone/50">{aiCount}</span>
            {goesFirst === AI && (
              <span className="text-[10px] uppercase tracking-wide text-raffia-400 ml-0.5">aloha</span>
            )}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-bone/60 text-sm font-body">Haran-tsakafo:</label>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as Difficulty)}
            className="bg-bark-800 text-bone border border-wood-600 rounded-md px-2 py-1 text-sm font-body focus:outline-none"
          >
            {(Object.keys(DIFF_LABEL) as Difficulty[]).map((d) => (
              <option key={d} value={d}>
                {DIFF_LABEL[d]}
              </option>
            ))}
          </select>
          <button
            onClick={resetGame}
            className="bg-laterite-600 hover:bg-laterite-500 transition-colors text-bone text-sm font-body px-3 py-1.5 rounded-md"
          >
            Manomboka indray
          </button>
        </div>
      </div>

      <div className="relative w-full flex justify-center">
        <FanoronaBoard
          board={board}
          selectable={selectable}
          selected={chain ? chain.pieceAt : selected}
          destinations={destinations}
          captureHints={captureHints}
          forcedPieces={forcedPieces}
          onPointClick={onPointClick}
          disabled={!!gameOver || current !== HUMAN}
        />
      </div>

      <div className="flex flex-col items-center gap-3 min-h-[3rem]">
        <p className="font-display italic text-xl text-bone/90 text-center">
          {pendingChoice
            ? "Safidio ny vato maitso hohanina (fanatonana na fisintahana)"
            : statusText}
        </p>

        {chain && !pendingChoice && (
          <button
            onClick={stopChain}
            className="bg-wood-600 hover:bg-wood-500 transition-colors text-bone font-body text-sm px-4 py-1.5 rounded-md"
          >
            Ajanony eto
          </button>
        )}
      </div>

      {log.length > 0 && (
        <div className="w-full max-w-md text-xs font-body text-bone/50 flex flex-col gap-1 items-center">
          {log.map((l, i) => (
            <p key={i} className={i === 0 ? "text-bone/80" : ""}>
              {l}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}



