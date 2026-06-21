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

describe('Tier 3: Cross-Feature Combinations', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    jest.clearAllMocks();
  });

  test('TC-3.1: Add Transaction -> Storage Sync -> List update -> Dashboard recalculation', async () => {
    const setItemSpy = jest.spyOn(AsyncStorage, 'setItem');
    const { getByLabelText } = render(<App />);

    fireEvent.changeText(getByLabelText('amount-input'), '45.00');
    fireEvent.changeText(getByLabelText('description-input'), 'Groceries');
    fireEvent.press(getByLabelText('type-toggle-expense'));
    fireEvent.press(getByLabelText('category-option-Food'));
    fireEvent.press(getByLabelText('add-transaction-button'));

    // Verify storage write, list update, and dashboard recalculation
    await waitFor(() => {
      expect(setItemSpy).toHaveBeenCalled();
      expect(getTextContent(getByLabelText('transaction-item-desc'))).toBe('Groceries');
      expect(getTextContent(getByLabelText('total-balance'))).toBe('-$45.00');
    });
  });

  test('TC-3.2: Type-Toggle vs Category Sync', async () => {
    const { getByLabelText, queryByLabelText } = render(<App />);

    // 1. Toggle "Expense" -> "Salary" option should NOT be rendered
    fireEvent.press(getByLabelText('type-toggle-expense'));
    expect(queryByLabelText('category-option-Salary')).toBeNull();
    expect(getByLabelText('category-option-Food')).toBeTruthy();

    // 2. Toggle "Income" -> "Salary" option should be rendered, "Food" should NOT be rendered
    fireEvent.press(getByLabelText('type-toggle-income'));
    expect(getByLabelText('category-option-Salary')).toBeTruthy();
    expect(queryByLabelText('category-option-Food')).toBeNull();
  });

  test('TC-3.3: Dynamic Category Chart Updates', async () => {
    const { getByLabelText } = render(<App />);

    // Add Food expense
    fireEvent.changeText(getByLabelText('amount-input'), '20.00');
    fireEvent.changeText(getByLabelText('description-input'), 'Meal');
    fireEvent.press(getByLabelText('type-toggle-expense'));
    fireEvent.press(getByLabelText('category-option-Food'));
    fireEvent.press(getByLabelText('add-transaction-button'));

    await waitFor(() => {
      expect(getTextContent(getByLabelText('category-chart'))).toContain('Food: 100.0%');
    });

    // Add Transport expense of equal value ($20.00)
    fireEvent.changeText(getByLabelText('amount-input'), '20.00');
    fireEvent.changeText(getByLabelText('description-input'), 'Uber');
    fireEvent.press(getByLabelText('type-toggle-expense'));
    fireEvent.press(getByLabelText('category-option-Transport'));
    fireEvent.press(getByLabelText('add-transaction-button'));

    await waitFor(() => {
      const chartText = getTextContent(getByLabelText('category-chart'));
      expect(chartText).toContain('Food: 50.0%');
      expect(chartText).toContain('Transport: 50.0%');
    });
  });

  test('TC-3.4: Parallel State Submissions', async () => {
    const { getByLabelText, getAllByLabelText } = render(<App />);

    // Add first item rapidly
    fireEvent.changeText(getByLabelText('amount-input'), '10');
    fireEvent.changeText(getByLabelText('description-input'), 'Rapid 1');
    fireEvent.press(getByLabelText('type-toggle-expense'));
    fireEvent.press(getByLabelText('category-option-Other'));
    fireEvent.press(getByLabelText('add-transaction-button'));

    // Add second item immediately
    fireEvent.changeText(getByLabelText('amount-input'), '20');
    fireEvent.changeText(getByLabelText('description-input'), 'Rapid 2');
    fireEvent.press(getByLabelText('type-toggle-expense'));
    fireEvent.press(getByLabelText('category-option-Other'));
    fireEvent.press(getByLabelText('add-transaction-button'));

    // Wait and verify both items are preserved in state and rendered
    await waitFor(() => {
      const items = getAllByLabelText('transaction-item-desc');
      expect(items.length).toBe(2);
      expect(getTextContent(items[0])).toBe('Rapid 2');
      expect(getTextContent(items[1])).toBe('Rapid 1');
    });
  });
});
