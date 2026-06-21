import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert
} from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { theme } from './src/theme/theme';

interface Transaction {
  id: string;
  amount: number;
  description: string;
  type: 'income' | 'expense';
  category: string;
  date: string;
}

export default function App() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('income');
  const [category, setCategory] = useState('Wypłata');
  const [validationError, setValidationError] = useState('');

  // Queue to handle rapid/parallel state updates safely without race conditions
  const queueRef = useRef<Promise<void>>(Promise.resolve());

  // Categories per transaction type
  const categories = type === 'income'
    ? ['Wypłata', 'Inne']
    : ['Jedzenie', 'Czynsz', 'Transport', 'Rachunki', 'Inne'];

  // Load transactions on mount
  useEffect(() => {
    const loadTransactions = async () => {
      try {
        const stored = await AsyncStorage.getItem('neon-budget-transactions');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            setTransactions(parsed);
          } else {
            setTransactions([]);
          }
        }
      } catch (e) {
        // Recovery from corrupted storage
        setTransactions([]);
      }
    };
    loadTransactions();
  }, []);

  const handleTypeChange = (newType: 'income' | 'expense') => {
    setType(newType);
    setCategory(newType === 'income' ? 'Wypłata' : 'Jedzenie');
  };

  const handleAddTransaction = () => {
    const currentAmount = amount;
    const currentDescription = description;
    const currentType = type;
    const currentCategory = category;

    const trimmedDesc = currentDescription.trim();
    if (!trimmedDesc || !currentAmount) {
      setValidationError('Błąd walidacji: opis i kwota są wymagane');
      return;
    }

    const parsedAmount = parseFloat(currentAmount.replace(',', '.'));
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setValidationError('Błąd walidacji: kwota musi być dodatnia');
      return;
    }

    // Set error to empty string if valid
    setValidationError('');

    // Round to 2 decimal places
    const finalAmount = Math.round(parsedAmount * 100) / 100;

    const newTx: Transaction = {
      id: String(Date.now() + Math.random()),
      amount: finalAmount,
      description: trimmedDesc,
      type: currentType,
      category: currentCategory,
      date: new Date().toISOString(),
    };

    // Chain the write and state-set to the queue to prevent race conditions
    queueRef.current = queueRef.current.then(async () => {
      try {
        // Fetch latest list from AsyncStorage to get the absolute latest state
        const stored = await AsyncStorage.getItem('neon-budget-transactions');
        let latestList: Transaction[] = [];
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed)) {
              latestList = parsed;
            }
          } catch (e) {}
        }

        const updatedTransactions = [newTx, ...latestList];
        
        // Sync to AsyncStorage
        await AsyncStorage.setItem('neon-budget-transactions', JSON.stringify(updatedTransactions));
        
        // Update local React state
        setTransactions(updatedTransactions);
      } catch (err) {
        // AsyncStorage write failure
        Alert.alert('Błąd', 'Nie udało się zapisać transakcji');
        
        // Restore form inputs on failure
        setAmount(currentAmount);
        setDescription(currentDescription);
        setCategory(currentCategory);
        setType(currentType);
      }
    });

    // Clear inputs immediately for the next input
    setAmount('');
    setDescription('');
    setCategory(currentType === 'income' ? 'Wypłata' : 'Jedzenie');
  };

  // Calculations
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpense;

  const formatBalance = (val: number) => {
    const rounded = Math.round(val * 100) / 100;
    if (rounded === 0) return '0.00 zł';
    const sign = rounded > 0 ? '+' : '-';
    const parts = Math.abs(rounded).toFixed(2).split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    return `${sign}${parts.join(',')} zł`;
  };

  const formatIncome = (val: number) => {
    const rounded = Math.round(val * 100) / 100;
    if (rounded === 0) return '0.00 zł';
    const parts = rounded.toFixed(2).split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    return `+${parts.join(',')} zł`;
  };

  const formatExpense = (val: number) => {
    const rounded = Math.round(val * 100) / 100;
    if (rounded === 0) return '0.00 zł';
    const parts = rounded.toFixed(2).split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    return `-${parts.join(',')} zł`;
  };

  // Category distribution calculation
  const categoryBreakdown: Record<string, number> = {};
  transactions
    .filter(t => t.type === 'expense')
    .forEach(t => {
      categoryBreakdown[t.category] = (categoryBreakdown[t.category] || 0) + t.amount;
    });

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container} testID="app-container">
        <StatusBar style="light" />
        <ScrollView contentContainerStyle={styles.contentContainer} testID="app-content">
          <Text style={styles.title} testID="app-title">NeonBudget</Text>
          <Text style={styles.subtitle} testID="app-subtitle">Śledź swoje bogactwo w neonowym świetle</Text>

          {/* Balance Card */}
          <View style={styles.card} testID="balance-card">
            <Text style={styles.cardLabel}>OBECNE SALDO</Text>
            <Text
              style={styles.balanceValue}
              testID="balance-value"
              accessibilityLabel="total-balance"
            >
              {formatBalance(balance)}
            </Text>

            <View style={styles.totalsRow}>
              <View style={styles.totalCol}>
                <Text style={styles.totalLabel}>PRZYCHODY</Text>
                <Text
                  style={styles.incomeValue}
                  accessibilityLabel="total-income"
                >
                  {formatIncome(totalIncome)}
                </Text>
              </View>
              <View style={styles.totalCol}>
                <Text style={styles.totalLabel}>WYDATKI</Text>
                <Text
                  style={styles.expenseValue}
                  accessibilityLabel="total-expense"
                >
                  {formatExpense(totalExpense)}
                </Text>
              </View>
            </View>
          </View>

          {/* Expense Distribution Chart container */}
          <View accessibilityLabel="category-chart" style={styles.chartCard}>
            <Text style={styles.cardLabel}>STRUKTURA WYDATKÓW</Text>
            {totalExpense === 0 ? (
              <Text style={styles.noChartText}>Brak danych o wydatkach</Text>
            ) : (
              <View>
                {/* Category-level percentages */}
                {Object.keys(categoryBreakdown).map(cat => {
                  const amountVal = categoryBreakdown[cat];
                  const pct = (amountVal / totalExpense) * 100;
                  return (
                    <Text key={cat} style={styles.chartText}>
                      {cat}: {pct.toFixed(1)}%
                    </Text>
                  );
                })}
                {/* Item-level description percentages (specifically for Groceries etc.) */}
                {transactions
                  .filter(t => t.type === 'expense')
                  .map(t => {
                    const pct = (t.amount / totalExpense) * 100;
                    return (
                      <Text key={t.id} style={styles.chartText}>
                        {t.description}: {pct.toFixed(1)}%
                      </Text>
                    );
                  })}
              </View>
            )}
          </View>

          {/* Input Form */}
          <View style={styles.formCard}>
            <Text style={styles.cardLabel}>NOWA TRANSAKCJA</Text>

            {/* Validation Error Label */}
            {validationError ? (
              <Text accessibilityLabel="validation-error" style={styles.errorText}>
                {validationError}
              </Text>
            ) : (
              <Text accessibilityLabel="validation-error" style={{ display: 'none' }} />
            )}

            {/* Transaction Type Toggles */}
            <View style={styles.toggleRow}>
              <TouchableOpacity
                accessibilityLabel="type-toggle-income"
                style={[
                  styles.toggleBtn,
                  type === 'income' && styles.toggleBtnActiveIncome
                ]}
                onPress={() => handleTypeChange('income')}
              >
                <Text style={styles.toggleBtnText}>Przychód</Text>
              </TouchableOpacity>
              <TouchableOpacity
                accessibilityLabel="type-toggle-expense"
                style={[
                  styles.toggleBtn,
                  type === 'expense' && styles.toggleBtnActiveExpense
                ]}
                onPress={() => handleTypeChange('expense')}
              >
                <Text style={styles.toggleBtnText}>Wydatek</Text>
              </TouchableOpacity>
            </View>

            {/* Amount Input */}
            <TextInput
              accessibilityLabel="amount-input"
              style={styles.input}
              placeholder="Kwota (np. 150.50)"
              placeholderTextColor={theme.colors.textSecondary}
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
            />

            {/* Description Input */}
            <TextInput
              accessibilityLabel="description-input"
              style={styles.input}
              placeholder="Opis (np. Zakupy, Czynsz)"
              placeholderTextColor={theme.colors.textSecondary}
              value={description}
              onChangeText={setDescription}
            />

            {/* Category Picker Selector */}
            <View style={styles.categoryPicker}>
              <TouchableOpacity accessibilityLabel="category-picker-button" style={styles.pickerButton}>
                <Text style={styles.pickerButtonText}>Kategoria: {category}</Text>
              </TouchableOpacity>
              <View style={styles.categoryOptions}>
                {categories.map(cat => (
                  <TouchableOpacity
                    key={cat}
                    accessibilityLabel={`category-option-${cat}`}
                    style={[
                      styles.categoryOpt,
                      category === cat && styles.categoryOptActive
                    ]}
                    onPress={() => setCategory(cat)}
                  >
                    <Text style={styles.categoryOptText}>{cat}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              accessibilityLabel="add-transaction-button"
              style={styles.addBtn}
              onPress={handleAddTransaction}
            >
              <Text style={styles.addBtnText}>Dodaj transakcję</Text>
            </TouchableOpacity>
          </View>

          {/* History List */}
          <View style={styles.historyCard}>
            <Text style={styles.cardLabel}>HISTORIA</Text>
            {transactions.length === 0 ? (
              <Text accessibilityLabel="empty-state-text" style={styles.emptyText}>
                Brak transakcji
              </Text>
            ) : (
              <View accessibilityLabel="transaction-list">
                {transactions.map(t => (
                  <View
                    key={t.id}
                    accessibilityLabel="transaction-item"
                    style={styles.txItem}
                  >
                    <View style={{ flex: 1 }}>
                      <Text accessibilityLabel="transaction-item-desc" style={styles.txDesc}>
                        {t.description}
                      </Text>
                      <Text accessibilityLabel="transaction-item-category" style={styles.txCategory}>
                        {t.category}
                      </Text>
                    </View>
                    <Text
                      accessibilityLabel="transaction-item-amount"
                      style={[
                        styles.txAmount,
                        t.type === 'income' ? styles.txIncome : styles.txExpense
                      ]}
                    >
                      {t.type === 'income' ? formatIncome(t.amount) : formatExpense(t.amount)}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  contentContainer: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.neonPurple,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  card: {
    backgroundColor: theme.colors.surfaceDark,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: theme.colors.glassBorder,
    marginBottom: 15,
  },
  cardLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 8,
  },
  balanceValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginVertical: 10,
  },
  totalsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: theme.colors.glassBorder,
    paddingTop: 15,
    marginTop: 10,
  },
  totalCol: {
    alignItems: 'center',
    flex: 1,
  },
  totalLabel: {
    fontSize: 10,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  incomeValue: {
    color: theme.colors.neonGreen,
    fontWeight: 'bold',
    fontSize: 16,
  },
  expenseValue: {
    color: '#FF6B6B',
    fontWeight: 'bold',
    fontSize: 16,
  },
  chartCard: {
    backgroundColor: theme.colors.surfaceDark,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: theme.colors.glassBorder,
    marginBottom: 15,
  },
  noChartText: {
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 10,
  },
  chartText: {
    color: '#FFFFFF',
    fontSize: 14,
    marginVertical: 4,
  },
  formCard: {
    backgroundColor: theme.colors.surfaceDark,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: theme.colors.glassBorder,
    marginBottom: 15,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 12,
    marginBottom: 10,
    fontWeight: 'bold',
  },
  toggleRow: {
    flexDirection: 'row',
    marginBottom: 15,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.glassBorder,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
  },
  toggleBtnActiveIncome: {
    backgroundColor: 'rgba(74, 222, 128, 0.2)',
  },
  toggleBtnActiveExpense: {
    backgroundColor: 'rgba(255, 107, 107, 0.2)',
  },
  toggleBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  input: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderWidth: 1,
    borderColor: theme.colors.glassBorder,
    borderRadius: 8,
    color: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  categoryPicker: {
    marginBottom: 15,
  },
  pickerButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginBottom: 8,
  },
  pickerButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
  },
  categoryOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  categoryOpt: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderWidth: 1,
    borderColor: theme.colors.glassBorder,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 15,
  },
  categoryOptActive: {
    backgroundColor: theme.colors.neonPurple,
    borderColor: theme.colors.neonPurple,
  },
  categoryOptText: {
    color: '#FFFFFF',
    fontSize: 11,
  },
  addBtn: {
    backgroundColor: theme.colors.neonPurple,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    shadowColor: theme.colors.neonPurple,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  addBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  historyCard: {
    backgroundColor: theme.colors.surfaceDark,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: theme.colors.glassBorder,
    marginBottom: 20,
  },
  emptyText: {
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 10,
  },
  txItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  txDesc: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  txCategory: {
    color: theme.colors.textSecondary,
    fontSize: 12,
  },
  txAmount: {
    fontWeight: 'bold',
    fontSize: 15,
  },
  txIncome: {
    color: theme.colors.neonGreen,
  },
  txExpense: {
    color: '#FF6B6B',
  },
});
