import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import IslandViewer from './IslandViewer';
import { createIslandScene } from './islandScene';

jest.mock('./islandScene', () => ({ createIslandScene: jest.fn() }));
jest.mock('framer-motion', () => ({ useReducedMotion: () => true }));
let mockTheme = 'light';
jest.mock('../context/ThemeContext', () => ({ useTheme: () => ({ theme: mockTheme }) }));

let api, intersection, disconnect;
beforeEach(() => {
  mockTheme = 'light';
  disconnect = jest.fn();
  window.IntersectionObserver = jest.fn(callback => {
    intersection = callback;
    return { observe: jest.fn(), disconnect };
  });
  api = { dispose: jest.fn(), setVisible: jest.fn(), setReduced: jest.fn(), setNight: jest.fn(), act: jest.fn(), rotate: jest.fn(), zoom: jest.fn(), reset: jest.fn() };
  createIslandScene.mockReset().mockReturnValue(api);
});

test('initializes in daylight and displays direct-object interaction feedback', async () => {
  render(<IslandViewer />);
  await waitFor(() => expect(screen.getByRole('button', { name: 'Zoom in' })).toBeEnabled());
  expect(createIslandScene.mock.calls[0][1].reducedMotion).toBe(true);
  expect(createIslandScene.mock.calls[0][1].initialNight).toBe(false);
  expect(screen.getByRole('region', { name: 'Interactive floating island' })).toBeInTheDocument();
  expect(screen.queryByRole('heading')).not.toBeInTheDocument();
  expect(screen.queryByText('A SMALL ESCAPE')).not.toBeInTheDocument();
  expect(screen.queryByText('01 / EXPLORE')).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Day' })).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Cabin lights' })).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Rotate left' })).not.toBeInTheDocument();
  act(() => createIslandScene.mock.calls[0][1].onAction('Ripples across the pond.'));
  expect(screen.getByRole('status')).toHaveTextContent('Ripples across the pond.');
  fireEvent.click(screen.getByRole('button', { name: 'Zoom in' }));
  expect(api.zoom).toHaveBeenCalledWith(1);
});

test('suspends offscreen and disposes the scene on unmount', async () => {
  const { unmount } = render(<IslandViewer />);
  await waitFor(() => expect(createIslandScene).toHaveBeenCalled());
  act(() => intersection([{ isIntersecting: true }]));
  expect(api.setVisible).toHaveBeenLastCalledWith(true);
  act(() => intersection([{ isIntersecting: false }]));
  expect(api.setVisible).toHaveBeenLastCalledWith(false);
  unmount();
  expect(api.dispose).toHaveBeenCalledTimes(1);
  expect(disconnect).toHaveBeenCalledTimes(1);
});

test('shows an illustration and disables 3D controls when initialization fails', async () => {
  createIslandScene.mockImplementation(() => { throw new Error('WebGL unavailable'); });
  render(<IslandViewer />);
  expect(await screen.findByText(/Interactive 3D isn’t available/)).toBeVisible();
  expect(screen.getByRole('img', { name: /Illustration of a cozy cabin/ })).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Zoom in' })).not.toBeInTheDocument();
});

test('context loss replaces the canvas controls with the fallback', async () => {
  render(<IslandViewer />);
  await waitFor(() => expect(createIslandScene).toHaveBeenCalled());
  act(() => createIslandScene.mock.calls[0][1].onError());
  expect(screen.getByText(/Interactive 3D isn’t available/)).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Zoom in' })).not.toBeInTheDocument();
});

test('starts in the website theme and syncs lighting without rebuilding the scene', async () => {
  mockTheme = 'dark';
  const { rerender } = render(<IslandViewer />);
  await waitFor(() => expect(screen.getByRole('button', { name: 'Zoom in' })).toBeEnabled());
  expect(createIslandScene.mock.calls[0][1].initialNight).toBe(true);
  expect(screen.getByText('After hours')).toBeInTheDocument();
  mockTheme = 'light'; rerender(<IslandViewer />);
  expect(api.setNight).toHaveBeenLastCalledWith(false);
  expect(screen.getByText('Golden morning')).toBeInTheDocument();
  mockTheme = 'dark'; rerender(<IslandViewer />);
  expect(api.setNight).toHaveBeenLastCalledWith(true);
  expect(createIslandScene).toHaveBeenCalledTimes(1);
});
