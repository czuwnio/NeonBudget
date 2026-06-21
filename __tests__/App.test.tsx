import React from 'react';
import { render } from '@testing-library/react-native';
import App from '../App';

describe('App', () => {
  it('renders app container and content', () => {
    const { getByTestId, getByText } = render(<App />);
    
    // Check that the main container and content views are rendered
    expect(getByTestId('app-container')).toBeTruthy();
    expect(getByTestId('app-content')).toBeTruthy();
    
    // Check for title and subtitle
    expect(getByText('NeonBudget')).toBeTruthy();
    expect(getByText('Track your wealth in neon light')).toBeTruthy();
    
    // Check for balance card
    expect(getByTestId('balance-card')).toBeTruthy();
    expect(getByText('CURRENT BALANCE')).toBeTruthy();
    expect(getByTestId('balance-value')).toHaveTextContent('$0.00');
  });
});
