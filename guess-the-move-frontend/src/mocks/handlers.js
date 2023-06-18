import { rest } from 'msw'

const DELAY = process.NODE_ENV === 'test' ? 0 : 200;

const SAMPLE_PGN = `1.e4 e5 2.Qh5 Nc6 3.Bc4 h6 4.Qxf7# 1-0`;
const GAME_ID = 'abc-123';

const getEvaluations = () => {
  const evaluations = [
    { ok: true, masterEval: '+1', userEval: '-1' },
    { ok: true, masterEval: '+2', userEval: '-2' },
    { ok: true, masterEval: '+3', userEval: '-3' },
    { ok: true, masterEval: '+4', userEval: '-4' },
  ];
  let currentIndex = 0;

  const next = () => {
    return evaluations[currentIndex++];
  };

  return {
    next
  };
}
const evaluations = getEvaluations();

export const handlers = [
  rest.post('/api/import', async (req, res, ctx) => {
    const data = await req.json();
    const pgn = data?.pgn || '';

    const isInvalidPgn = pgn.toLowerCase().indexOf('invalid') >= 0;
    const isPgnEmpty = pgn.trim().length === 0;
    if (isInvalidPgn || isPgnEmpty) {
      return res(
        ctx.delay(DELAY),
        ctx.status(200),
        ctx.json({
          ok: false
        })
      );
    }

    return res(
      ctx.delay(DELAY),
      ctx.status(200),
      ctx.json({
        ok: true,
        gameId: GAME_ID
      })
    )
  }),

  rest.get('/api/games/:gameId', (req, res, ctx) => {
    const { gameId } = req.params;

    const isInvalidGameId = gameId !== GAME_ID;
    if (isInvalidGameId) {
      return res(
        ctx.delay(DELAY),
        ctx.status(200),
        ctx.json({ ok: false })
      )
    }

    return res(
      ctx.delay(DELAY),
      ctx.status(200),
      ctx.json({
        ok: true,
        pgn: SAMPLE_PGN
      })
    )
  }),

  rest.post('/api/evaluate', (req, res, ctx) => {
    return res(
      ctx.delay(DELAY),
      ctx.status(200),
      ctx.json(evaluations.next())
    )
  }),

  rest.get('/api/results', (req, res, ctx) => {
    return res(
      ctx.delay(DELAY),
      ctx.status(200),
      ctx.json({
        blunders: 1,
        mistakes: 2,
        inaccuracies: 3,
        averageCentipawnLoss: 37
      })
    )
  })
]