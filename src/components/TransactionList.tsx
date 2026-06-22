import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { BlurView } from 'expo-blur';
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
  return `${day} ${month}`;
};

const getCategoryIcon = (category: string, type: string) => {
  if (type === 'income') return <CircleDollarSign size={20} color={theme.colors.neonGreen} />;
  switch (category.toLowerCase()) {
    case 'jedzenie': return <ShoppingCart size={18} color="#FF9F1C" />;
    case 'czynsz': return <Home size={18} color="#2EC4B6" />;
    case 'transport': return <Car size={18} color="#4361EE" />;
    case 'rachunki': return <Zap size={18} color="#F72585" />;
    default: return <PlusCircle size={18} color={theme.colors.neonPurpleLight} />;
  }
};

export const TransactionList: React.FC<TransactionListProps> = ({ transactions, onDeleteTransaction }) => {
  return (
    <View style={styles.container}>
      <BlurView intensity={20} tint="dark" style={styles.glassCard}>
        <Text style={styles.cardLabel}>HISTORIA</Text>
        {transactions.length === 0 ? (
          <Text style={styles.emptyText}>
            Wygląda na to, że nic tu nie ma. Dodaj pierwszą transakcję!
          </Text>
        ) : (
          <View>
            {transactions.map(t => (
              <View key={t.id} style={styles.txItem}>
                
                <View style={styles.iconContainer}>
                  {getCategoryIcon(t.category, t.type)}
                </View>

                <View style={styles.textContainer}>
                  <Text style={styles.txDesc} numberOfLines={1}>
                    {t.description}
                  </Text>
                  <Text style={styles.txCategory}>
                    {t.category} • {formatDate(t.date)}
                  </Text>
                </View>
                
                <View style={styles.amountContainer}>
                  <Text
                    style={[styles.txAmount, t.type === 'income' ? styles.txIncome : styles.txExpense]}
                  >
                    {t.type === 'income' ? formatIncome(t.amount) : formatExpense(t.amount)}
                  </Text>
                  
                  <TouchableOpacity 
                    style={styles.deleteBtn} 
                    onPress={() => onDeleteTransaction(t.id)}
                  >
                    <Trash2 size={16} color={theme.colors.textSecondary} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
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
  emptyText: {
    fontFamily: theme.typography.fontFamily, fontWeight: '500',
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginVertical: theme.spacing.lg,
    lineHeight: 20,
  },
  txItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.03)',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.03)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  textContainer: {
    flex: 1,
    marginRight: 10,
    justifyContent: 'center',
  },
  txDesc: {
    fontFamily: theme.typography.fontFamily, fontWeight: 'bold',
    color: theme.colors.textPrimary,
    fontSize: 15,
    marginBottom: 4,
  },
  txCategory: {
    fontFamily: theme.typography.fontFamily, fontWeight: '500',
    color: theme.colors.textSecondary,
    fontSize: 12,
    textTransform: 'capitalize',
  },
  amountContainer: {
    alignItems: 'flex-end',
    flexDirection: 'row',
  },
  txAmount: {
    fontFamily: theme.typography.fontFamily, fontWeight: 'bold',
    fontSize: 16,
    marginRight: 12,
  },
  txIncome: {
    color: theme.colors.neonGreen,
  },
  txExpense: {
    color: theme.colors.textPrimary, // Clean white for expenses
  },
  deleteBtn: {
    padding: 6,
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: 8,
  }
});
