import { render, screen, fireEvent } from '@testing-library/react';
import Page from '../src/app/guess/page';
import '@testing-library/jest-dom'
import { expect } from '@jest/globals';

it('should render chess board', () => {
  const { container } = render(<Page />);

  const $board = container.querySelector('cg-board');
  expect($board).not.toBeNull();

  expect($board?.querySelectorAll('.black.rook').length).toEqual(2);
  expect($board?.querySelectorAll('.black.knight').length).toEqual(2);
  expect($board?.querySelectorAll('.black.bishop').length).toEqual(2);
  expect($board?.querySelectorAll('.black.king').length).toEqual(1);
  expect($board?.querySelectorAll('.black.queen').length).toEqual(1);
  expect($board?.querySelectorAll('.black.pawn').length).toEqual(8);

  expect($board?.querySelectorAll('.white.rook').length).toEqual(2);
  expect($board?.querySelectorAll('.white.knight').length).toEqual(2);
  expect($board?.querySelectorAll('.white.bishop').length).toEqual(2);
  expect($board?.querySelectorAll('.white.king').length).toEqual(1);
  expect($board?.querySelectorAll('.white.queen').length).toEqual(1);
  expect($board?.querySelectorAll('.white.pawn').length).toEqual(8);
});

it.todo('should allow user to guess the current move of the game');

it.todo('should allow user to see the master move');
