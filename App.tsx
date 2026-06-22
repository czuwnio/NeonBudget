import React, { useState, useEffect, useRef, useMemo } from 'react';
import { StyleSheet, Text, View, ScrollView, Alert, LayoutAnimation, Platform, UIManager, TouchableOpacity } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [validationError, setValidationError] = useState('');
  
  const now = new Date();
  const initialMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const [selectedMonthKey, setSelectedMonthKey] = useState(initialMonthKey);

  // Queue to handle rapid/parallel state updates safely
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
      } catch (e) {
        setAllTransactions([]);
      }
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
      date: new Date().toISOString(), // Always saves current real date
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
        
        // Auto switch to current month if we add a transaction today
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

  // Filter transactions for the selected month
  const currentMonthTransactions = useMemo(() => {
    return allTransactions.filter(t => {
      const d = new Date(t.date);
      const tMonthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      return tMonthKey === selectedMonthKey;
    });
  }, [allTransactions, selectedMonthKey]);

  // Calculations for selected month
  const totalIncome = currentMonthTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = currentMonthTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpense;

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container} testID="app-container">
        <StatusBar style="light" />
        <ScrollView contentContainerStyle={styles.contentContainer} testID="app-content">
          <Text style={styles.title} testID="app-title">NeonBudget</Text>
          <Text style={styles.subtitle} testID="app-subtitle">Śledź swoje bogactwo w neonowym świetle</Text>

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

          <View style={styles.dangerZone}>
            <TouchableOpacity onPress={handleClearAll} style={styles.clearBtn}>
              <Text style={styles.clearBtnText}>Wyczyść wszystkie dane (Zresetuj)</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  contentContainer: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.neonPurple,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  dangerZone: {
    marginTop: 10,
    marginBottom: 40,
    alignItems: 'center',
  },
  clearBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#FF6B6B',
    borderRadius: 8,
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
  },
  clearBtnText: {
    color: '#FF6B6B',
    fontSize: 12,
    fontWeight: 'bold',
  }
});
