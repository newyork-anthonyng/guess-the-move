import { render } from '@testing-library/react';
import Page from '../src/app/guess/[gameId]/page';
import '@testing-library/jest-dom'

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}))

let config: any;
let mockGetFen = jest.fn();
let mockSet = jest.fn(a => config = { ...config, ...a });

jest.mock("chessground", () => ({
  Chessground: jest.fn(($div, _config: any) => {
    config = _config;

    return {
      getFen: mockGetFen,
      set: mockSet
    }
  })
}));

it('should redirect user to next page if pgn is valid', async () => {
  const props = {
    params: {
      gameId: '42'
    }
  };
  render(<Page {...props} />);
});
