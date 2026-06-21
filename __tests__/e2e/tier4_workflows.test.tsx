import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import App from '../../App';

const getTextContent = (element: any): string => {
  if (!element) return '';
  if (typeof element === 'string') return element;
  if (typeof element === 'number') return String(element);
  if (Array.isArray(element)) return element.map(getTextContent).join('');
  if (element.props) {
    if (element.props.children !== undefined) {
      return getTextContent(element.props.children);
    }
    if (element.props.value !== undefined) {
      return String(element.props.value);
    }
  }
  return '';
};

describe('Tier 4: Real-World Scenarios', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    jest.clearAllMocks();
  });

  test('TC-4.1: Happy Path Budgeting', async () => {
    const { getByLabelText, getAllByLabelText } = render(<App />);

    // 1. Initial launch
    await waitFor(() => {
      expect(getByLabelText('empty-state-text')).toBeTruthy();
    });

    // 2. Add Salary
    fireEvent.changeText(getByLabelText('amount-input'), '4000.00');
    fireEvent.changeText(getByLabelText('description-input'), 'Salary');
    fireEvent.press(getByLabelText('type-toggle-income'));
    fireEvent.press(getByLabelText('category-option-Salary'));
    fireEvent.press(getByLabelText('add-transaction-button'));

    // Check totals
    await waitFor(() => {
      expect(getTextContent(getByLabelText('total-balance'))).toBe('+$4,000.00');
      expect(getTextContent(getByLabelText('total-income'))).toBe('+$4,000.00');
      expect(getTextContent(getByLabelText('total-expense'))).toBe('$0.00');
    });

    // 3. Add Rent
    fireEvent.changeText(getByLabelText('amount-input'), '1500.00');
    fireEvent.changeText(getByLabelText('description-input'), 'Rent');
    fireEvent.press(getByLabelText('type-toggle-expense'));
    fireEvent.press(getByLabelText('category-option-Rent'));
    fireEvent.press(getByLabelText('add-transaction-button'));

    await waitFor(() => {
      expect(getTextContent(getByLabelText('total-balance'))).toBe('+$2,500.00');
    });

    // 4. Add Groceries
    fireEvent.changeText(getByLabelText('amount-input'), '200.00');
    fireEvent.changeText(getByLabelText('description-input'), 'Groceries');
    fireEvent.press(getByLabelText('type-toggle-expense'));
    fireEvent.press(getByLabelText('category-option-Food'));
    fireEvent.press(getByLabelText('add-transaction-button'));

    // Check totals ($2,300 balance, Rent 88.2%, Groceries 11.8% of expenses)
    await waitFor(() => {
      expect(getTextContent(getByLabelText('total-balance'))).toBe('+$2,300.00');
      expect(getTextContent(getByLabelText('total-income'))).toBe('+$4,000.00');
      expect(getTextContent(getByLabelText('total-expense'))).toBe('-$1,700.00');
    });

    // Check chart percentages
    const chartText = getTextContent(getByLabelText('category-chart'));
    expect(chartText).toContain('Rent: 88.2%');
    expect(chartText).toContain('Food: 11.8%');
    // Ensure Groceries text matches too
    expect(chartText).toContain('Groceries: 11.8%');

    // Check chronological list (Groceries, then Rent, then Salary)
    const items = getAllByLabelText('transaction-item-desc');
    expect(getTextContent(items[0])).toBe('Groceries');
    expect(getTextContent(items[1])).toBe('Rent');
    expect(getTextContent(items[2])).toBe('Salary');
  });

  test('TC-4.2: Deficit Spending', async () => {
    const { getByLabelText } = render(<App />);

    // Add Expense $100
    fireEvent.changeText(getByLabelText('amount-input'), '100.00');
    fireEvent.changeText(getByLabelText('description-input'), 'Coffee & snack');
    fireEvent.press(getByLabelText('type-toggle-expense'));
    fireEvent.press(getByLabelText('category-option-Food'));
    fireEvent.press(getByLabelText('add-transaction-button'));

    await waitFor(() => {
      expect(getTextContent(getByLabelText('total-balance'))).toBe('-$100.00');
    });

    // Add Expense $50
    fireEvent.changeText(getByLabelText('amount-input'), '50.00');
    fireEvent.changeText(getByLabelText('description-input'), 'Gas');
    fireEvent.press(getByLabelText('type-toggle-expense'));
    fireEvent.press(getByLabelText('category-option-Transport'));
    fireEvent.press(getByLabelText('add-transaction-button'));

    await waitFor(() => {
      expect(getTextContent(getByLabelText('total-balance'))).toBe('-$150.00');
    });

    // Add Income $200
    fireEvent.changeText(getByLabelText('amount-input'), '200.00');
    fireEvent.changeText(getByLabelText('description-input'), 'Refund');
    fireEvent.press(getByLabelText('type-toggle-income'));
    fireEvent.press(getByLabelText('category-option-Other'));
    fireEvent.press(getByLabelText('add-transaction-button'));

    await waitFor(() => {
      expect(getTextContent(getByLabelText('total-balance'))).toBe('+$50.00');
    });
  });

  test('TC-4.3: App Crash/Reload Session Continuity', async () => {
    // 1. Mount App initially and seed a transaction
    const { getByLabelText, unmount } = render(<App />);

    fireEvent.changeText(getByLabelText('amount-input'), '120.00');
    fireEvent.changeText(getByLabelText('description-input'), 'Initial item');
    fireEvent.press(getByLabelText('type-toggle-income'));
    fireEvent.press(getByLabelText('category-option-Other'));
    fireEvent.press(getByLabelText('add-transaction-button'));

    await waitFor(() => {
      expect(getTextContent(getByLabelText('transaction-item-desc'))).toBe('Initial item');
      expect(getTextContent(getByLabelText('total-balance'))).toBe('+$120.00');
    });

    // 2. Unmount the app to simulate "app exit/crash"
    unmount();

    // 3. Re-mount the app
    const { getByLabelText: getByLabelTextReloaded } = render(<App />);

    // Verify same transactions and balance are loaded from AsyncStorage
    await waitFor(() => {
      expect(getTextContent(getByLabelTextReloaded('transaction-item-desc'))).toBe('Initial item');
      expect(getTextContent(getByLabelTextReloaded('total-balance'))).toBe('+$120.00');
    });
  });
});
