import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Page from '../src/app/import/page';
import '@testing-library/jest-dom'
import { useRouter } from "next/navigation"

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}))

const mockPush = jest.fn(() => Promise.resolve(true));

beforeAll(() => {
  (useRouter as jest.Mock).mockReturnValue({
    asPath: '/',
    query: {},
    push: mockPush,
    prefetch: () => Promise.resolve(true)
  });
});

beforeEach(() => {
  mockPush.mockClear();
});

it('should redirect user to next page if pgn is valid', async () => {
  render(<Page />);

  const $textArea = screen.getByRole('textbox', { name: /chess pgn/i });
  const validPgn = `1.e4 e5 2.Nf3 d6 3.d4 Bg4 4.dxe5 Bxf3 5.Qxf3 dxe5 6.Bc4 Nf6 7.Qb3 Qe7 8.Nc3 c6 9.Bg5 b5 10.Nxb5 cxb5 11.Bxb5+ Nbd7 12.O-O-O Rd8 13.Rxd7 Rxd7 14.Rd1 Qe6 15.Bxd7+ Nxd7 16.Qb8+ Nxb8 17.Rd8# 1-0`;
  fireEvent.change($textArea, { target: { value: validPgn }});

  const $submitButton = screen.getByRole('button', { name: /submit/i });
  fireEvent.click($submitButton);

  const $error = screen.queryByText(/please add a valid pgn/i);
  expect($error).toBeNull();

  await waitFor(() => {
    expect(screen.queryByText(/submitting/i)).not.toBeInTheDocument()
  })

  expect(mockPush).toHaveBeenCalledWith('/guess/42');
});

it('should make API call with correct color', async () => {
  jest.spyOn(global, 'fetch');
  render(<Page />);

  const $addSamplePgnButton = screen.getByRole('button', { name: /add sample chess pgn/i });
  fireEvent.click($addSamplePgnButton); 

  const $colorToggle = screen.getByRole('checkbox', { name: /Play as white/i });
  fireEvent.click($colorToggle);
  screen.getByText(/Play as black/i); 

  const $submitButton = screen.getByRole('button', { name: /submit/i });
  fireEvent.click($submitButton);

  expect(global.fetch).toHaveBeenCalledTimes(1);
  
  const body = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body);
  expect(body.color).toEqual('black');
});

it('should add sample chess pgn', async () => {
  render(<Page />);

  const $addSamplePgnButton = screen.getByRole('button', { name: /add sample chess pgn/i });
  fireEvent.click($addSamplePgnButton);

  const $textArea = screen.getByRole('textbox', { name: /chess pgn/i });
  const samplePgn = `1.e4 e5 2.Nf3 d6 3.d4 Bg4 4.dxe5 Bxf3 5.Qxf3 dxe5 6.Bc4 Nf6 7.Qb3 Qe7 8.Nc3 c6 9.Bg5 b5 10.Nxb5 cxb5 11.Bxb5+ Nbd7 12.O-O-O Rd8 13.Rxd7 Rxd7 14.Rd1 Qe6 15.Bxd7+ Nxd7 16.Qb8+ Nxb8 17.Rd8# 1-0`;
  expect(($textArea as HTMLInputElement).value).toEqual(samplePgn);

  const $submitButton = screen.getByRole('button', { name: /submit/i });
  fireEvent.click($submitButton);

  await waitFor(() => {
    expect(screen.queryByText(/submitting/i)).not.toBeInTheDocument()
  })

  expect(mockPush).toHaveBeenCalledWith('/guess/42');
});

it('should allow user to toggle color', async () => {
  render(<Page />);

  const $addSamplePgnButton = screen.getByRole('button', { name: /add sample chess pgn/i });
  fireEvent.click($addSamplePgnButton); 

  const $colorToggle = screen.getByRole('checkbox', { name: /Play as white/i });
  fireEvent.click($colorToggle);
  screen.getByText(/Play as black/i);

  fireEvent.click($colorToggle);
  screen.getByText(/Play as white/i);
});

it('should show error if pgn is not valid', () => {
  render(<Page />);

  let $error = screen.queryByText(/please add a valid pgn/i);
  expect($error).toBeNull();

  const $textArea = screen.getByRole('textbox', { name: /chess pgn/i });
  const invalidPgn = 'not valid pgn';
  fireEvent.change($textArea, { target: { value: invalidPgn }});
  const $submitButton = screen.getByRole('button', { name: /submit/i });
  fireEvent.click($submitButton);

  $error = screen.getByText(/please add a valid pgn/i);
  expect(mockPush).not.toHaveBeenCalled();

  const anotherInvalidPgn = 'not valid pgn 1';
  fireEvent.change($textArea, { target: { value: anotherInvalidPgn }});
  fireEvent.click($submitButton);
  $error = screen.getByText(/please add a valid pgn/i);
  expect(mockPush).not.toHaveBeenCalled();

  const validPgn = `1.e4 e5 2.Nf3 d6 3.d4 Bg4 4.dxe5 Bxf3 5.Qxf3 dxe5 6.Bc4 Nf6 7.Qb3 Qe7 8.Nc3 c6 9.Bg5 b5 10.Nxb5 cxb5 11.Bxb5+ Nbd7 12.O-O-O Rd8 13.Rxd7 Rxd7 14.Rd1 Qe6 15.Bxd7+ Nxd7 16.Qb8+ Nxb8 17.Rd8# 1-0`;
  fireEvent.change($textArea, { target: { value: validPgn }});
  fireEvent.click($submitButton);

  $error = screen.queryByText(/please add a valid pgn/i);
  expect($error).toBeNull();
});

it('should show error if pgn is empty', () => {
  render(<Page />);

  const $textArea = screen.getByRole('textbox', { name: /chess pgn/i });
  const emptyPgn = '';
  fireEvent.change($textArea, { target: { value: emptyPgn }});

  const $submitButton = screen.getByRole('button', { name: /submit/i });
  fireEvent.click($submitButton);

  screen.getByText(/please add a valid pgn/i);
  expect(mockPush).not.toHaveBeenCalled();
});
