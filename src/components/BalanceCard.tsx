import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { theme } from '../theme/theme';

interface BalanceCardProps {
  balance: number;
  totalIncome: number;
  totalExpense: number;
  monthlyLimit?: number;
  prevTotalExpense?: number;
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

export const BalanceCard: React.FC<BalanceCardProps> = ({ balance, totalIncome, totalExpense, monthlyLimit, prevTotalExpense = 0 }) => {
  const limit = monthlyLimit || 0;
  const progressPercent = limit > 0 ? Math.min((totalExpense / limit) * 100, 100) : 0;
  
  let barColor = theme.colors.neonGreen;
  if (progressPercent >= 90) barColor = theme.colors.danger;
  else if (progressPercent >= 75) barColor = '#FF9F1C'; // Orange
  else if (progressPercent >= 50) barColor = '#4361EE'; // Blue for mid way

  let momMessage = null;
  let momColor = theme.colors.textSecondary;
  if (prevTotalExpense > 0) {
    const diff = totalExpense - prevTotalExpense;
    if (diff > 0) {
      momMessage = `Wydajesz o ${formatValue(diff)} więcej niż w zeszłym miesiącu.`;
      momColor = theme.colors.danger;
    } else if (diff < 0) {
      momMessage = `Zaoszczędziłeś ${formatValue(Math.abs(diff))} w stosunku do zeszłego miesiąca!`;
      momColor = theme.colors.neonGreen;
    } else {
      momMessage = 'Wydatki równe zeszłemu miesiącowi.';
    }
  }

  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysRemaining = daysInMonth - now.getDate() + 1;
  const dailyRemaining = limit > 0 && limit > totalExpense 
    ? (limit - totalExpense) / daysRemaining 
    : 0;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#3C096C', '#10002B']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBg}
      />
      <BlurView intensity={20} tint="dark" style={styles.glassCard}>
        <Text style={styles.cardLabel}>OBECNE SALDO</Text>
        <Text style={styles.balanceValue}>
          {formatValue(balance)}
        </Text>

        <View style={styles.totalsRow}>
          <View style={styles.totalCol}>
            <Text style={styles.totalLabel}>PRZYCHODY</Text>
            <Text style={styles.incomeValue}>
              {formatValue(totalIncome, true)}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.totalCol}>
            <Text style={styles.totalLabel}>WYDATKI</Text>
            <Text style={styles.expenseValue}>
              {formatValue(totalExpense, false, true)}
            </Text>
          </View>
        </View>

        {limit > 0 && (
          <View style={styles.budgetContainer}>
            <View style={styles.budgetLabels}>
              <Text style={styles.budgetLabel}>WYKORZYSTANIE BUDŻETU ({limit} PLN)</Text>
              <Text style={[styles.budgetPercent, { color: barColor }]}>
                {Math.round((totalExpense / limit) * 100)}%
              </Text>
            </View>
            <View style={styles.progressBg}>
              <View style={[styles.progressFill, { width: `${progressPercent}%`, backgroundColor: barColor }]} />
            </View>
            
            <View style={styles.dailyLimitRow}>
              <Text style={styles.dailyLimitLabel}>Dzienny budżet do końca miesiąca:</Text>
              <Text style={[styles.dailyLimitValue, { color: dailyRemaining > 0 ? theme.colors.neonGreen : theme.colors.danger }]}>
                {formatValue(dailyRemaining)}
              </Text>
            </View>
          </View>
        )}

        {momMessage && (
          <View style={styles.momContainer}>
            <Text style={[styles.momText, { color: momColor }]}>{momMessage}</Text>
          </View>
        )}
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(157, 78, 221, 0.3)',
    shadowColor: theme.colors.neonPurple,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  gradientBg: {
    ...StyleSheet.absoluteFillObject,
  },
  glassCard: {
    padding: theme.spacing.lg,
    alignItems: 'center',
  },
  cardLabel: {
    fontFamily: theme.typography.fontFamily, fontWeight: '500',
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 2,
    marginBottom: theme.spacing.sm,
    textTransform: 'uppercase',
  },
  balanceValue: {
    fontFamily: theme.typography.fontFamily, fontWeight: 'bold',
    fontSize: 42,
    color: theme.colors.textPrimary,
    textAlign: 'center',
    marginVertical: theme.spacing.sm,
    textShadowColor: 'rgba(255,255,255,0.3)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  totalsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingTop: theme.spacing.md,
    marginTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  totalCol: {
    flex: 1,
    alignItems: 'center',
  },
  divider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: theme.spacing.md,
  },
  totalLabel: {
    fontFamily: theme.typography.fontFamily, fontWeight: '500',
    fontSize: 10,
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 1,
    marginBottom: 4,
  },
  incomeValue: {
    fontFamily: theme.typography.fontFamily, fontWeight: 'bold',
    color: theme.colors.neonGreen,
    fontSize: 18,
  },
  expenseValue: {
    fontFamily: theme.typography.fontFamily, fontWeight: 'bold',
    color: theme.colors.danger,
    fontSize: 18,
  },
  budgetContainer: {
    width: '100%',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  budgetLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  budgetLabel: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 10,
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 1,
  },
  budgetPercent: {
    fontFamily: theme.typography.fontFamily,
    fontWeight: 'bold',
    fontSize: 12,
  },
  progressBg: {
    width: '100%',
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  dailyLimitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  dailyLimitLabel: {
    fontFamily: theme.typography.fontFamily,
    color: 'rgba(255,255,255,0.6)',
    fontSize: 11,
    letterSpacing: 0.5,
  },
  dailyLimitValue: {
    fontFamily: theme.typography.fontFamily,
    fontWeight: 'bold',
    fontSize: 14,
  },
  momContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
    width: '100%',
    alignItems: 'center',
  },
  momText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
    letterSpacing: 0.5,
  }
});
