'use client';

import { useMachine } from '@xstate/react';
import evaluateMachine from './machine';
import { Chess } from 'chess.js';
import { makeUci } from 'chessops';
import { makeFen } from 'chessops/fen';
import { scalachessCharPair } from 'chessops/compat';
import { uciToMove } from 'chessground/util';
import { useEffect, useRef, useState } from 'react';
import { Chessground } from 'chessground';
import { Api } from 'chessground/api';
import { Config } from 'chessground/config';
import { parsePgn, makePgn, startingPosition, transform } from 'chessops/pgn';
import { parseSan, makeSanAndPlay } from 'chessops/san';
import 'chessground/assets/chessground.base.css';
import 'chessground/assets/chessground.brown.css';
import 'chessground/assets/chessground.cburnett.css';
import { initialSquares } from './utils';

const INITIAL_FEN = `rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1`;

function toDests(chess) {
  // const destinations = {};
  const destinations = new Map();
  
  initialSquares.forEach(s => {
    const ms = chess.moves({ square: s, verbose: true });
    if (ms.length) destinations.set(s, ms.map((m) => m.to));
  });

  const color = chess.turn() === 'w' ? 'white' : 'black';

  return {
    color,
    dests: destinations,
    free: false
  }
}


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

function getMovesFromPgn(pgn: string): Config[]  {
    const game = parsePgn(pgn)[0];
    const pos = startingPosition(game.headers).unwrap();

    const initialFen = makeFen(pos.toSetup());
    const initialPosition = {
      fen: initialFen,
      turnColor: 'white',
      lastMove: [],
      san: ''
    };

    game.moves = transform(game.moves, pos, (pos, node) => {
      const move = parseSan(pos, node.san);

      if (!move) {
        return;
      }

      const moveId = scalachessCharPair(move);
      const san = makeSanAndPlay(pos, move);
      const fen = makeFen(pos.toSetup());
      const turnColor = pos.turn;
      const uci = makeUci(move);
      const lastMove = uciToMove(uci);

      return {
        ...node,
        comments: node.comments || ['This is a test'],
        fen,
        turnColor,
        moveId,
        san,
        uci: makeUci(move),
        lastMove
      };
    });

    const movesArray = Array.from(game.moves.mainline());
    movesArray.unshift(initialPosition);

    const newPgn = makePgn(game);
    // console.group('game.moves');
    // console.log(game);
    // console.groupEnd();

    return movesArray as Config[];
}

const moves = getMovesFromPgn(SAMPLE_PGN);

export default function Guess() {
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0);
  const chessboardDivRef = useRef<HTMLDivElement>(null);
  const chessgroundRef = useRef<Api>();
  const [state, send] = useMachine(evaluateMachine, {
    actions: {
      // load: () => {
      //   const playerFen = chessgroundRef.current && chessgroundRef.current.getFen() || '';
      //   const masterGameState = moves[currentMoveIndex + 1];
      //   const masterFen = masterGameState.fen || '';
      //   getEvaluation(playerFen, masterFen).then(response => {
      //     if (response.ok) {
      //       send({ type: 'RESOLVE' });
      //     } else {
      //       send({ type: 'ERROR' });
      //     }
      //   });
      // }
    }
  });
  
  

  useEffect(() => {
    const $div = chessboardDivRef.current;
    const chess = new Chess(INITIAL_FEN);
    // console.log(chess);

    if ($div) {
      const result = toDests(chess);
      // console.log(result);
      chessgroundRef.current = Chessground($div, {
        movable: {
          free: false,
          dests: result.dests,
          showDests: true
        },
        events: {
          move: () => {
            const playerFen = chessgroundRef.current && chessgroundRef.current.getFen() || '';
            const masterGameState = moves[currentMoveIndex + 1];
            const masterFen = masterGameState.fen || '';
            send("MOVE", { masterFen, userFen: playerFen });
          }
        }
        
      });
    }
  }, []);

  function handleNextButtonClick() {
    if (chessgroundRef.current) {
      const nextMoveIndex = currentMoveIndex + 1;
      setCurrentMoveIndex(nextMoveIndex);
      const currentMove = moves[nextMoveIndex];

      if (!currentMove) return;

      const result = toDests(new Chess(currentMove.fen));
      const newConfig = {
        ...currentMove,
        movable: {
          free: false,
          dests: result.dests,
          showDests: true
        }
      };
      chessgroundRef.current.set(newConfig);
    }
  }

  function handlePreviousButtonClick() {
    if (chessgroundRef.current) {
      const previousMoveIndex = Math.max(0, currentMoveIndex - 1);
      setCurrentMoveIndex(Math.max(0, currentMoveIndex - 1));
      const currentMove = moves[previousMoveIndex];

      if (!currentMove) return;


      chessgroundRef.current.set(currentMove);
    }
  }

  function handleBackToGameClick() {
    send('BACK');
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

      {
        state.matches('results') && (
          <div className="sm:px-6">
            <div className="mb-6">
              <p className="text-xl flex items-center">
                You played Qh1.
              </p>
              <span className="text-teal-400 text-sm">{state.context.userEval}</span>
            </div>

            <div className="mb-6">
              <p className="text-xl flex items-center">
                Text move is Qh1.
              </p>
              <span className="text-teal-400 text-sm">{state.context.masterEval}</span>
            </div>

            <button
              className="px-6 h-12 uppercase font-semibold tracking-wider border-2 border-black border-b-4 border-r-4 bg-teal-400 text-black shadow-xl enabled:hover:shadow-sm enabled:hover:border-b-2 enabled:hover:border-r-2 disabled:opacity-50"
              onClick={handleBackToGameClick}
            >Back to game</button>
          </div>
        )
      }

      {(state.matches('ready') || state.matches('loading')) && (
        <div className="flex-auto sm:px-6">
          <p className="text-xl">Play the best move.</p>
          <button onClick={handlePreviousButtonClick}>Previous</button>
          <button onClick={handleNextButtonClick}>Next</button>
          {state.matches('loading') && (
            <div className="animate-pulse my-6 w-full sm:w-1/2">
              <p>⏳ Loading...</p>
            </div>
          )}
        </div>
      )}
    </div>
  </div>
  );
}