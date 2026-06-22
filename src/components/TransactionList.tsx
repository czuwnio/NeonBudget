import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '../theme/theme';
import { Transaction } from '../types';

interface TransactionListProps {
  transactions: Transaction[];
  onDeleteTransaction: (id: string) => void;
}

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

export const TransactionList: React.FC<TransactionListProps> = ({ transactions, onDeleteTransaction }) => {
  return (
    <View style={styles.historyCard}>
      <Text style={styles.cardLabel}>HISTORIA</Text>
      {transactions.length === 0 ? (
        <Text accessibilityLabel="empty-state-text" style={styles.emptyText}>
          Brak transakcji
        </Text>
      ) : (
        <View accessibilityLabel="transaction-list">
          {transactions.map(t => (
            <View key={t.id} accessibilityLabel="transaction-item" style={styles.txItem}>
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
                style={[styles.txAmount, t.type === 'income' ? styles.txIncome : styles.txExpense]}
              >
                {t.type === 'income' ? formatIncome(t.amount) : formatExpense(t.amount)}
              </Text>
              
              <TouchableOpacity 
                style={styles.deleteBtn} 
                onPress={() => onDeleteTransaction(t.id)}
                accessibilityLabel="delete-transaction-button"
              >
                <Text style={styles.deleteBtnText}>✕</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  historyCard: {
    backgroundColor: theme.colors.surfaceDark,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: theme.colors.glassBorder,
    marginBottom: 20,
  },
  cardLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 8,
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
    marginRight: 10,
  },
  txIncome: {
    color: theme.colors.neonGreen,
  },
  txExpense: {
    color: '#FF6B6B',
  },
  deleteBtn: {
    backgroundColor: 'rgba(255, 107, 107, 0.15)',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteBtnText: {
    color: '#FF6B6B',
    fontSize: 14,
    fontWeight: 'bold',
  }
});
