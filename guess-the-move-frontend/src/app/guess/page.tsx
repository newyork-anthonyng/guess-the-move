'use client';

import { makeUci } from 'chessops';
import { uciToMove } from 'chessground/util';
import { useEffect, useRef, useState } from 'react';
import { Chessground } from 'chessground';
import { Api } from 'chessground/api';
import { parsePgn, PgnNodeData, startingPosition, transform } from 'chessops/pgn';
import { parseSan, makeSanAndPlay } from 'chessops/san';
import 'chessground/assets/chessground.base.css';
import 'chessground/assets/chessground.brown.css';
import 'chessground/assets/chessground.cburnett.css';

const SAMPLE_PGN = `[Event "Paris"]
[Site "Paris FRA"]
[Date "1858.??.??"]
[EventDate "?"]
[Round "?"]
[Result "1-0"]
[White "Paul Morphy"]
[Black "Duke Karl / Count Isouard"]
[ECO "C41"]
[WhiteElo "?"]
[BlackElo "?"]
[PlyCount "33"]

1.e4 e5 2.Nf3 d6 3.d4 Bg4 {This is a weak move
already.--Fischer} 4.dxe5 Bxf3 5.Qxf3 dxe5 6.Bc4 Nf6 7.Qb3 Qe7
8.Nc3 c6 9.Bg5 {Black is in what's like a zugzwang position
here. He can't develop the [Queen's] knight because the pawn
is hanging, the bishop is blocked because of the
Queen.--Fischer} b5 10.Nxb5 cxb5 11.Bxb5+ Nbd7 12.O-O-O Rd8
13.Rxd7 Rxd7 14.Rd1 Qe6 15.Bxd7+ Nxd7 16.Qb8+ Nxb8 17.Rd8# 1-0`;

interface ExtendedPgnNodeData extends PgnNodeData {
  uci: string
} 

function generateUciFromPgn(pgn: string): ExtendedPgnNodeData[]  {
    const game = parsePgn(pgn)[0];
    const pos = startingPosition(game.headers).unwrap();

    game.moves = transform(game.moves, pos, (pos, node) => {
      const move = parseSan(pos, node.san);

      if (!move) {
        return;
      }

      const san = makeSanAndPlay(pos, move);

      return {
        ...node,
        san,
        uci: makeUci(move)
      };
    });

    const movesArray = Array.from(game.moves.mainline());

    return movesArray as ExtendedPgnNodeData[];
}

const moves = generateUciFromPgn(SAMPLE_PGN);

export default function Guess() {
  const chessboardDivRef = useRef<HTMLDivElement>(null);
  const chessgroundRef = useRef<Api>();
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0);

  useEffect(() => {
    const $div = chessboardDivRef.current;

    if ($div) {
      chessgroundRef.current = Chessground($div, {});
    }
  }, []);

  function handleNextButtonClick() {
    if (chessgroundRef.current) {
      const currentMove = moves[currentMoveIndex];
      if (!currentMove) return;

      const myUciMove = uciToMove(currentMove.uci);
      if (myUciMove) {
        const [originCoordinate, destinationCoordinate] = myUciMove;

        chessgroundRef.current.move(originCoordinate, destinationCoordinate);

        setCurrentMoveIndex(currentMoveIndex + 1);
      }
    }
  }

  return (
    <div className="p-6 font-mono">
    <div className="relative flex flex-wrap items-baseline pb-6 before:bg-black before:absolute before:-top-6 before:bottom-0 before:-left-60 before:-right-6">
      <h1 className="flex-none font-semibold mb-2 relative text-2xl text-white w-full">Guess the move</h1>
    </div>

    <div className="max-w-5xl flex my-6 flex-col sm:flex-row">
      <div
        className="flex-none w-full sm:w-1/2 mb-10 min-f-full"
        style={{
          width: 500,
          height: 500
        }}
        ref={chessboardDivRef}
      >
      </div>

      <div className="flex-auto sm:px-6">
        <p className="text-xl">Play the best move.</p>
        <button onClick={handleNextButtonClick}>Next</button>
      </div>
    </div>
  </div>
  );
}