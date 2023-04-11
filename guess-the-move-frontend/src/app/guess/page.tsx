'use client';

import { useRef, useEffect } from 'react';
// import Chessground from 'chessground/index';
import Chessground from '../../library/chessground/index.js';
import 'chessground/assets/chessground.base.css';
import 'chessground/assets/chessground.brown.css';
import 'chessground/assets/chessground.cburnett.css';
import './applesauce.css';

export default function Guess() {
  const chessboardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const $div = chessboardRef.current;
    if ($div) {
      Chessground($div);

      const pawns = document.querySelectorAll('.white.pawn');
      const ePawn = pawns[4];
      const dPawn = pawns[3];
    }
  }, []);


  function handleClick() {
    console.log('%cclicked!', 'background-color: coral;');
  }

  return (
    <div className="p-6 font-mono">
      <button onClick={handleClick}>Click me</button>
      <div className="relative flex flex-wrap items-baseline pb-6 before:bg-black before:absolute before:-top-6 before:bottom-0 before:-left-60 before:-right-6">
        <h1 className="flex-none font-semibold mb-2 relative text-2xl text-white w-full">Guess the move</h1>
      </div>

      <div
        className="flex-none w-full sm:w-1/2 mb-10 min-f-full"
        style={{
          width: 500,
          height: 500
        }}
        ref={chessboardRef} />
    </div>
  )
}