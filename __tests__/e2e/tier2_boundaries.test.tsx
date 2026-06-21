import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
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

describe('Tier 2: Boundary & Corner Cases', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    jest.clearAllMocks();
  });

  test('TC-2.1: Zero Amount Input', async () => {
    const { getByLabelText, queryByLabelText } = render(<App />);

    fireEvent.changeText(getByLabelText('amount-input'), '0');
    fireEvent.changeText(getByLabelText('description-input'), 'Free stuff');
    fireEvent.press(getByLabelText('type-toggle-income'));
    fireEvent.press(getByLabelText('category-option-Other'));
    fireEvent.press(getByLabelText('add-transaction-button'));

    // Verify rejection (e.g. error text shows up, or item is not added)
    await waitFor(() => {
      expect(queryByLabelText('transaction-item')).toBeNull();
      const err = getByLabelText('validation-error');
      expect(getTextContent(err)).toBeTruthy();
    });
  });

  test('TC-2.2: Negative Amount Input', async () => {
    const { getByLabelText, queryByLabelText } = render(<App />);

    fireEvent.changeText(getByLabelText('amount-input'), '-10.00');
    fireEvent.changeText(getByLabelText('description-input'), 'Refund negative');
    fireEvent.press(getByLabelText('type-toggle-income'));
    fireEvent.press(getByLabelText('category-option-Other'));
    fireEvent.press(getByLabelText('add-transaction-button'));

    await waitFor(() => {
      expect(queryByLabelText('transaction-item')).toBeNull();
      const err = getByLabelText('validation-error');
      expect(getTextContent(err)).toBeTruthy();
    });
  });

  test('TC-2.3: Extreme Value Input', async () => {
    const { getByLabelText } = render(<App />);

    fireEvent.changeText(getByLabelText('amount-input'), '99999999');
    fireEvent.changeText(getByLabelText('description-input'), 'Mega Jackpot');
    fireEvent.press(getByLabelText('type-toggle-income'));
    fireEvent.press(getByLabelText('category-option-Other'));
    fireEvent.press(getByLabelText('add-transaction-button'));

    await waitFor(() => {
      expect(getTextContent(getByLabelText('transaction-item-desc'))).toBe('Mega Jackpot');
      expect(getTextContent(getByLabelText('transaction-item-amount'))).toBe('+$99,999,999.00');
    });
  });

  test('TC-2.4: Decimal Precision', async () => {
    const { getByLabelText } = render(<App />);

    // Decimal input with 3+ decimals (e.g., 15.556) should be rounded/truncated to 2 decimal places in UI
    fireEvent.changeText(getByLabelText('amount-input'), '15.556');
    fireEvent.changeText(getByLabelText('description-input'), 'Gas');
    fireEvent.press(getByLabelText('type-toggle-expense'));
    fireEvent.press(getByLabelText('category-option-Transport'));
    fireEvent.press(getByLabelText('add-transaction-button'));

    await waitFor(() => {
      expect(getTextContent(getByLabelText('transaction-item-amount'))).toBe('-$15.56'); // rounded
    });
  });

  test('TC-2.5: Empty/Whitespace Fields', async () => {
    const { getByLabelText, queryByLabelText } = render(<App />);

    // Empty fields submission
    fireEvent.changeText(getByLabelText('amount-input'), '');
    fireEvent.changeText(getByLabelText('description-input'), '   ');
    fireEvent.press(getByLabelText('add-transaction-button'));

    await waitFor(() => {
      expect(queryByLabelText('transaction-item')).toBeNull();
      const err = getByLabelText('validation-error');
      expect(getTextContent(err)).toBeTruthy();
    });
  });

  test('TC-2.6: Special Characters', async () => {
    const { getByLabelText } = render(<App />);

    fireEvent.changeText(getByLabelText('amount-input'), '100.00');
    fireEvent.changeText(getByLabelText('description-input'), '🚀 Emojis & Symbols #$%^&*() 🚀');
    fireEvent.press(getByLabelText('type-toggle-income'));
    fireEvent.press(getByLabelText('category-option-Other'));
    fireEvent.press(getByLabelText('add-transaction-button'));

    await waitFor(() => {
      expect(getTextContent(getByLabelText('transaction-item-desc'))).toBe('🚀 Emojis & Symbols #$%^&*() 🚀');
    });
  });

  test('TC-2.7: Corrupted Storage Recovery', async () => {
    await AsyncStorage.setItem('neon-budget-transactions', '{ corrupted json string: [ }');

    const { getByLabelText } = render(<App />);

    await waitFor(() => {
      expect(getTextContent(getByLabelText('empty-state-text'))).toBe('No transactions yet');
      expect(getTextContent(getByLabelText('total-balance'))).toBe('$0.00');
    });
  });

  test('TC-2.8: Storage Write Failures', async () => {
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    const setItemSpy = jest.spyOn(AsyncStorage, 'setItem').mockRejectedValueOnce(new Error('Storage failure'));

    const { getByLabelText } = render(<App />);

    const amountInput = getByLabelText('amount-input');
    const descInput = getByLabelText('description-input');

    fireEvent.changeText(amountInput, '100');
    fireEvent.changeText(descInput, 'Failed save item');
    fireEvent.press(getByLabelText('type-toggle-income'));
    fireEvent.press(getByLabelText('category-option-Other'));
    fireEvent.press(getByLabelText('add-transaction-button'));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalled();
      // Form inputs should be retained on failure
      expect(amountInput.props.value).toBe('100');
      expect(descInput.props.value).toBe('Failed save item');
    });
  });

  test('TC-2.9: Net Zero Balance', async () => {
    const { getByLabelText } = render(<App />);

    // Add Income
    fireEvent.changeText(getByLabelText('amount-input'), '120.00');
    fireEvent.changeText(getByLabelText('description-input'), 'Job');
    fireEvent.press(getByLabelText('type-toggle-income'));
    fireEvent.press(getByLabelText('category-option-Other'));
    fireEvent.press(getByLabelText('add-transaction-button'));

    await waitFor(() => {
      expect(getTextContent(getByLabelText('total-balance'))).toBe('+$120.00');
    });

    // Add Expense of equal amount
    fireEvent.changeText(getByLabelText('amount-input'), '120.00');
    fireEvent.changeText(getByLabelText('description-input'), 'Bills');
    fireEvent.press(getByLabelText('type-toggle-expense'));
    fireEvent.press(getByLabelText('category-option-Utilities'));
    fireEvent.press(getByLabelText('add-transaction-button'));

    await waitFor(() => {
      expect(getTextContent(getByLabelText('total-balance'))).toBe('$0.00');
    });
  });
});
