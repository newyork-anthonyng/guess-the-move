import { render, screen, waitFor } from '@testing-library/react';
import Page from '../src/app/results/[gameId]/page';
import '@testing-library/jest-dom'

it('should render results with correct wording for "1" values', async () => {
  const props = {
    params: {
      gameId: '1'
    }
  }
  render(<Page {...props} />);

  await waitFor(() => {
    expect(screen.queryByText(/loading/i)).not.toBeInTheDocument()
  })

  screen.getByLabelText(/1 inaccuracy$/i);
  screen.getByLabelText(/1 mistake$/i);
  screen.getByLabelText(/1 blunder$/i);
  screen.getByLabelText(/1 average centipawn loss$/i);
});

it('should render results with correct wording for all other values', async () => {
  const props = {
    params: {
      gameId: '2'
    }
  }
  render(<Page {...props} />);

  await waitFor(() => {
    expect(screen.queryByText(/loading/i)).not.toBeInTheDocument()
  })

  screen.getByLabelText(/2 inaccuracies$/i);
  screen.getByLabelText(/2 mistakes$/i);
  screen.getByLabelText(/2 blunders$/i);
  screen.getByLabelText(/2 average centipawn loss$/i);
});