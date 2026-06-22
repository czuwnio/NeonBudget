import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, ScrollView, Alert, LayoutAnimation, Platform, UIManager } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { theme } from './src/theme/theme';
import { Transaction } from './src/types';

import { BalanceCard } from './src/components/BalanceCard';
import { TransactionForm } from './src/components/TransactionForm';
import { CategoryChart } from './src/components/CategoryChart';
import { TransactionList } from './src/components/TransactionList';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function App() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [validationError, setValidationError] = useState('');
  
  // Queue to handle rapid/parallel state updates safely
  const queueRef = useRef<Promise<void>>(Promise.resolve());

  useEffect(() => {
    const loadTransactions = async () => {
      try {
        const stored = await AsyncStorage.getItem('neon-budget-transactions');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            setTransactions(parsed);
          }
        }
      } catch (e) {
        setTransactions([]);
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
        setTransactions(updatedTransactions);
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
        setTransactions(updatedTransactions);
      } catch (err) {
        Alert.alert('Błąd', 'Nie udało się usunąć transakcji');
      }
    });
  };

  // Calculations
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
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

          <BalanceCard 
            balance={balance} 
            totalIncome={totalIncome} 
            totalExpense={totalExpense} 
          />

          <CategoryChart 
            transactions={transactions} 
            totalExpense={totalExpense} 
          />

          <TransactionForm 
            onAddTransaction={handleAddTransaction} 
            validationError={validationError} 
          />

          <TransactionList 
            transactions={transactions} 
            onDeleteTransaction={handleDeleteTransaction} 
          />

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
});
