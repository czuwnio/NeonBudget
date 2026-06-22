import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Trash2, ShoppingCart, Home, Car, Zap, CircleDollarSign, PlusCircle } from 'lucide-react-native';
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

const formatDate = (isoString: string) => {
  const d = new Date(isoString);
  const day = d.getDate();
  const month = d.toLocaleString('pl-PL', { month: 'short' });
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
};

const getCategoryIcon = (category: string) => {
  switch (category.toLowerCase()) {
    case 'jedzenie': return <ShoppingCart size={16} color={theme.colors.textSecondary} />;
    case 'czynsz': return <Home size={16} color={theme.colors.textSecondary} />;
    case 'transport': return <Car size={16} color={theme.colors.textSecondary} />;
    case 'rachunki': return <Zap size={16} color={theme.colors.textSecondary} />;
    case 'wypłata': return <CircleDollarSign size={16} color={theme.colors.neonGreen} />;
    default: return <PlusCircle size={16} color={theme.colors.textSecondary} />;
  }
};

export const TransactionList: React.FC<TransactionListProps> = ({ transactions, onDeleteTransaction }) => {
  return (
    <View style={styles.historyCard}>
      <Text style={styles.cardLabel}>HISTORIA (WYBRANY MIESIĄC)</Text>
      {transactions.length === 0 ? (
        <Text accessibilityLabel="empty-state-text" style={styles.emptyText}>
          Brak transakcji w tym miesiącu
        </Text>
      ) : (
        <View accessibilityLabel="transaction-list">
          {transactions.map(t => (
            <View key={t.id} accessibilityLabel="transaction-item" style={styles.txItem}>
              
              <View style={styles.iconContainer}>
                {getCategoryIcon(t.category)}
              </View>

              <View style={styles.textContainer}>
                <Text accessibilityLabel="transaction-item-desc" style={styles.txDesc} numberOfLines={1}>
                  {t.description}
                </Text>
                <Text accessibilityLabel="transaction-item-category" style={styles.txCategory}>
                  {t.category} • {formatDate(t.date)}
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
                <Trash2 size={16} color="#FF6B6B" />
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
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
    marginRight: 10,
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
    textTransform: 'capitalize',
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
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  }
});
