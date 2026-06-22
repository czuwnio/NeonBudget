import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { theme } from '../theme/theme';
import { Transaction } from '../types';

interface Props {
  selectedMonthKey: string;
  transactions: Transaction[]; // Pass the ALL transactions for the selected month to show dots
  selectedDate: string | null;
  onSelectDate: (date: string | null) => void;
}

const DAYS = ['Ndz', 'Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob'];

export const DateStrip: React.FC<Props> = ({ selectedMonthKey, transactions, selectedDate, onSelectDate }) => {
  const [yearStr, monthStr] = selectedMonthKey.split('-');
  const year = parseInt(yearStr);
  const month = parseInt(monthStr);

  const daysInMonth = new Date(year, month, 0).getDate();
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    const today = new Date();
    if (today.getFullYear() === year && today.getMonth() + 1 === month) {
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({ x: (today.getDate() - 1) * 60, animated: true });
      }, 500);
    }
  }, [selectedMonthKey]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Dziennik (Filtruj dni)</Text>
        {selectedDate && (
          <TouchableOpacity onPress={() => onSelectDate(null)}>
            <Text style={styles.clearBtn}>Pokaż cały miesiąc</Text>
          </TouchableOpacity>
        )}
      </View>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
        ref={scrollViewRef}
      >
        {daysArray.map(day => {
          const dateObj = new Date(year, month - 1, day);
          const dayOfWeek = DAYS[dateObj.getDay()];
          const fullDateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T`;
          
          const dayTx = transactions.filter(t => t.date.startsWith(fullDateStr.split('T')[0]));
          const hasIncome = dayTx.some(t => t.type === 'income');
          const hasExpense = dayTx.some(t => t.type === 'expense');

          const isSelected = selectedDate === fullDateStr.split('T')[0];

          return (
            <TouchableOpacity 
              key={day} 
              style={[styles.dayCard, isSelected && styles.dayCardSelected]}
              onPress={() => onSelectDate(isSelected ? null : fullDateStr.split('T')[0])}
            >
              <Text style={[styles.dayOfWeek, isSelected && styles.textSelected]}>{dayOfWeek}</Text>
              <Text style={[styles.dayNumber, isSelected && styles.textSelected]}>{day}</Text>
              <View style={styles.dotContainer}>
                {hasIncome && <View style={[styles.dot, { backgroundColor: theme.colors.neonGreen }]} />}
                {hasExpense && <View style={[styles.dot, { backgroundColor: theme.colors.danger }]} />}
                {!hasIncome && !hasExpense && <View style={styles.dotPlaceholder} />}
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 24,
  },
  title: {
    fontFamily: theme.typography.fontFamily,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    fontSize: 16,
  },
  clearBtn: {
    fontFamily: theme.typography.fontFamily,
    color: theme.colors.neonPurpleLight,
    fontSize: 12,
    fontWeight: 'bold',
  },
  scrollContent: {
    paddingHorizontal: 24,
    gap: 8,
  },
  dayCard: {
    width: 52,
    height: 70,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  dayCardSelected: {
    backgroundColor: 'rgba(123, 44, 191, 0.3)',
    borderColor: theme.colors.neonPurple,
  },
  dayOfWeek: {
    fontFamily: theme.typography.fontFamily,
    color: theme.colors.textSecondary,
    fontSize: 11,
    marginBottom: 2,
  },
  dayNumber: {
    fontFamily: theme.typography.fontFamily,
    color: theme.colors.textPrimary,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  textSelected: {
    color: '#fff',
  },
  dotContainer: {
    flexDirection: 'row',
    gap: 4,
    height: 4,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  dotPlaceholder: {
    width: 4,
    height: 4,
  }
});
