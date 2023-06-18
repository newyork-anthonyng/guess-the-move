import Results from "../src/app/results/page";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

it('should render results', async () => {
  render(<Results />);

  await screen.findByText(3);
  await screen.findByText(/inaccuracies/i);

  await screen.findByText(2);
  await screen.findByText(/mistakes/i);

  await screen.findByText(1);
  await screen.findByText(/blunder/i);

  await screen.findByText(37);
  await screen.findByText(/average centipawn loss/i);
});

it.todo('should render error if game has not finished');