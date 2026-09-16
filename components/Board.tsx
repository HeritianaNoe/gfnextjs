"use client";

import { Board as BoardState, COLS, ROWS } from "@/lib/fanorona";

const S = 64;
/** Cadre hazo — mitovy JavaFX FRAME_RATIO ~0.42 * cell */
const FRAME = 28;
const PAD = 22; // pad ivelany fanampiny
const MARGIN = FRAME + PAD + 12;

const GRID_W = (COLS - 1) * S;
const GRID_H = (ROWS - 1) * S;
export const BOARD_WIDTH = GRID_W + MARGIN * 2;
export const BOARD_HEIGHT = GRID_H + MARGIN * 2;

function pos(r: number, c: number) {
  return { x: c * S + MARGIN, y: r * S + MARGIN };
}

interface BoardProps {
  board: BoardState;
  selectable: Set<number>;
  selected: number | null;
  destinations: Set<number>;
  captureHints: Set<number>;
  forcedPieces: Set<number>;
  onPointClick: (i: number) => void;
  disabled: boolean;
}

export default function FanoronaBoard({
  board,
  selectable,
  selected,
  destinations,
  captureHints,
  onPointClick,
  disabled,
}: BoardProps) {
  const lines: { x1: number; y1: number; x2: number; y2: number; key: string }[] = [];

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS - 1; c++) {
      const a = pos(r, c);
      const b = pos(r, c + 1);
      lines.push({ x1: a.x, y1: a.y, x2: b.x, y2: b.y, key: `h-${r}-${c}` });
    }
  }
  for (let c = 0; c < COLS; c++) {
    for (let r = 0; r < ROWS - 1; r++) {
      const a = pos(r, c);
      const b = pos(r + 1, c);
      lines.push({ x1: a.x, y1: a.y, x2: b.x, y2: b.y, key: `v-${r}-${c}` });
    }
  }
  for (let r = 0; r < ROWS - 1; r++) {
    for (let c = 0; c < COLS - 1; c++) {
      if ((r + c) % 2 === 0) {
        const a = pos(r, c);
        const b = pos(r + 1, c + 1);
        lines.push({ x1: a.x, y1: a.y, x2: b.x, y2: b.y, key: `ds-${r}-${c}` });
      } else {
        const a = pos(r, c + 1);
        const b = pos(r + 1, c);
        lines.push({ x1: a.x, y1: a.y, x2: b.x, y2: b.y, key: `df-${r}-${c}` });
      }
    }
  }

  // Cadre geometry (JavaFX drawFrame)
  const outerX = 4;
  const outerY = 4;
  const outerW = BOARD_WIDTH - 8;
  const outerH = BOARD_HEIGHT - 8;
  const midInset = FRAME * 0.28;
  const accentInset = FRAME * 0.55;
  const surfaceInset = FRAME;
  const innerEdge = surfaceInset + 2.5;

  return (
    <svg
      viewBox={`0 0 ${BOARD_WIDTH} ${BOARD_HEIGHT}`}
      className="w-full h-auto max-w-3xl select-none touch-none drop-shadow-xl"
      role="group"
      aria-label="Sahan-tsipika Fanorona"
    >
      <defs>
        {/* Outer dark wood */}
        <linearGradient id="frameOuter" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#5c3d22" />
          <stop offset="35%" stopColor="#6e4a2a" />
          <stop offset="65%" stopColor="#4a3018" />
          <stop offset="100%" stopColor="#3a2410" />
        </linearGradient>
        {/* Middle lighter wood */}
        <linearGradient id="frameMid" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#a07848" />
          <stop offset="40%" stopColor="#8b6238" />
          <stop offset="70%" stopColor="#7a5430" />
          <stop offset="100%" stopColor="#6a4828" />
        </linearGradient>
        {/* Playing surface — warm wood */}
        <linearGradient id="frameSurface" x1="0" y1="0" x2="0.15" y2="1">
          <stop offset="0%" stopColor="#e8d4b0" />
          <stop offset="30%" stopColor="#dfc9a0" />
          <stop offset="60%" stopColor="#d4b888" />
          <stop offset="100%" stopColor="#c9a878" />
        </linearGradient>
        <radialGradient id="blackPiece" cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#4A4038" />
          <stop offset="55%" stopColor="#1E1712" />
          <stop offset="100%" stopColor="#0E0A07" />
        </radialGradient>
        <radialGradient id="whitePiece" cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#FFFBF3" />
          <stop offset="60%" stopColor="#EEE1C8" />
          <stop offset="100%" stopColor="#CBB78E" />
        </radialGradient>
        <filter id="glowGold" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="0" stdDeviation="3.5" floodColor="#f0b040" floodOpacity="0.9" />
        </filter>
        <filter id="glowGreen" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#40c050" floodOpacity="0.9" />
        </filter>
        <filter id="frameShadow" x="-5%" y="-5%" width="110%" height="115%">
          <feDropShadow dx="3" dy="5" stdDeviation="6" floodColor="#000" floodOpacity="0.35" />
        </filter>
      </defs>

      {/* === Cadre hazo (JavaFX drawFrame) === */}
      {/* Outer dark wood */}
      <rect
        x={outerX}
        y={outerY}
        width={outerW}
        height={outerH}
        rx={10}
        fill="url(#frameOuter)"
        stroke="#2a1808"
        strokeWidth={1.5}
        filter="url(#frameShadow)"
      />
      {/* Middle band */}
      <rect
        x={outerX + midInset}
        y={outerY + midInset}
        width={outerW - 2 * midInset}
        height={outerH - 2 * midInset}
        rx={7}
        fill="url(#frameMid)"
        stroke="#4a3018"
        strokeWidth={1}
      />
      {/* Bronze/gold accent line */}
      <rect
        x={outerX + accentInset}
        y={outerY + accentInset}
        width={outerW - 2 * accentInset}
        height={outerH - 2 * accentInset}
        rx={5}
        fill="none"
        stroke="#c9a06a"
        strokeWidth={1.6}
      />
      {/* Playing surface */}
      <rect
        x={outerX + surfaceInset}
        y={outerY + surfaceInset}
        width={outerW - 2 * surfaceInset}
        height={outerH - 2 * surfaceInset}
        rx={3}
        fill="url(#frameSurface)"
        stroke="#8b6238"
        strokeWidth={1}
      />
      {/* Inner thin dark edge */}
      <rect
        x={outerX + innerEdge}
        y={outerY + innerEdge}
        width={outerW - 2 * innerEdge}
        height={outerH - 2 * innerEdge}
        rx={2}
        fill="none"
        stroke="#6b4a28"
        strokeOpacity={0.55}
        strokeWidth={1}
      />

      {/* Grid lines */}
      {lines.map((l) => (
        <line
          key={l.key}
          x1={l.x1}
          y1={l.y1}
          x2={l.x2}
          y2={l.y2}
          stroke="#8a6238"
          strokeWidth={2.2}
          strokeLinecap="round"
          opacity={0.85}
        />
      ))}

      {/* Pieces */}
      {board.map((cell, i) => {
        const [r, c] = [Math.floor(i / COLS), i % COLS];
        const { x, y } = pos(r, c);
        const isSelected = selected === i;
        const isDest = destinations.has(i);
        const isSelectable = selectable.has(i);
        const isCaptureHint = captureHints.has(i);
        const isHighlighted =
          isDest || isCaptureHint || (isSelectable && selected === null);
        const clickable = isSelectable || isDest || isCaptureHint;

        let stroke = cell === 1 ? "#1a1a1a" : cell === 2 ? "#8a6a45" : "#6b4a35";
        let strokeWidth = cell === 0 ? 1 : 1.4;
        let filter: string | undefined;
        if (isSelected) {
          stroke = "#f0b040";
          strokeWidth = 2.5;
          filter = "url(#glowGold)";
        } else if (isHighlighted) {
          stroke = "#40c050";
          strokeWidth = 2;
          filter = "url(#glowGreen)";
        }

        return (
          <g
            key={i}
            onClick={() => !disabled && onPointClick(i)}
            style={{ cursor: disabled ? "default" : clickable ? "pointer" : "default" }}
          >
            <circle cx={x} cy={y} r={22} fill="transparent" />

            {cell !== 0 ? (
              <circle
                cx={x}
                cy={y}
                r={15.5}
                fill={cell === 1 ? "url(#blackPiece)" : "url(#whitePiece)"}
                stroke={stroke}
                strokeWidth={strokeWidth}
                filter={filter}
              />
            ) : isDest ? (
              <circle
                cx={x}
                cy={y}
                r={7}
                fill="#40c050"
                fillOpacity={0.75}
                stroke="#40c050"
                strokeWidth={1.8}
                filter="url(#glowGreen)"
              />
            ) : (
              <circle cx={x} cy={y} r={4} fill="#a8845a" fillOpacity={0.45} stroke="#6b4a35" strokeWidth={1} />
            )}
          </g>
        );
      })}
    </svg>
  );
}
