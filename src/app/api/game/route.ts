import { NextResponse } from 'next/server'

const API_URL = `${process.env.CHESS_EVAL_BACKEND_BASE_URL}/validate_pgn`
export async function POST(request: Request) {
  const body = await request.json();
  const { pgn, color } = body;

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      pgn,
      color
    })
  });
  const data = await res.json();

  if (data.id) {
    return NextResponse.json({ ok: true, gameId: data.id })
  }

  return NextResponse.json({ ok: false })
}