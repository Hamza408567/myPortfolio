import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import Projects from './Projects';

jest.mock('framer-motion', () => {
  const React = require('react');
  const element = tag => ({ children, initial, whileInView, viewport, transition, variants, whileHover, whileTap, ...props }) => React.createElement(tag, props, children);
  return { motion: { div: element('div'), a: element('a') } };
});

test('adds all three supplied store links while retaining the existing projects', () => {
  render(<Projects />);
  expect(screen.getAllByRole('link')).toHaveLength(12);
  expect(screen.getAllByRole('link').slice(-3).map(card => card.getAttribute('aria-label'))).toEqual([
    'Download Ants & Cubes on Google Play',
    'Download Plant Revive on Google Play',
    'Download Find Toy on Google Play',
  ]);
  [
    ['Ants & Cubes', 'com.BangerGames_AntsCubes'],
    ['Plant Revive', 'com.BangerGames.PlanRevive.com'],
    ['Find Toy', 'www.BangerGames.FindToy.com'],
  ].forEach(([name, id]) => {
    const card = screen.getByRole('link', { name: `Download ${name} on Google Play` });
    expect(card).toHaveAttribute('href', `https://play.google.com/store/apps/details?id=${id}`);
    expect(card).toHaveAttribute('rel', 'noopener noreferrer');
    expect(card).toHaveTextContent('Download on Google Play');
  });
});

test('new project artwork falls back gracefully when unavailable', () => {
  render(<Projects />);
  fireEvent.error(screen.getByRole('img', { name: 'Ants & Cubes' }));
  expect(screen.queryByRole('img', { name: 'Ants & Cubes' })).not.toBeInTheDocument();
  expect(screen.getByText('🐜')).toBeVisible();
  expect(screen.getByText('🧸')).toBeVisible();
});
