import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { theme } from '../theme/theme';

interface TransactionFormProps {
  onAddTransaction: (amount: string, description: string, type: 'income' | 'expense', category: string) => void;
  validationError: string;
}

export const TransactionForm: React.FC<TransactionFormProps> = ({ onAddTransaction, validationError }) => {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('income');
  const [category, setCategory] = useState('Wypłata');

  const categories = type === 'income'
    ? ['Wypłata', 'Inne']
    : ['Jedzenie', 'Czynsz', 'Transport', 'Rachunki', 'Inne'];

  const handleTypeChange = (newType: 'income' | 'expense') => {
    setType(newType);
    setCategory(newType === 'income' ? 'Wypłata' : 'Jedzenie');
  };

  const submit = () => {
    onAddTransaction(amount, description, type, category);
    // Note: App.tsx will manage clearing the form on successful save
  };

  return (
    <View style={styles.formCard}>
      <Text style={styles.cardLabel}>NOWA TRANSAKCJA</Text>

      {validationError ? (
        <Text accessibilityLabel="validation-error" style={styles.errorText}>
          {validationError}
        </Text>
      ) : null}

      <View style={styles.toggleRow}>
        <TouchableOpacity
          accessibilityLabel="type-toggle-income"
          style={[styles.toggleBtn, type === 'income' && styles.toggleBtnActiveIncome]}
          onPress={() => handleTypeChange('income')}
        >
          <Text style={styles.toggleBtnText}>Przychód</Text>
        </TouchableOpacity>
        <TouchableOpacity
          accessibilityLabel="type-toggle-expense"
          style={[styles.toggleBtn, type === 'expense' && styles.toggleBtnActiveExpense]}
          onPress={() => handleTypeChange('expense')}
        >
          <Text style={styles.toggleBtnText}>Wydatek</Text>
        </TouchableOpacity>
      </View>

      <TextInput
        accessibilityLabel="amount-input"
        style={styles.input}
        placeholder="Kwota (np. 150.50)"
        placeholderTextColor={theme.colors.textSecondary}
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
      />

      <TextInput
        accessibilityLabel="description-input"
        style={styles.input}
        placeholder="Opis (np. Zakupy, Czynsz)"
        placeholderTextColor={theme.colors.textSecondary}
        value={description}
        onChangeText={setDescription}
      />

      <View style={styles.categoryPicker}>
        <TouchableOpacity accessibilityLabel="category-picker-button" style={styles.pickerButton}>
          <Text style={styles.pickerButtonText}>Kategoria: {category}</Text>
        </TouchableOpacity>
        <View style={styles.categoryOptions}>
          {categories.map(cat => (
            <TouchableOpacity
              key={cat}
              accessibilityLabel={`category-option-${cat}`}
              style={[styles.categoryOpt, category === cat && styles.categoryOptActive]}
              onPress={() => setCategory(cat)}
            >
              <Text style={styles.categoryOptText}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity
        accessibilityLabel="add-transaction-button"
        style={styles.addBtn}
        onPress={submit}
      >
        <Text style={styles.addBtnText}>Dodaj transakcję</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  formCard: {
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
});
