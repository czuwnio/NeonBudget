import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { BlurView } from 'expo-blur';
import { Trash2, ShoppingCart, Home, Car, Zap, CircleDollarSign, PlusCircle, Pencil, ArrowDown, ArrowUp, Calendar, CalendarClock } from 'lucide-react-native';
import { theme } from '../theme/theme';
import { Transaction } from '../types';

interface TransactionListProps {
  transactions: Transaction[];
  onDeleteTransaction: (id: string) => void;
  onEditTransaction: (t: Transaction) => void;
  onTagClick?: (tag: string) => void;
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

export const TransactionList: React.FC<TransactionListProps> = ({ transactions, onDeleteTransaction, onEditTransaction, onTagClick }) => {
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'highest' | 'lowest'>('newest');

  const sortedTransactions = [...transactions].sort((a, b) => {
    switch (sortOrder) {
      case 'newest': return new Date(b.date).getTime() - new Date(a.date).getTime();
      case 'oldest': return new Date(a.date).getTime() - new Date(b.date).getTime();
      case 'highest': return b.amount - a.amount;
      case 'lowest': return a.amount - b.amount;
      default: return 0;
    }
  });

  const renderDescriptionWithTags = (description: string) => {
    const parts = description.split(/(#[a-zA-Z0-9_żółćęśąźńŻÓŁĆĘŚĄŹŃ]+)/g);
    return (
      <Text style={styles.txDesc} numberOfLines={1}>
        {parts.map((part, index) => {
          if (part.startsWith('#')) {
            return (
              <Text 
                key={index} 
                style={styles.tag} 
                onPress={() => onTagClick && onTagClick(part)}
              >
                {part}
              </Text>
            );
          }
          return part;
        })}
      </Text>
    );
  };

  return (
    <View style={styles.container}>
      <BlurView intensity={20} tint="dark" style={styles.glassCard}>
        <View style={styles.headerRow}>
          <Text style={styles.cardLabel}>HISTORIA ({transactions.length})</Text>
          <View style={styles.sortControls}>
            <TouchableOpacity onPress={() => setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest')} style={[styles.sortBtn, (sortOrder === 'newest' || sortOrder === 'oldest') && styles.sortBtnActive]}>
              <Calendar size={14} color={sortOrder === 'newest' || sortOrder === 'oldest' ? '#fff' : theme.colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setSortOrder(sortOrder === 'highest' ? 'lowest' : 'highest')} style={[styles.sortBtn, (sortOrder === 'highest' || sortOrder === 'lowest') && styles.sortBtnActive]}>
              <ArrowDown size={14} color={sortOrder === 'highest' || sortOrder === 'lowest' ? '#fff' : theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {transactions.length === 0 ? (
          <Text style={styles.emptyText}>
            Wygląda na to, że nic tu nie ma. Dodaj pierwszą transakcję!
          </Text>
        ) : (
          <View>
            {sortedTransactions.map(t => (
              <View key={t.id} style={styles.txItem}>
                
                <View style={styles.iconContainer}>
                  {getCategoryIcon(t.category, t.type)}
                </View>

                <View style={styles.textContainer}>
                  {renderDescriptionWithTags(t.description)}
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
                  
                  <View style={styles.actions}>
                    <TouchableOpacity 
                      style={styles.actionBtn} 
                      onPress={() => onEditTransaction(t)}
                    >
                      <Pencil size={16} color={theme.colors.textSecondary} />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.actionBtn} 
                      onPress={() => onDeleteTransaction(t.id)}
                    >
                      <Trash2 size={16} color={theme.colors.textSecondary} />
                    </TouchableOpacity>
                  </View>
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
    textTransform: 'uppercase',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  sortControls: {
    flexDirection: 'row',
    gap: 8,
  },
  sortBtn: {
    padding: 6,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  sortBtnActive: {
    backgroundColor: 'rgba(123, 44, 191, 0.3)',
    borderColor: theme.colors.neonPurple,
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
  tag: {
    color: theme.colors.neonBlue,
    backgroundColor: 'rgba(0, 240, 255, 0.1)',
  },
  txCategory: {
    fontFamily: theme.typography.fontFamily, fontWeight: '500',
    color: theme.colors.textSecondary,
    fontSize: 12,
    textTransform: 'capitalize',
  },
  amountContainer: {
    alignItems: 'flex-end',
    gap: 6,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBtn: {
    padding: 4,
    opacity: 0.8,
  },
  txAmount: {
    fontFamily: theme.typography.fontFamily, fontWeight: 'bold',
    fontSize: 16,
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
