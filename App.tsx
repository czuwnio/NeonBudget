import React, { useState, useEffect, useRef, useMemo } from 'react';
import { StyleSheet, Text, View, ScrollView, Alert, LayoutAnimation, Platform, UIManager, TouchableOpacity } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Wallet, Download } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { useFonts, Inter_400Regular, Inter_500Medium, Inter_700Bold } from '@expo-google-fonts/inter';

import { theme } from './src/theme/theme';
import { Transaction } from './src/types';

import { BalanceCard } from './src/components/BalanceCard';
import { TransactionForm } from './src/components/TransactionForm';
import { CategoryChart } from './src/components/CategoryChart';
import { TransactionList } from './src/components/TransactionList';
import { MonthSelector } from './src/components/MonthSelector';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function App() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_700Bold,
  });

  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [validationError, setValidationError] = useState('');
  
  const now = new Date();
  const initialMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const [selectedMonthKey, setSelectedMonthKey] = useState(initialMonthKey);

  const queueRef = useRef<Promise<void>>(Promise.resolve());

  useEffect(() => {
    const loadTransactions = async () => {
      try {
        const stored = await AsyncStorage.getItem('neon-budget-transactions');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            setAllTransactions(parsed);
          }
        }
      } catch (e) {}
    };
    loadTransactions();
  }, []);

  const handleAddTransaction = (amount: string, description: string, type: 'income' | 'expense', category: string) => {
    const trimmedDesc = description.trim();
    if (!trimmedDesc || !amount) {
      setValidationError('Błąd walidacji: opis i kwota są wymagane');
      return;
    }

    const parsedAmount = parseFloat(amount.replace(',', '.'));
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setValidationError('Błąd walidacji: kwota musi być dodatnia');
      return;
    }

    setValidationError('');
    const finalAmount = Math.round(parsedAmount * 100) / 100;

    const newTx: Transaction = {
      id: String(Date.now() + Math.random()),
      amount: finalAmount,
      description: trimmedDesc,
      type,
      category,
      date: new Date().toISOString(),
    };

    queueRef.current = queueRef.current.then(async () => {
      try {
        const stored = await AsyncStorage.getItem('neon-budget-transactions');
        let latestList: Transaction[] = [];
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed)) latestList = parsed;
          } catch (e) {}
        }

        const updatedTransactions = [newTx, ...latestList];
        await AsyncStorage.setItem('neon-budget-transactions', JSON.stringify(updatedTransactions));
        
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setAllTransactions(updatedTransactions);
        
        const now = new Date();
        const nowKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        setSelectedMonthKey(nowKey);
      } catch (err) {
        Alert.alert('Błąd', 'Nie udało się zapisać transakcji');
      }
    });
  };

  const handleDeleteTransaction = (id: string) => {
    queueRef.current = queueRef.current.then(async () => {
      try {
        const stored = await AsyncStorage.getItem('neon-budget-transactions');
        let latestList: Transaction[] = [];
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed)) latestList = parsed;
          } catch (e) {}
        }

        const updatedTransactions = latestList.filter(t => t.id !== id);
        await AsyncStorage.setItem('neon-budget-transactions', JSON.stringify(updatedTransactions));
        
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setAllTransactions(updatedTransactions);
      } catch (err) {
        Alert.alert('Błąd', 'Nie udało się usunąć transakcji');
      }
    });
  };

  const handleClearAll = () => {
    if (Platform.OS === 'web') {
      if (window.confirm('CZY NA PEWNO chcesz usunąć absolutnie wszystkie transakcje ze wszystkich miesięcy? Tego nie da się cofnąć!')) {
        performClear();
      }
    } else {
      Alert.alert(
        'UWAGA', 
        'CZY NA PEWNO chcesz usunąć absolutnie wszystkie transakcje ze wszystkich miesięcy? Tego nie da się cofnąć!',
        [
          { text: 'Anuluj', style: 'cancel' },
          { text: 'Usuń wszystko', style: 'destructive', onPress: performClear }
        ]
      );
    }
  };

  const performClear = async () => {
    queueRef.current = queueRef.current.then(async () => {
      await AsyncStorage.removeItem('neon-budget-transactions');
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setAllTransactions([]);
    });
  };

  const handleExportCSV = () => {
    if (allTransactions.length === 0) {
      Alert.alert('Brak danych', 'Nie masz żadnych transakcji do wyeksportowania.');
      return;
    }

    const headers = 'ID,Data,Typ,Kategoria,Kwota,Opis\n';
    const rows = allTransactions.map(t => {
      // Escape commas and quotes in description
      const safeDesc = `"${t.description.replace(/"/g, '""')}"`;
      return `${t.id},${t.date},${t.type},${t.category},${t.amount},${safeDesc}`;
    }).join('\n');

    const csvContent = headers + rows;

    if (Platform.OS === 'web') {
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'neon_budget_export.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      Alert.alert('Sukces', 'Funkcja eksportu do CSV działa tylko na stronie WWW w tej wersji.');
    }
  };

  const currentMonthTransactions = useMemo(() => {
    return allTransactions.filter(t => {
      const d = new Date(t.date);
      const tMonthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      return tMonthKey === selectedMonthKey;
    });
  }, [allTransactions, selectedMonthKey]);

  const totalIncome = currentMonthTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = currentMonthTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpense;

  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: '#05050A' }} />;
  }

  return (
    <SafeAreaProvider>
      <LinearGradient
        colors={['#0f0518', '#05050A', '#020205']}
        style={styles.container}
      >
        <SafeAreaView style={styles.safeArea}>
          <StatusBar style="light" />
          <ScrollView contentContainerStyle={styles.contentContainer}>
            <View style={styles.header}>
              <Wallet size={28} color={theme.colors.neonPurpleLight} />
              <Text style={styles.title}>NeonBudget</Text>
            </View>
            <Text style={styles.subtitle}>Ekskluzywne zarządzanie finansami</Text>

            <MonthSelector 
              currentMonthKey={selectedMonthKey} 
              onMonthChange={setSelectedMonthKey} 
            />

            <BalanceCard 
              balance={balance} 
              totalIncome={totalIncome} 
              totalExpense={totalExpense} 
            />

            <CategoryChart 
              transactions={currentMonthTransactions} 
              totalExpense={totalExpense} 
            />

            <TransactionForm 
              onAddTransaction={handleAddTransaction} 
              validationError={validationError} 
            />

            <TransactionList 
              transactions={currentMonthTransactions} 
              onDeleteTransaction={handleDeleteTransaction} 
            />

            <View style={styles.actionZone}>
              <TouchableOpacity onPress={handleExportCSV} style={styles.exportBtn}>
                <Download size={16} color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text style={styles.exportBtnText}>Pobierz CSV</Text>
              </TouchableOpacity>
              
              <TouchableOpacity onPress={handleClearAll} style={styles.clearBtn}>
                <Text style={styles.clearBtnText}>Wyczyść wszystko</Text>
              </TouchableOpacity>
            </View>

          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
    gap: 12,
  },
  title: {
    fontFamily: theme.typography.fontBold,
    fontSize: 28,
    color: theme.colors.textPrimary,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontFamily: theme.typography.fontMedium,
    fontSize: 13,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
    letterSpacing: 0.5,
  },
  actionZone: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  exportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  exportBtnText: {
    fontFamily: theme.typography.fontMedium,
    color: '#FFFFFF',
    fontSize: 12,
    letterSpacing: 1,
  },
  clearBtn: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 77, 77, 0.2)',
    borderRadius: 100,
    backgroundColor: 'rgba(255, 77, 77, 0.05)',
    justifyContent: 'center',
  },
  clearBtnText: {
    fontFamily: theme.typography.fontMedium,
    color: theme.colors.danger,
    fontSize: 12,
    letterSpacing: 1,
  }
});
