import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { theme } from '../theme/theme';
import { Transaction } from '../types';

interface CategoryChartProps {
  transactions: Transaction[];
  totalExpense: number;
}

export const CategoryChart: React.FC<CategoryChartProps> = ({ transactions, totalExpense }) => {
  const categoryBreakdown: Record<string, number> = {};
  transactions
    .filter(t => t.type === 'expense')
    .forEach(t => {
      categoryBreakdown[t.category] = (categoryBreakdown[t.category] || 0) + t.amount;
    });

  // Sort categories by amount descending
  const sortedCategories = Object.keys(categoryBreakdown).sort(
    (a, b) => categoryBreakdown[b] - categoryBreakdown[a]
  );

  return (
    <View style={styles.container}>
      <BlurView intensity={20} tint="dark" style={styles.glassCard}>
        <Text style={styles.cardLabel}>STRUKTURA WYDATKÓW</Text>
        {totalExpense === 0 ? (
          <Text style={styles.noChartText}>Brak danych o wydatkach</Text>
        ) : (
          <View style={styles.chartContainer}>
            {sortedCategories.map(cat => {
              const amountVal = categoryBreakdown[cat];
              const pct = (amountVal / totalExpense) * 100;
              return (
                <View key={cat} style={styles.barRow}>
                  <View style={styles.barLabelRow}>
                    <Text style={styles.barLabelText}>{cat}</Text>
                    <Text style={styles.barValueText}>{pct.toFixed(1)}%</Text>
                  </View>
                  <View style={styles.progressBarBackground}>
                    <View style={[styles.progressBarFill, { width: `${pct}%` }]} />
                  </View>
                </View>
              );
            })}
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
  noChartText: {
    fontFamily: theme.typography.fontFamily, fontWeight: '500',
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginVertical: theme.spacing.lg,
  },
  chartContainer: {
    marginTop: 4,
  },
  barRow: {
    marginBottom: 16,
  },
  barLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  barLabelText: {
    fontFamily: theme.typography.fontFamily, fontWeight: 'bold',
    color: theme.colors.textPrimary,
    fontSize: 13,
  },
  barValueText: {
    fontFamily: theme.typography.fontFamily, fontWeight: 'bold',
    color: theme.colors.textSecondary,
    fontSize: 12,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: theme.colors.neonPurple,
    borderRadius: 4,
    shadowColor: theme.colors.neonPurple,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 5,
  },
});
