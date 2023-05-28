import Guess from "../src/app/guess/page";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import { expect } from "@jest/globals";
import { Chessground } from "chessground";
import { useRouter } from "next/navigation";

let config;
let mockGetFen = jest.fn();
let mockSet = jest.fn(a => config = { ...config, ...a });

jest.mock("chessground", () => ({
  Chessground: jest.fn(($div, _config) => {
    config = _config;

    return {
      getFen: mockGetFen,
      set: mockSet
    }
  })
}));

let mockRouter;
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

beforeEach(() => {
  mockRouter = {
    push: jest.fn()
  }
  useRouter.mockReturnValue(mockRouter);
});

it('should render error if game is invalid', async () => {
  render(<Guess searchParams={{ gameId: 'invalid' }} />);

  await screen.findByText(/game does not exist/i);
});

it.only("should set up chessground correctly", () => {
  render(<Guess />);

  expect(Chessground).toHaveBeenCalledTimes(1);
  expect(Chessground.mock.calls[0][1]).toMatchSnapshot();
});

it("should show evaluation after playing a move", async () => {
  render(<Guess />);

  // play e4
  mockGetFen.mockImplementationOnce(() => 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR');
  config.events.move();

  await screen.findByText(/your move's evaluation is:/i);
  await screen.findByText('-1');
  await screen.findByText(/in the game, they played/i);
  await screen.findByText('+1');

  let $backButton = screen.getByRole('button', { name: /back/i });
  await userEvent.click($backButton);

  expect(mockSet).toHaveBeenCalledTimes(1);
  expect(mockSet.mock.calls[0][0]).toMatchSnapshot();

  expect(screen.queryByText(/your move's evaluation is:/i)).toBeNull();
  expect(screen.queryByText(/in the game, they played/i)).toBeNull();
  await screen.findByText(/play the best move/i);

  expect(mockSet).toHaveBeenCalledTimes(2);
  expect(mockSet.mock.calls[1][0]).toMatchSnapshot();

  // play Nf3
  mockGetFen.mockImplementationOnce(() => 'rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R');
  config.events.move();

  await screen.findByText(/your move's evaluation is:/i);
  await screen.findByText('-2');
  await screen.findByText(/in the game, they played/i);
  await screen.findByText('+2');

  $backButton = screen.getByRole('button', { name: /back/i });
  await userEvent.click($backButton);

  expect(mockSet).toHaveBeenCalledTimes(3);
  expect(mockSet.mock.calls[2][0]).toMatchSnapshot();

  expect(screen.queryByText(/your move's evaluation is:/i)).toBeNull();
  expect(screen.queryByText(/in the game, they played/i)).toBeNull();
  await screen.findByText(/play the best move/i);

  expect(mockSet).toHaveBeenCalledTimes(4);
  expect(mockSet.mock.calls[3][0]).toMatchSnapshot();

  // play Bc4
  mockGetFen.mockImplementationOnce(() => 'r1bqkbnr/pppp1ppp/2n5/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR');
  config.events.move();

  await screen.findByText(/your move's evaluation is:/i);
  await screen.findByText('-3');
  await screen.findByText(/in the game, they played/i);
  await screen.findByText('+3');

  $backButton = screen.getByRole('button', { name: /back/i });
  await userEvent.click($backButton);

  expect(mockSet).toHaveBeenCalledTimes(5);
  expect(mockSet.mock.calls[4][0]).toMatchSnapshot();

  expect(screen.queryByText(/your move's evaluation is:/i)).toBeNull();
  expect(screen.queryByText(/in the game, they played/i)).toBeNull();
  await screen.findByText(/play the best move/i);

  expect(mockSet).toHaveBeenCalledTimes(6);
  expect(mockSet.mock.calls[5][0]).toMatchSnapshot();

  // play Qxf7#
  mockGetFen.mockImplementationOnce(() => 'r1bqkbnr/pppp1Qp1/2n4p/4p3/2B1P3/8/PPPP1PPP/RNB1K1NR');
  config.events.move();

  await screen.findByText(/your move's evaluation is:/i);
  await screen.findByText('-4');
  await screen.findByText(/in the game, they played/i);
  await screen.findByText('+4');

  $backButton = screen.getByRole('button', { name: /back/i });
  await userEvent.click($backButton);

  const $finishButton = screen.getByRole('button', { name: /finish/i });
  await userEvent.click($finishButton);

  expect(mockRouter.push).toHaveBeenCalledTimes(1); 
  expect(mockRouter.push.mock.calls[0][0]).toEqual('/results'); 
});
