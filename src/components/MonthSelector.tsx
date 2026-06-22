import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { theme } from '../theme/theme';
import { BlurView } from 'expo-blur';

interface MonthSelectorProps {
  currentMonthKey: string; // Format: "YYYY-MM"
  onMonthChange: (newMonthKey: string) => void;
}

const getMonthName = (monthStr: string) => {
  const [year, month] = monthStr.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1, 1);
  const monthName = date.toLocaleString('pl-PL', { month: 'long' });
  return `${monthName.charAt(0).toUpperCase() + monthName.slice(1)} ${year}`;
};

export const MonthSelector: React.FC<MonthSelectorProps> = ({ currentMonthKey, onMonthChange }) => {
  const [year, month] = currentMonthKey.split('-').map(Number);

  const handlePrev = () => {
    const newMonth = month === 1 ? 12 : month - 1;
    const newYear = month === 1 ? year - 1 : year;
    const newKey = `${newYear}-${String(newMonth).padStart(2, '0')}`;
    onMonthChange(newKey);
  };

  const handleNext = () => {
    const newMonth = month === 12 ? 1 : month + 1;
    const newYear = month === 12 ? year + 1 : year;
    const newKey = `${newYear}-${String(newMonth).padStart(2, '0')}`;
    onMonthChange(newKey);
  };

  const handleCurrent = () => {
    const now = new Date();
    const newKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    onMonthChange(newKey);
  };

  return (
    <View style={styles.container}>
      <BlurView intensity={30} tint="dark" style={styles.glass}>
        <TouchableOpacity onPress={handlePrev} style={styles.btn}>
          <ChevronLeft size={20} color={theme.colors.textPrimary} />
        </TouchableOpacity>
        
        <TouchableOpacity onPress={handleCurrent} style={styles.centerBtn}>
          <Text style={styles.monthText}>{getMonthName(currentMonthKey)}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity onPress={handleNext} style={styles.btn}>
          <ChevronRight size={20} color={theme.colors.textPrimary} />
        </TouchableOpacity>
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
  },
  glass: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    backgroundColor: theme.colors.surfaceDark,
  },
  btn: {
    padding: theme.spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: theme.borderRadius.lg,
  },
  centerBtn: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
  },
  monthText: {
    fontFamily: theme.typography.fontFamily, fontWeight: 'bold',
    color: theme.colors.textPrimary,
    fontSize: 16,
    letterSpacing: 0.5,
  }
});
