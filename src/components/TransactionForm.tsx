import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { PlusCircle, ArrowUpRight, ArrowDownRight } from 'lucide-react-native';
import { theme } from '../theme/theme';

interface TransactionFormProps {
  onSubmitTransaction: (amount: string, description: string, type: 'income' | 'expense', category: string) => void;
  validationError: string;
  expenseCategories: string[];
  incomeCategories: string[];
  transactionToEdit: any;
  onCancelEdit: () => void;
}

export const TransactionForm: React.FC<TransactionFormProps> = ({ 
  onSubmitTransaction, 
  validationError,
  expenseCategories,
  incomeCategories,
  transactionToEdit,
  onCancelEdit
}) => {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [category, setCategory] = useState(expenseCategories[0] || 'Jedzenie');

  const currentCategories = type === 'income' ? incomeCategories : expenseCategories;

  React.useEffect(() => {
    if (transactionToEdit) {
      setAmount(transactionToEdit.amount.toString());
      setDescription(transactionToEdit.description);
      setType(transactionToEdit.type);
      setCategory(transactionToEdit.category);
    } else {
      setAmount('');
      setDescription('');
      setType('expense');
      setCategory(expenseCategories[0] || 'Jedzenie');
    }
  }, [transactionToEdit, expenseCategories]);

  const handleTypeChange = (newType: 'income' | 'expense') => {
    setType(newType);
    setCategory(newType === 'income' ? (incomeCategories[0] || 'Wypłata') : (expenseCategories[0] || 'Jedzenie'));
  };

  const submit = () => {
    onSubmitTransaction(amount, description, type, category);
    if (!validationError) {
      // Clear form logic is handled by parent setting transactionToEdit to null
      if (!transactionToEdit) {
        setAmount('');
        setDescription('');
      }
    }
  };

  return (
    <View style={styles.container}>
      <BlurView intensity={20} tint="dark" style={styles.glassCard}>
        <Text style={styles.cardLabel}>{transactionToEdit ? 'EDYTUJ TRANSAKCJĘ' : 'NOWA TRANSAKCJA'}</Text>

        {validationError ? (
          <Text accessibilityLabel="validation-error" style={styles.errorText}>
            {validationError}
          </Text>
        ) : null}

        <View style={styles.toggleRow}>
          <TouchableOpacity
            style={[styles.toggleBtn, type === 'income' && styles.toggleBtnActiveIncome]}
            onPress={() => handleTypeChange('income')}
          >
            <ArrowUpRight size={16} color={type === 'income' ? '#FFFFFF' : theme.colors.textSecondary} style={{ marginRight: 6 }} />
            <Text style={[styles.toggleBtnText, type === 'income' && { color: '#FFFFFF' }]}>Przychód</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, type === 'expense' && styles.toggleBtnActiveExpense]}
            onPress={() => handleTypeChange('expense')}
          >
            <ArrowDownRight size={16} color={type === 'expense' ? '#FFFFFF' : theme.colors.textSecondary} style={{ marginRight: 6 }} />
            <Text style={[styles.toggleBtnText, type === 'expense' && { color: '#FFFFFF' }]}>Wydatek</Text>
          </TouchableOpacity>
        </View>

        <TextInput
          style={styles.input}
          placeholder="Kwota (np. 150.50)"
          placeholderTextColor={theme.colors.textSecondary}
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
        />

        <TextInput
          style={styles.input}
          placeholder="Opis (np. Zakupy, Czynsz)"
          placeholderTextColor={theme.colors.textSecondary}
          value={description}
          onChangeText={setDescription}
        />

        <View style={styles.categoryPicker}>
          <View style={styles.categoryOptions}>
            {currentCategories.map(cat => (
              <TouchableOpacity
                key={cat}
                style={[styles.categoryOpt, category === cat && styles.categoryOptActive]}
                onPress={() => setCategory(cat)}
              >
                <Text style={[styles.categoryOptText, category === cat && { color: '#FFFFFF', fontFamily: theme.typography.fontFamily, fontWeight: 'bold' }]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.submitBtn} onPress={submit}>
            <Text style={styles.submitText}>{transactionToEdit ? 'ZAPISZ ZMIANY' : 'DODAJ'}</Text>
          </TouchableOpacity>
          {transactionToEdit && (
            <TouchableOpacity style={styles.cancelBtn} onPress={onCancelEdit}>
              <Text style={styles.cancelText}>ANULUJ</Text>
            </TouchableOpacity>
          )}
        </View>
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.glassBorder,
    backgroundColor: theme.colors.surfaceDark,
  },
  glassCard: {
    padding: theme.spacing.lg,
  },
  cardLabel: {
    fontFamily: theme.typography.fontFamily, fontWeight: '500',
    fontSize: 12,
    color: theme.colors.textSecondary,
    letterSpacing: 1.5,
    marginBottom: theme.spacing.md,
    textTransform: 'uppercase',
  },
  errorText: {
    fontFamily: theme.typography.fontFamily, fontWeight: '500',
    color: theme.colors.danger,
    fontSize: 12,
    marginBottom: theme.spacing.md,
  },
  toggleRow: {
    flexDirection: 'row',
    marginBottom: theme.spacing.md,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: theme.borderRadius.md,
    padding: 4,
  },
  toggleBtn: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.borderRadius.sm,
  },
  toggleBtnActiveIncome: {
    backgroundColor: theme.colors.neonGreen,
    shadowColor: theme.colors.neonGreen,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  toggleBtnActiveExpense: {
    backgroundColor: theme.colors.danger,
    shadowColor: theme.colors.danger,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  toggleBtnText: {
    fontFamily: theme.typography.fontFamily, fontWeight: '500',
    color: theme.colors.textSecondary,
  },
  input: {
    fontFamily: theme.typography.fontFamily, fontWeight: '500',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    borderRadius: theme.borderRadius.md,
    color: theme.colors.textPrimary,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: theme.spacing.md,
    fontSize: 16,
  },
  categoryPicker: {
    marginBottom: theme.spacing.lg,
  },
  categoryOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryOpt: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  categoryOptActive: {
    backgroundColor: 'rgba(157, 78, 221, 0.2)',
    borderColor: theme.colors.neonPurple,
  },
  categoryOptText: {
    fontFamily: theme.typography.fontFamily, fontWeight: '500',
    color: theme.colors.textSecondary,
    fontSize: 13,
  },
  submitBtn: {
    flex: 1,
    backgroundColor: theme.colors.neonPurple,
    paddingVertical: 14,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    shadowColor: theme.colors.neonPurple,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitText: {
    fontFamily: theme.typography.fontFamily, fontWeight: 'bold',
    color: '#fff',
    fontSize: 14,
    letterSpacing: 1,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 14,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  cancelText: {
    fontFamily: theme.typography.fontFamily, fontWeight: 'bold',
    color: '#fff',
    fontSize: 14,
    letterSpacing: 1,
  }
});
