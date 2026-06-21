import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import App from '../../App';

// Robust helper to extract text content from any rendered React Native element
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

describe('Tier 1: Feature Coverage', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    jest.clearAllMocks();
  });

  test('TC-1.1: Add Valid Expense', async () => {
    const { getByLabelText } = render(<App />);
    
    await waitFor(() => {
      expect(getByLabelText('empty-state-text')).toBeTruthy();
    });

    fireEvent.changeText(getByLabelText('amount-input'), '12.50');
    fireEvent.changeText(getByLabelText('description-input'), 'Lunch');
    fireEvent.press(getByLabelText('type-toggle-expense'));
    fireEvent.press(getByLabelText('category-option-Food'));
    fireEvent.press(getByLabelText('add-transaction-button'));

    await waitFor(() => {
      expect(getTextContent(getByLabelText('transaction-item-desc'))).toBe('Lunch');
      expect(getTextContent(getByLabelText('transaction-item-category'))).toBe('Food');
      expect(getTextContent(getByLabelText('transaction-item-amount'))).toBe('-$12.50');
    });

    expect(getTextContent(getByLabelText('total-balance'))).toBe('-$12.50');
    expect(getTextContent(getByLabelText('total-expense'))).toBe('-$12.50');
    expect(getTextContent(getByLabelText('total-income'))).toBe('$0.00');
  });

  test('TC-1.2: Add Valid Income', async () => {
    const { getByLabelText } = render(<App />);
    
    await waitFor(() => {
      expect(getByLabelText('empty-state-text')).toBeTruthy();
    });

    fireEvent.changeText(getByLabelText('amount-input'), '2500.00');
    fireEvent.changeText(getByLabelText('description-input'), 'Salary Payment');
    fireEvent.press(getByLabelText('type-toggle-income'));
    fireEvent.press(getByLabelText('category-option-Salary'));
    fireEvent.press(getByLabelText('add-transaction-button'));

    await waitFor(() => {
      expect(getTextContent(getByLabelText('transaction-item-desc'))).toBe('Salary Payment');
      expect(getTextContent(getByLabelText('transaction-item-category'))).toBe('Salary');
      expect(getTextContent(getByLabelText('transaction-item-amount'))).toBe('+$2,500.00');
    });

    expect(getTextContent(getByLabelText('total-balance'))).toBe('+$2,500.00');
    expect(getTextContent(getByLabelText('total-income'))).toBe('+$2,500.00');
    expect(getTextContent(getByLabelText('total-expense'))).toBe('$0.00');
  });

  test('TC-1.3: Form Inputs Reset', async () => {
    const { getByLabelText } = render(<App />);

    const amountInput = getByLabelText('amount-input');
    const descInput = getByLabelText('description-input');

    fireEvent.changeText(amountInput, '50.00');
    fireEvent.changeText(descInput, 'Gas');
    fireEvent.press(getByLabelText('type-toggle-expense'));
    fireEvent.press(getByLabelText('category-option-Transport'));
    fireEvent.press(getByLabelText('add-transaction-button'));

    await waitFor(() => {
      expect(amountInput.props.value).toBe('');
      expect(descInput.props.value).toBe('');
    });
  });

  test('TC-1.4: Category Assignment', async () => {
    const { getByLabelText } = render(<App />);

    fireEvent.changeText(getByLabelText('amount-input'), '15.00');
    fireEvent.changeText(getByLabelText('description-input'), 'Train Ticket');
    fireEvent.press(getByLabelText('type-toggle-expense'));
    fireEvent.press(getByLabelText('category-option-Transport'));
    fireEvent.press(getByLabelText('add-transaction-button'));

    await waitFor(() => {
      expect(getTextContent(getByLabelText('transaction-item-category'))).toBe('Transport');
    });
  });

  test('TC-1.5: Chronological Order', async () => {
    const { getByLabelText, getAllByLabelText } = render(<App />);

    // Add first item
    fireEvent.changeText(getByLabelText('amount-input'), '10.00');
    fireEvent.changeText(getByLabelText('description-input'), 'First Item');
    fireEvent.press(getByLabelText('type-toggle-expense'));
    fireEvent.press(getByLabelText('category-option-Other'));
    fireEvent.press(getByLabelText('add-transaction-button'));

    // Wait for the first item
    await waitFor(() => {
      expect(getTextContent(getAllByLabelText('transaction-item-desc')[0])).toBe('First Item');
    });

    // Add second item
    fireEvent.changeText(getByLabelText('amount-input'), '20.00');
    fireEvent.changeText(getByLabelText('description-input'), 'Second Item');
    fireEvent.press(getByLabelText('type-toggle-expense'));
    fireEvent.press(getByLabelText('category-option-Other'));
    fireEvent.press(getByLabelText('add-transaction-button'));

    // Verify chronological order (newest prepended first)
    await waitFor(() => {
      const items = getAllByLabelText('transaction-item-desc');
      expect(getTextContent(items[0])).toBe('Second Item');
      expect(getTextContent(items[1])).toBe('First Item');
    });
  });

  test('TC-1.6: Storage Persistence (Write)', async () => {
    const setItemSpy = jest.spyOn(AsyncStorage, 'setItem');
    const { getByLabelText } = render(<App />);

    fireEvent.changeText(getByLabelText('amount-input'), '100.00');
    fireEvent.changeText(getByLabelText('description-input'), 'Bonus');
    fireEvent.press(getByLabelText('type-toggle-income'));
    fireEvent.press(getByLabelText('category-option-Other'));
    fireEvent.press(getByLabelText('add-transaction-button'));

    await waitFor(() => {
      expect(setItemSpy).toHaveBeenCalled();
    });
  });

  test('TC-1.7: Storage Persistence (Read on Mount)', async () => {
    const seeded = [
      {
        id: '1',
        amount: 500,
        description: 'Freelance Design',
        type: 'income',
        category: 'Other',
        date: new Date().toISOString(),
      }
    ];
    await AsyncStorage.setItem('neon-budget-transactions', JSON.stringify(seeded));

    const { getByLabelText } = render(<App />);

    await waitFor(() => {
      expect(getTextContent(getByLabelText('transaction-item-desc'))).toBe('Freelance Design');
      expect(getTextContent(getByLabelText('transaction-item-amount'))).toBe('+$500.00');
    });
  });

  test('TC-1.8: Empty State Display', async () => {
    const { getByLabelText } = render(<App />);

    await waitFor(() => {
      expect(getTextContent(getByLabelText('empty-state-text'))).toBe('No transactions yet');
      expect(getTextContent(getByLabelText('total-balance'))).toBe('$0.00');
      expect(getTextContent(getByLabelText('total-income'))).toBe('$0.00');
      expect(getTextContent(getByLabelText('total-expense'))).toBe('$0.00');
    });
  });

  test('TC-1.9: Dashboard Calculations', async () => {
    const { getByLabelText } = render(<App />);

    fireEvent.changeText(getByLabelText('amount-input'), '1000.00');
    fireEvent.changeText(getByLabelText('description-input'), 'Salary');
    fireEvent.press(getByLabelText('type-toggle-income'));
    fireEvent.press(getByLabelText('category-option-Salary'));
    fireEvent.press(getByLabelText('add-transaction-button'));

    await waitFor(() => {
      expect(getTextContent(getByLabelText('total-balance'))).toBe('+$1,000.00');
    });

    fireEvent.changeText(getByLabelText('amount-input'), '300.00');
    fireEvent.changeText(getByLabelText('description-input'), 'Rent');
    fireEvent.press(getByLabelText('type-toggle-expense'));
    fireEvent.press(getByLabelText('category-option-Rent'));
    fireEvent.press(getByLabelText('add-transaction-button'));

    await waitFor(() => {
      expect(getTextContent(getByLabelText('total-balance'))).toBe('+$700.00');
      expect(getTextContent(getByLabelText('total-income'))).toBe('+$1,000.00');
      expect(getTextContent(getByLabelText('total-expense'))).toBe('-$300.00');
    });
  });

  test('TC-1.10: Category Chart Render', async () => {
    const { getByLabelText } = render(<App />);

    fireEvent.changeText(getByLabelText('amount-input'), '50.00');
    fireEvent.changeText(getByLabelText('description-input'), 'Groceries');
    fireEvent.press(getByLabelText('type-toggle-expense'));
    fireEvent.press(getByLabelText('category-option-Food'));
    fireEvent.press(getByLabelText('add-transaction-button'));

    await waitFor(() => {
      expect(getByLabelText('category-chart')).toBeTruthy();
    });
  });
});
