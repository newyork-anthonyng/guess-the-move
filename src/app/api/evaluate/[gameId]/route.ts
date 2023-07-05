import { NextResponse } from 'next/server'

const API_URL = `${process.env.CHESS_EVAL_BACKEND_BASE_URL}/evaluate_move`
export async function POST(request: Request, context: { params: { gameId: string }}) {
  const body = await request.json();
  const { uci } = body;

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      game_id: context.params.gameId,
      user_move: uci
    })
  });
  const data = await res.json();
  /*
    Sample response from API
    {
      "avg_difference": 15.25,
      "blunder": false,
      "blunder_count": 0.01394780967916387,
      "current_difference": 19,
      "eval_pro": 46,
      "eval_user": 27,
      "game_end": false,
      "inaccuracy": false,
      "mistake": false,
      "pgn": "[Event \"?\"]\n[Site \"?\"]\n[Date \"????.??.??\"]\n[Round \"?\"]\n[White \"?\"]\n[Black \"?\"]\n[Result \"1/2-1/2\"]\n\n1. e4 ( 1. d4 ) 1... e5 2. Nf3 ( 2. d4 ) 2... Nc6 3. Bb5 ( 3. d4 ) 3... a6 4.\nBa4 Nf6 1/2-1/2",
      "win_chances": 0.05394757314982912
    }
  */
 const { eval_pro, eval_user } = data;
 const masterEval = eval_pro / 100;
 const userEval = eval_user / 100;

  if (data.eval_pro) {
    return NextResponse.json({
      ok: true,
      masterEval,
      userEval
    })
  }

  return NextResponse.json({ ok: false })
}