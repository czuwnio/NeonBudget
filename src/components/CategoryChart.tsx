import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
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
    <View accessibilityLabel="category-chart" style={styles.chartCard}>
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
    </View>
  );
};

const styles = StyleSheet.create({
  chartCard: {
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
    marginBottom: 15,
  },
  noChartText: {
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 10,
  },
  chartContainer: {
    marginTop: 5,
  },
  barRow: {
    marginBottom: 12,
  },
  barLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  barLabelText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '500',
  },
  barValueText: {
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
  },
});
