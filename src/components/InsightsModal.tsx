import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { X, TrendingUp, AlertTriangle, Calendar } from 'lucide-react-native';
import { theme } from '../theme/theme';
import { Transaction } from '../types';

interface InsightsModalProps {
  visible: boolean;
  onClose: () => void;
  transactions: Transaction[];
  allTransactions: Transaction[];
  selectedMonthKey: string;
}

export const InsightsModal: React.FC<InsightsModalProps> = ({ visible, onClose, transactions, allTransactions, selectedMonthKey }) => {
  const expenses = transactions.filter(t => t.type === 'expense');
  const totalExpense = expenses.reduce((sum, t) => sum + t.amount, 0);
  
  const [y, m] = selectedMonthKey.split('-');
  const daysInMonth = new Date(parseInt(y), parseInt(m), 0).getDate();
  
  const now = new Date();
  const isCurrentMonth = now.getFullYear() === parseInt(y) && (now.getMonth() + 1) === parseInt(m);
  const elapsedDays = isCurrentMonth ? now.getDate() : daysInMonth;

  const avgDaily = elapsedDays > 0 ? totalExpense / Math.max(elapsedDays, 1) : 0;
  const projected = avgDaily * daysInMonth;

  const biggestExpense = expenses.length > 0 ? expenses.reduce((prev, curr) => (prev.amount > curr.amount) ? prev : curr) : null;

  const totalAllTimeIncome = allTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalAllTimeExpense = allTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const totalNetWorth = totalAllTimeIncome - totalAllTimeExpense;

  const formatPLN = (val: number) => `${val.toFixed(2)} PLN`;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFillObject} />
        
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Statystyki i Analiza</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={24} color={theme.colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <TrendingUp size={20} color={theme.colors.neonGreen} />
                <Text style={styles.cardTitle}>Całkowite Oszczędności (All-time)</Text>
              </View>
              <Text style={[styles.cardValue, { color: totalNetWorth >= 0 ? theme.colors.neonGreen : theme.colors.danger }]}>
                {formatPLN(totalNetWorth)}
              </Text>
              <Text style={styles.cardDesc}>Zgromadzony kapitał od początku</Text>
            </View>

            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Calendar size={20} color={theme.colors.neonPurple} />
                <Text style={styles.cardTitle}>Średnio dziennie (Ten miesiąc)</Text>
              </View>
              <Text style={styles.cardValue}>{formatPLN(avgDaily)}</Text>
            </View>

            {isCurrentMonth && (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <TrendingUp size={20} color={'#FF9F1C'} />
                  <Text style={styles.cardTitle}>Prognoza na koniec miesiąca</Text>
                </View>
                <Text style={styles.cardValue}>{formatPLN(projected)}</Text>
                <Text style={styles.cardDesc}>Przy obecnym tempie wydatków</Text>
              </View>
            )}

            {biggestExpense && (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <AlertTriangle size={20} color={theme.colors.danger} />
                  <Text style={styles.cardTitle}>Największy wydatek</Text>
                </View>
                <Text style={styles.cardValue}>{formatPLN(biggestExpense.amount)}</Text>
                <Text style={styles.cardDesc}>{biggestExpense.description} ({biggestExpense.category})</Text>
              </View>
            )}

            {expenses.length === 0 && (
              <Text style={styles.emptyText}>Brak wydatków w tym miesiącu do analizy.</Text>
            )}

          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    padding: Platform.OS === 'web' ? 20 : 0,
    backgroundColor: 'rgba(5, 5, 10, 0.7)',
  },
  modalContent: {
    backgroundColor: theme.colors.surfaceDark,
    margin: Platform.OS === 'web' ? 'auto' : 20,
    width: Platform.OS === 'web' ? 450 : 'auto',
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: theme.colors.glassBorder,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  title: {
    fontFamily: theme.typography.fontFamily,
    fontWeight: 'bold',
    fontSize: 20,
    color: theme.colors.textPrimary,
  },
  closeBtn: {
    padding: 4,
  },
  content: {
    padding: 20,
    gap: 16,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: theme.borderRadius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  cardTitle: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontWeight: '500',
    letterSpacing: 1,
  },
  cardValue: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
  },
  cardDesc: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 4,
    fontStyle: 'italic',
  },
  emptyText: {
    fontFamily: theme.typography.fontFamily,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: 20,
  }
});
