import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { theme } from '../theme/theme';

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
      <TouchableOpacity onPress={handlePrev} style={styles.btn}>
        <ChevronLeft size={24} color={theme.colors.neonPurple} />
      </TouchableOpacity>
      
      <TouchableOpacity onPress={handleCurrent}>
        <Text style={styles.monthText}>{getMonthName(currentMonthKey)}</Text>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={handleNext} style={styles.btn}>
        <ChevronRight size={24} color={theme.colors.neonPurple} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceDark,
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: theme.colors.glassBorder,
  },
  btn: {
    padding: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
  },
  monthText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  }
});
