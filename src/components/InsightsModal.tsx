import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { BlurView } from 'expo-blur';
import { X, TrendingUp, AlertTriangle, Calendar, Star, PieChart } from 'lucide-react-native';
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

  const largestExpense = expenses.length > 0 ? expenses.reduce((prev, curr) => (prev.amount > curr.amount) ? prev : curr) : null;

  const totalAllTimeIncome = allTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalAllTimeExpense = allTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const totalNetWorth = totalAllTimeIncome - totalAllTimeExpense;

  let rank = 'Początkujący';
  let rankColor = theme.colors.textSecondary;
  if (totalNetWorth >= 50000) { rank = 'Neonowy Król'; rankColor = '#FF00FF'; }
  else if (totalNetWorth >= 10000) { rank = 'Złoty Inwestor'; rankColor = '#FFD700'; }
  else if (totalNetWorth >= 5000) { rank = 'Srebrny Oszczędzacz'; rankColor = '#C0C0C0'; }
  else if (totalNetWorth >= 1000) { rank = 'Brązowy Oszczędzacz'; rankColor = '#CD7F32'; }

  const formatPLN = (val: number) => `${val.toFixed(2)} PLN`;

  const categoryTotals = expenses.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + t.amount;
    return acc;
  }, {} as Record<string, number>);

  const sortedCategories = Object.entries(categoryTotals)
    .sort(([, a], [, b]) => b - a);

  let smartInsight = "Trzymasz wydatki w ryzach, tak trzymaj! 🚀";
  if (sortedCategories.length > 0) {
    const topCat = sortedCategories[0];
    if (topCat[1] > totalExpense * 0.5 && totalExpense > 0) {
      smartInsight = `Uwaga: aż ${Math.round((topCat[1]/totalExpense)*100)}% Twoich wydatków idzie na "${topCat[0]}". Może warto poszukać oszczędności w tej kategorii? 🤔`;
    } else if (totalExpense > totalAllTimeIncome && totalAllTimeIncome > 0) {
      smartInsight = `Wydajesz więcej niż zarabiasz w ogólnym rozrachunku. Spróbuj zwolnić tempo! 📉`;
    } else if (avgDaily > 100) {
      smartInsight = `Wydajesz średnio ponad 100 PLN dziennie. Zwracaj uwagę na ukryte, drobne wydatki! 💸`;
    }
  }

  const uniqueCategories = new Set(allTransactions.map(t => t.category)).size;
  const achievements = [];
  if (allTransactions.length >= 1) achievements.push("🎯 Pierwszy krok");
  if (allTransactions.length >= 10) achievements.push("🔥 Rozgrzewka");
  if (allTransactions.length >= 50) achievements.push("💪 Weteran");
  if (uniqueCategories >= 5) achievements.push("🎨 Wielobarwny koszyk");
  if (totalNetWorth >= 1000) achievements.push("💰 Pierwszy tysiąc");
  if (totalNetWorth >= 10000) achievements.push("🚀 Kasa w kosmos");

  const maxCategoryAmount = sortedCategories.length > 0 ? sortedCategories[0][1] : 0;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFillObject} />
        
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <View style={{ flex: 1, paddingRight: 16, justifyContent: 'center' }}>
              <Text style={styles.title} numberOfLines={1} adjustsFontSizeToFit>Statystyki i Analiza</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={24} color={theme.colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            
            <View style={[styles.card, { borderColor: theme.colors.neonPurple, backgroundColor: 'rgba(157, 78, 221, 0.1)' }]}>
              <View style={styles.cardHeader}>
                <Star size={20} color={theme.colors.neonPurpleLight} />
                <Text style={[styles.cardTitle, { color: theme.colors.neonPurpleLight }]}>Inteligentna Analiza</Text>
              </View>
              <Text style={[styles.cardDesc, { color: '#fff', fontSize: 14, fontStyle: 'italic', marginTop: 4 }]}>
                "{smartInsight}"
              </Text>
            </View>

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
                <Star size={20} color={rankColor} />
                <Text style={styles.cardTitle}>Twój Status</Text>
              </View>
              <Text style={[styles.cardValue, { color: rankColor }]}>{rank}</Text>
              <Text style={styles.cardDesc}>Osiągnięcie odblokowane na podstawie salda</Text>
            </View>

            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Star size={20} color="#FFD700" />
                <Text style={styles.cardTitle}>Odznaki</Text>
              </View>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {achievements.map((ach, i) => (
                  <View key={i} style={styles.achievementBadge}>
                    <Text style={styles.achievementText}>{ach}</Text>
                  </View>
                ))}
                {achievements.length === 0 && <Text style={styles.cardDesc}>Zacznij działać, żeby zdobywać odznaki!</Text>}
              </View>
            </View>

            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <PieChart size={20} color={theme.colors.neonBlue} />
                <Text style={styles.cardTitle}>Struktura wydatków</Text>
              </View>
              <View style={{ marginTop: 8 }}>
                {sortedCategories.length > 0 ? (
                  sortedCategories.map(([cat, amount], idx) => {
                    const percentage = maxCategoryAmount > 0 ? (amount / maxCategoryAmount) * 100 : 0;
                    return (
                      <View key={cat} style={{ marginBottom: 16 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                          <Text style={styles.catName}>{idx + 1}. {cat}</Text>
                          <Text style={styles.catAmount}>{formatPLN(amount)}</Text>
                        </View>
                        <View style={{ height: 6, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 3, overflow: 'hidden' }}>
                          <View style={{ height: '100%', width: `${percentage}%`, backgroundColor: theme.colors.neonPurple, borderRadius: 3 }} />
                        </View>
                      </View>
                    );
                  })
                ) : (
                  <Text style={styles.cardDesc}>Brak danych</Text>
                )}
              </View>
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

            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <AlertTriangle size={20} color={theme.colors.danger} />
                <Text style={styles.cardTitle}>Największy wydatek (Ten miesiąc)</Text>
              </View>
              {largestExpense ? (
                <>
                  <Text style={[styles.cardValue, { color: theme.colors.danger }]}>{formatPLN(largestExpense.amount)}</Text>
                  <Text style={styles.cardDesc}>{largestExpense.description} ({largestExpense.category})</Text>
                </>
              ) : (
                <Text style={styles.cardDesc}>Brak wydatków</Text>
              )}
            </View>
          </ScrollView>
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
    maxHeight: '90%',
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
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: theme.borderRadius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    marginBottom: 16,
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
    fontWeight: 'bold',
    fontSize: 24,
    marginBottom: 4,
    color: theme.colors.textPrimary,
  },
  cardDesc: {
    fontFamily: theme.typography.fontFamily,
    color: theme.colors.textSecondary,
    fontSize: 12,
  },
  catRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  catName: {
    fontFamily: theme.typography.fontFamily,
    color: theme.colors.textPrimary,
    fontSize: 14,
  },
  catAmount: {
    fontFamily: theme.typography.fontFamily,
    color: theme.colors.danger,
    fontSize: 14,
    fontWeight: 'bold',
  },
  achievementBadge: {
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  achievementText: {
    color: '#FFD700',
    fontFamily: theme.typography.fontFamily,
    fontWeight: 'bold',
    fontSize: 12,
  }
});
