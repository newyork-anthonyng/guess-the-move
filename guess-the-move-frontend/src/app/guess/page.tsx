"use client";

import { useEffect, useRef } from "react";
import { useMachine } from "@xstate/react";
import { useRouter } from "next/navigation";
import gameMachine from "./machine";

import { Chess, Square } from "chess.js";

import { makeUci } from "chessops";
import { makeFen } from "chessops/fen";
import { parsePgn, makePgn, startingPosition, transform } from "chessops/pgn";
import { parseSan, makeSanAndPlay } from "chessops/san";
import { scalachessCharPair } from "chessops/compat";

import { Chessground } from "chessground";
import { Api } from "chessground/api";
import { uciToMove } from "chessground/util";
import { Config } from "chessground/config";
import "chessground/assets/chessground.base.css";
import "chessground/assets/chessground.brown.css";
import "chessground/assets/chessground.cburnett.css";
import WaitForMsw from '../../library/WaitForMsw';

import { initialSquares } from "./utils";
import GuessTheMoveChessboard from "./GuessTheMoveChessboard";

const INITIAL_FEN = `rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1`;

interface ChessMove {
  to: string;
}

function toDests(chess: Chess) {
  const destinations = new Map();

  initialSquares.forEach((s) => {
    const square = s as Square;
    const ms = chess.moves({ square, verbose: true });
    if (ms.length)
      destinations.set(
        s,
        ms.map((m: ChessMove) => m.to)
      );
  });

  const color = chess.turn() === "w" ? "white" : "black";

  return {
    color,
    dests: destinations,
    free: false,
  };
}

function Guess({ searchParams }) {
  console.group('Guess props');
  console.log(searchParams);
  console.groupEnd();

  const router = useRouter();
  const childRef = useRef({})
  const [state, send] = useMachine(gameMachine, {
    context: {
      currentMoveIndex: 0,
      masterEval: null,
      userEval: null,
      masterFen: "",
      userFen: "",
      userPlayedMove: "",
      // moves: getMovesFromPgn(SAMPLE_PGN),
      moves: null,
      gameId: searchParams?.gameId
    },
    actions: {
      goToResults: () => {
        router.push("/results");
      },
      applesauce: (context, event) => {
        console.log('parent app: applesauce');
        console.log(event);
        if (childRef.current.updateChessboard) {
          childRef.current.updateChessboard(event.data.currentMoveIndex);
        }
      }
    },
  });

  // console.group('******** guess-the-move');
  // console.log(state.children.guessTheMove);
  // console.groupEnd();

  return (
    <div className="p-6 font-mono">
      <div className="relative flex flex-wrap items-baseline pb-6 before:bg-black before:absolute before:-top-6 before:bottom-0 before:-left-60 before:-right-6">
        <h1 className="flex-none font-semibold mb-2 relative text-2xl text-white w-full">
          Guess the move
        </h1>
      </div>

      <pre className="block">Parent application: {JSON.stringify(state.value, null, 2)}</pre>

      {state.matches('loadingGame') && <p>Loading</p>}
      {state.matches('loadingGame.error.gameDoesNotExist') && <p>Game does not exist</p>}
      {state.matches('ready') && <GuessTheMoveChessboard service={state.children.guessTheMove} childRef={childRef} />}
    </div>
  );
}

const shouldUseMsw = process.env.NODE_ENV === 'development';
export default shouldUseMsw ? WaitForMsw(Guess) : Guess;