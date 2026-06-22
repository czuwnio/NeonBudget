import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../theme/theme';

interface BalanceCardProps {
  balance: number;
  totalIncome: number;
  totalExpense: number;
}

const formatValue = (val: number, isIncome: boolean = false, isExpense: boolean = false) => {
  const rounded = Math.round(val * 100) / 100;
  if (rounded === 0) return '0.00 zł';
  
  let sign = '';
  if (isIncome) sign = '+';
  else if (isExpense) sign = '-';
  else if (rounded > 0) sign = '+';
  else sign = '-';

  const parts = Math.abs(rounded).toFixed(2).split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return `${sign}${parts.join(',')} zł`;
};

export const BalanceCard: React.FC<BalanceCardProps> = ({ balance, totalIncome, totalExpense }) => {
  return (
    <View style={styles.card} testID="balance-card">
      <Text style={styles.cardLabel}>OBECNE SALDO</Text>
      <Text style={styles.balanceValue} testID="balance-value" accessibilityLabel="total-balance">
        {formatValue(balance)}
      </Text>

      <View style={styles.totalsRow}>
        <View style={styles.totalCol}>
          <Text style={styles.totalLabel}>PRZYCHODY</Text>
          <Text style={styles.incomeValue} accessibilityLabel="total-income">
            {formatValue(totalIncome, true)}
          </Text>
        </View>
        <View style={styles.totalCol}>
          <Text style={styles.totalLabel}>WYDATKI</Text>
          <Text style={styles.expenseValue} accessibilityLabel="total-expense">
            {formatValue(totalExpense, false, true)}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
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
});
