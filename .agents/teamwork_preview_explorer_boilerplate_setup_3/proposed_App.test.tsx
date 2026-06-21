import React from 'react';
import { render, screen } from '@testing-library/react-native';
import App from './App';

describe('App Component', () => {
  it('renders correctly and matches snapshot', () => {
    const { toJSON } = render(<App />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('contains the welcome title', () => {
    render(<App />);
    const titleElement = screen.getByText('Welcome to NeonBudget');
    expect(titleElement).toBeTruthy();
  });

  it('contains the description subtitle', () => {
    render(<App />);
    const subtitleElement = screen.getByText('Track your wealth with neon style');
    expect(subtitleElement).toBeTruthy();
  });

  it('renders the container view', () => {
    render(<App />);
    const container = screen.getByTestId('app-container');
    expect(container).toBeTruthy();
  });
});
