import { rest } from 'msw'

export const handlers = [
  rest.post('/game', async (req, res, ctx) => {
    const body = await req.json();
    if (body.pgn === '1. e4') {
      return res(
        ctx.status(200),
        ctx.json({
          ok: false
        })
      )
    }

    return res(
      ctx.status(200),
      ctx.json({
        ok: true,
        gameId: '42'
      })
    )
  }),
]