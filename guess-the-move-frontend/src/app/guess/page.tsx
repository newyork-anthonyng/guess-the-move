'use client';

import Script from 'next/script';
import { useCallback, useEffect, useRef } from 'react';
import { useMachine } from '@xstate/react';
import evaluateMachine from './machine';

import { Chess, Square } from 'chess.js';

import { makeUci } from 'chessops';
import { makeFen } from 'chessops/fen';
import { parsePgn, makePgn, startingPosition, transform } from 'chessops/pgn';
import { parseSan, makeSanAndPlay } from 'chessops/san';
import { scalachessCharPair } from 'chessops/compat';

import { Chessground } from 'chessground';
import { Api } from 'chessground/api';
import { uciToMove } from 'chessground/util';
import { Config } from 'chessground/config';
import 'chessground/assets/chessground.base.css';
import 'chessground/assets/chessground.brown.css';
import 'chessground/assets/chessground.cburnett.css';

import { initialSquares } from './utils';

const INITIAL_FEN = `rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1`;

interface ChessMove {
  to: string
};

function toDests(chess: Chess) {
  const destinations = new Map();
  
  initialSquares.forEach(s => {
    const square = s as Square;
    const ms = chess.moves({ square, verbose: true });
    if (ms.length) destinations.set(s, ms.map((m: ChessMove) => m.to));
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

interface CustomChessConfig extends Config {
  san: string
}

function getMovesFromPgn(pgn: string): CustomChessConfig[]  {
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
        uci,
        lastMove
      };
    });

    const movesArray = Array.from(game.moves.mainline());
    movesArray.unshift(initialPosition);
    return movesArray as CustomChessConfig[];
}

const moves = getMovesFromPgn(SAMPLE_PGN);

export default function Guess() {
  const chessboardDivRef = useRef<HTMLDivElement>(null);
  const chessgroundRef = useRef<Api>();
  const [state, send] = useMachine(evaluateMachine, {
    actions: {
      updateChessboard: (context) => {
        if (chessgroundRef.current) {
          const currentMove = moves[context.currentMoveIndex];

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
    }
  });
  const applesauceRef = useRef(state.context.currentMoveIndex);

  const applesauce = useCallback(() => {
    console.group('applesauce:::')
    console.log('from state', state.context.currentMoveIndex)
    console.log('from context', applesauceRef.current);
    console.groupEnd();
  }, [state.context.currentMoveIndex]);

  useEffect(() => {
    applesauceRef.current = state.context.currentMoveIndex;
  }, [state.context.currentMoveIndex]);

  useEffect(() => {
    const $div = chessboardDivRef.current;
    const chess = new Chess(INITIAL_FEN);

    if ($div) {
      const result = toDests(chess);
      chessgroundRef.current = Chessground($div, {
        movable: {
          free: false,
          dests: result.dests,
          showDests: true
        },
        events: {
          move: () => {
            const playerFen = chessgroundRef.current && chessgroundRef.current.getFen() || '';
            // const nextMoveIndex = state.context.currentMoveIndex + 1;
            const nextMoveIndex = applesauceRef.current + 1;
            const masterGameState = moves[nextMoveIndex];
            const masterFen = masterGameState.fen || '';
            // applesauce();
            // console.log(nextMoveIndex, applesauceRef.current);
            send("MOVE", {
              masterFen,
              userFen: playerFen
            });
          }
        }
        
      });
    }
  }, []);

  function handleBackToGameClick() {
    send('BACK');
  }

  return (
    <>
      {/* <Script
        src="/stockfish.js"
        strategy="lazyOnload"
        onLoad={() => {
          console.log('stockfish.js loaded');
        }}
      ></Script> */}
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
                    Your move&apos;s evaluation is:
                  </p>
                  <span className="text-teal-400 text-sm">{state.context.userEval}</span>
                </div>

                <div className="mb-6">
                  <p className="text-xl flex items-center">
                    In the game, they played {moves[state.context.currentMoveIndex + 1]?.san}.
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

          {state.matches('ready') && (
            <div className="flex-auto sm:px-6">
              <p className="text-xl">Play the best move.</p>
            </div>
          )}

          {state.matches('loading') && (
            <div className="flex-auto sm:px-6">
              <p className="text-xl">Play the best move.</p>
              {state.matches('loading') && (
                <div className="animate-pulse my-6 w-full sm:w-1/2">
                  <p>⏳ Loading...</p>
                </div>
              )}
            </div>
          )}

          {state.matches('opponentIsPlaying') && (
            <div className="animate-pulse my-6 w-full sm:w-1/2">
              <p>⏳ Playing opponent&apos;s move...</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}