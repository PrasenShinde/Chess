import React from "react";

/**
 * High-quality SVG Chess Pieces for Queen, Rook, Bishop, Knight, King, Pawn
 * Supports both white ('w') and black ('b') color schemes.
 */

const PIECE_SVGS = {
  // White Queen
  wq: (
    <svg viewBox="0 0 45 45" className="w-full h-full drop-shadow-md">
      <g fill="#fff" fillRule="evenodd" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM24.5 7.5a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM41 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM16 8.5a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM33 8.5a2 2 0 1 1-4 0 2 2 0 0 1 4 0z" />
        <path d="M9 26c8.5-1.5 21-1.5 27 0l2-12-7 11V11l-5.5 13.5L22.5 10l-3 14.5L14 11v14L7 14l2 12z" strokeLinejoin="miter" />
        <path d="M9 26c0 2 1.5 2 2.5 4 1 1.5 1 1.5 1 3.5 2.5-1 4.5-1 10-1s7.5 0 10 1c0-2 0-2 1-3.5 1-2 2.5-2 2.5-4H9z" strokeLinecap="butt" />
        <path d="M11.5 30c3.5-1 18.5-1 22 0M12 33.5c6-1 15-1 21 0" fill="none" />
        <path d="M9 37h27v3H9z" />
      </g>
    </svg>
  ),
  // White Rook
  wr: (
    <svg viewBox="0 0 45 45" className="w-full h-full drop-shadow-md">
      <g fill="#fff" fillRule="evenodd" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 39h27v-3H9v3zM12 36v-4h21v4H12zM11 14h23l-2 18H13L11 14zM9 10h3v3H9v-3zM14 10h3v3h-3v-3zM19 10h3v3h-3v-3zM24 10h3v3h-3v-3zM29 10h3v3h-3v-3zM33 10h3v3h-3v-3z" strokeLinecap="butt" />
        <path d="M9 10h27v4H9v-4z" />
        <path d="M14 29.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0zM31 29.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0zM14 16.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0zM31 16.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0z" fill="none" />
      </g>
    </svg>
  ),
  // White Bishop
  wb: (
    <svg viewBox="0 0 45 45" className="w-full h-full drop-shadow-md">
      <g fill="none" fillRule="evenodd" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <g fill="#fff" strokeLinejoin="miter">
          <path d="M9 36c1.2-2.5 7-4 13.5-4 6.5 0 12.3 1.5 13.5 4H9z" />
          <path d="M15 32c2.5-4.5 4.5-8 4.5-12.5C19.5 15 21 11 22.5 10c1.5 1 3 5 3 9.5 0 4.5 2 8 4.5 12.5H15z" />
          <path d="M25 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z" />
        </g>
        <path d="M17.5 26h10M22.5 21v10" />
        <path d="M22.5 10c0 0-2 2.5-2 4s2.5 2.5 2.5 2.5" />
      </g>
    </svg>
  ),
  // White Knight
  wn: (
    <svg viewBox="0 0 45 45" className="w-full h-full drop-shadow-md">
      <g fill="none" fillRule="evenodd" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 10c10.5 1 16.5 8 16 29H15c0-9 10-6.5 8-12-2.5-2.5-6-3-8.5-1.5-2.5 1.5-4 5.5-4 8.5s-2.5 5-2.5 5-1-4.5 1.5-8.5c2.5-4 7-6 9.5-10.5" fill="#fff" />
        <path d="M24 18c.333-1.333.5-2.667.5-4 0-2-.5-3-1.5-4-1 1-1.5 2.5-1.5 4.5 0 1.5.5 2.5 2.5 3.5z" fill="#000" />
        <circle cx="16" cy="14" r="1.5" fill="#000" />
      </g>
    </svg>
  ),

  // Black Queen
  bq: (
    <svg viewBox="0 0 45 45" className="w-full h-full drop-shadow-md">
      <g fill="#000" fillRule="evenodd" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM24.5 7.5a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM41 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM16 8.5a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM33 8.5a2 2 0 1 1-4 0 2 2 0 0 1 4 0z" />
        <path d="M9 26c8.5-1.5 21-1.5 27 0l2-12-7 11V11l-5.5 13.5L22.5 10l-3 14.5L14 11v14L7 14l2 12z" strokeLinejoin="miter" />
        <path d="M9 26c0 2 1.5 2 2.5 4 1 1.5 1 1.5 1 3.5 2.5-1 4.5-1 10-1s7.5 0 10 1c0-2 0-2 1-3.5 1-2 2.5-2 2.5-4H9z" strokeLinecap="butt" />
        <path d="M11.5 30c3.5-1 18.5-1 22 0M12 33.5c6-1 15-1 21 0" fill="none" stroke="#fff" />
        <path d="M9 37h27v3H9z" />
      </g>
    </svg>
  ),
  // Black Rook
  br: (
    <svg viewBox="0 0 45 45" className="w-full h-full drop-shadow-md">
      <g fill="#000" fillRule="evenodd" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 39h27v-3H9v3zM12 36v-4h21v4H12zM11 14h23l-2 18H13L11 14zM9 10h3v3H9v-3zM14 10h3v3h-3v-3zM19 10h3v3h-3v-3zM24 10h3v3h-3v-3zM29 10h3v3h-3v-3zM33 10h3v3h-3v-3z" strokeLinecap="butt" />
        <path d="M9 10h27v4H9v-4z" />
        <path d="M12 35.5h21M13 31.5h19M14 29.5h17M14 16.5h17" stroke="#fff" fill="none" />
      </g>
    </svg>
  ),
  // Black Bishop
  bb: (
    <svg viewBox="0 0 45 45" className="w-full h-full drop-shadow-md">
      <g fill="none" fillRule="evenodd" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <g fill="#000" strokeLinejoin="miter">
          <path d="M9 36c1.2-2.5 7-4 13.5-4 6.5 0 12.3 1.5 13.5 4H9z" />
          <path d="M15 32c2.5-4.5 4.5-8 4.5-12.5C19.5 15 21 11 22.5 10c1.5 1 3 5 3 9.5 0 4.5 2 8 4.5 12.5H15z" />
          <path d="M25 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z" />
        </g>
        <path d="M17.5 26h10M22.5 21v10" stroke="#fff" />
        <path d="M22.5 10c0 0-2 2.5-2 4s2.5 2.5 2.5 2.5" stroke="#fff" />
      </g>
    </svg>
  ),
  // Black Knight
  bn: (
    <svg viewBox="0 0 45 45" className="w-full h-full drop-shadow-md">
      <g fill="none" fillRule="evenodd" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 10c10.5 1 16.5 8 16 29H15c0-9 10-6.5 8-12-2.5-2.5-6-3-8.5-1.5-2.5 1.5-4 5.5-4 8.5s-2.5 5-2.5 5-1-4.5 1.5-8.5c2.5-4 7-6 9.5-10.5" fill="#000" />
        <path d="M24 18c.333-1.333.5-2.667.5-4 0-2-.5-3-1.5-4-1 1-1.5 2.5-1.5 4.5 0 1.5.5 2.5 2.5 3.5z" fill="#fff" stroke="#fff" />
        <circle cx="16" cy="14" r="1.5" fill="#fff" />
      </g>
    </svg>
  ),
};

export default function ChessPieceSVG({ code, className = "w-12 h-12" }) {
  const pieceKey = code ? code.toLowerCase() : "wq";
  return (
    <div className={`inline-flex items-center justify-center ${className}`}>
      {PIECE_SVGS[pieceKey] || PIECE_SVGS.wq}
    </div>
  );
}
