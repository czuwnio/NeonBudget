import React, { useState, useEffect, useRef, useMemo } from 'react';
import { StyleSheet, Text, View, ScrollView, Alert, LayoutAnimation, Platform, UIManager, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Wallet, Download, Settings, Search, TrendingUp, Flame } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { theme } from './src/theme/theme';
import { Transaction } from './src/types';

import { BalanceCard } from './src/components/BalanceCard';
import { TransactionForm } from './src/components/TransactionForm';
import { CategoryChart } from './src/components/CategoryChart';
import { TransactionList } from './src/components/TransactionList';
import { MonthSelector } from './src/components/MonthSelector';
import { SettingsModal } from './src/components/SettingsModal';
import { InsightsModal } from './src/components/InsightsModal';
import { SavingsGoals, SavingsGoal } from './src/components/SavingsGoals';
import { Subscriptions, Subscription } from './src/components/Subscriptions';
import { DateStrip } from './src/components/DateStrip';
import { AppLock } from './src/components/AppLock';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

if (Platform.OS === 'web') {
  const style = document.createElement('style');
  style.type = 'text/css';
  style.appendChild(document.createTextNode(`
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap');
    body { font-family: 'Outfit', sans-serif; }
  `));
  document.head.appendChild(style);
}

export default function App() {
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [validationError, setValidationError] = useState('');
  
  const [expenseCategories, setExpenseCategories] = useState(['Jedzenie', 'Czynsz', 'Transport', 'Rachunki', 'Inne']);
  const [incomeCategories, setIncomeCategories] = useState(['Wypłata', 'Inne']);
  const [monthlyLimit, setMonthlyLimit] = useState<number>(0);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isSettingsVisible, setSettingsVisible] = useState(false);
  const [isInsightsVisible, setInsightsVisible] = useState(false);
  const [editingTransactionId, setEditingTransactionId] = useState<string | null>(null);

  const now = new Date();
  const initialMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const [selectedMonthKey, setSelectedMonthKey] = useState(initialMonthKey);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'expense' | 'income'>('all');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [savedPin, setSavedPin] = useState<string | null>(null);
  const [isAppLocked, setIsAppLocked] = useState<boolean>(true);
  const [isAppReady, setIsAppReady] = useState(false);

  const queueRef = useRef<Promise<void>>(Promise.resolve());

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const storedTx = await AsyncStorage.getItem('neon-budget-transactions');
        if (storedTx) {
          const parsed = JSON.parse(storedTx);
          if (Array.isArray(parsed)) setAllTransactions(parsed);
        }

        const storedExpenseCats = await AsyncStorage.getItem('neon-budget-expense-cats');
        if (storedExpenseCats) {
          const parsed = JSON.parse(storedExpenseCats);
          if (Array.isArray(parsed) && parsed.length > 0) setExpenseCategories(parsed);
        }

        const storedIncomeCats = await AsyncStorage.getItem('neon-budget-income-cats');
        if (storedIncomeCats) {
          const parsed = JSON.parse(storedIncomeCats);
          if (Array.isArray(parsed) && parsed.length > 0) setIncomeCategories(parsed);
        }

        const storedLimit = await AsyncStorage.getItem('neon-budget-limit');
        if (storedLimit) {
          setMonthlyLimit(parseFloat(storedLimit));
        }

        const storedSavings = await AsyncStorage.getItem('neon-budget-savings');
        if (storedSavings) {
          const parsed = JSON.parse(storedSavings);
          if (Array.isArray(parsed)) setSavingsGoals(parsed);
        }

        const storedSubs = await AsyncStorage.getItem('neon-budget-subs');
        if (storedSubs) {
          const parsed = JSON.parse(storedSubs);
          if (Array.isArray(parsed)) setSubscriptions(parsed);
        }

        const storedPin = await AsyncStorage.getItem('neon-budget-pin');
        if (storedPin) {
          setSavedPin(storedPin);
        } else {
          setIsAppLocked(false);
        }
      } catch (e) {} finally {
        setIsAppReady(true);
      }
    };
    loadInitialData();
  }, []);

  const handleUpdateCategories = async (type: 'expense' | 'income', newCats: string[]) => {
    if (type === 'expense') {
      setExpenseCategories(newCats);
      await AsyncStorage.setItem('neon-budget-expense-cats', JSON.stringify(newCats));
    } else {
      setIncomeCategories(newCats);
      await AsyncStorage.setItem('neon-budget-income-cats', JSON.stringify(newCats));
    }
  };

  const handleAddCategory = async (type: 'expense' | 'income', cat: string) => {
    if (type === 'expense') {
      const updated = [...expenseCategories, cat];
      await handleUpdateCategories('expense', updated);
    } else {
      const updated = [...incomeCategories, cat];
      await handleUpdateCategories('income', updated);
    }
  };

  const handleDeleteCategory = async (type: 'expense' | 'income', cat: string) => {
    if (type === 'expense') {
      const updated = expenseCategories.filter(c => c !== cat);
      await handleUpdateCategories('expense', updated);
    } else {
      const updated = incomeCategories.filter(c => c !== cat);
      await handleUpdateCategories('income', updated);
    }
  };

  const handleUpdateLimit = (limit: number) => {
    queueRef.current = queueRef.current.then(async () => {
      setMonthlyLimit(limit);
      await AsyncStorage.setItem('neon-budget-limit', limit.toString());
    });
  };

  const handleUpdatePin = (pin: string | null) => {
    queueRef.current = queueRef.current.then(async () => {
      setSavedPin(pin);
      if (pin) {
        await AsyncStorage.setItem('neon-budget-pin', pin);
      } else {
        await AsyncStorage.removeItem('neon-budget-pin');
      }
    });
  };

  const handleSubmitTransaction = (amount: string, description: string, type: 'income' | 'expense', category: string, dateStr?: string) => {
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

    let finalDate = new Date().toISOString();
    if (dateStr) {
      const d = new Date(dateStr);
      if (!isNaN(d.getTime())) {
        finalDate = d.toISOString();
      }
    }

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

        let updatedTransactions;

        if (editingTransactionId) {
          updatedTransactions = latestList.map(t => 
            t.id === editingTransactionId 
              ? { ...t, amount: finalAmount, description: trimmedDesc, type, category } 
              : t
          );
          setEditingTransactionId(null);
        } else {
          const newTx: Transaction = {
            id: String(Date.now() + Math.random()),
            amount: finalAmount,
            description: trimmedDesc,
            type,
            category,
            date: new Date().toISOString(),
          };
          updatedTransactions = [newTx, ...latestList];
          
          const now = new Date();
          const nowKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
          setSelectedMonthKey(nowKey);
        }

        await AsyncStorage.setItem('neon-budget-transactions', JSON.stringify(updatedTransactions));
        
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setAllTransactions(updatedTransactions);
      } catch (err) {
        Alert.alert('Błąd', 'Nie udało się zapisać transakcji');
      }
    });
  };

  const handleEditTransaction = (t: Transaction) => {
    setEditingTransactionId(t.id);
  };

  const handleCancelEdit = () => {
    setEditingTransactionId(null);
    setValidationError('');
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
      await AsyncStorage.removeItem('neon-budget-savings');
      await AsyncStorage.removeItem('neon-budget-subs');
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setAllTransactions([]);
      setSavingsGoals([]);
      setSubscriptions([]);
    });
  };

  const handleAddGoal = (name: string, target: number) => {
    queueRef.current = queueRef.current.then(async () => {
      const COLORS = ['#7B2CBF', '#00F0FF', '#39FF14', '#FF007F', '#FF9F1C'];
      const newGoal: SavingsGoal = {
        id: String(Date.now() + Math.random()),
        name,
        targetAmount: target,
        currentAmount: 0,
        color: COLORS[savingsGoals.length % COLORS.length]
      };
      const updated = [...savingsGoals, newGoal];
      setSavingsGoals(updated);
      await AsyncStorage.setItem('neon-budget-savings', JSON.stringify(updated));
    });
  };

  const handleAddFunds = (id: string, amount: number) => {
    queueRef.current = queueRef.current.then(async () => {
      const updated = savingsGoals.map(g => g.id === id ? { ...g, currentAmount: g.currentAmount + amount } : g);
      setSavingsGoals(updated);
      await AsyncStorage.setItem('neon-budget-savings', JSON.stringify(updated));
    });
  };

  const handleDeleteGoal = (id: string) => {
    queueRef.current = queueRef.current.then(async () => {
      const updated = savingsGoals.filter(g => g.id !== id);
      setSavingsGoals(updated);
      await AsyncStorage.setItem('neon-budget-savings', JSON.stringify(updated));
    });
  };

  const handleAddSub = (name: string, amount: number) => {
    queueRef.current = queueRef.current.then(async () => {
      const newSub: Subscription = { id: String(Date.now() + Math.random()), name, amount };
      const updated = [...subscriptions, newSub];
      setSubscriptions(updated);
      await AsyncStorage.setItem('neon-budget-subs', JSON.stringify(updated));
    });
  };

  const handleDeleteSub = (id: string) => {
    queueRef.current = queueRef.current.then(async () => {
      const updated = subscriptions.filter(s => s.id !== id);
      setSubscriptions(updated);
      await AsyncStorage.setItem('neon-budget-subs', JSON.stringify(updated));
    });
  };

  const handlePaySub = (sub: Subscription) => {
    handleSubmitTransaction(String(sub.amount), `Subskrypcja: ${sub.name}`, 'expense', 'Rachunki', new Date().toISOString().split('T')[0]);
    if (Platform.OS !== 'web') {
      Alert.alert('Opłacono', `Dodano wydatek za: ${sub.name}`);
    } else {
      window.alert(`Dodano wydatek za: ${sub.name}`);
    }
  };

  const handleExportCSV = () => {
    if (allTransactions.length === 0) {
      Alert.alert('Brak danych', 'Nie masz żadnych transakcji do wyeksportowania.');
      return;
    }

    const headers = 'ID,Data,Typ,Kategoria,Kwota,Opis\n';
    const rows = allTransactions.map(t => {
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

  const handleImportData = (data: Transaction[]) => {
    queueRef.current = queueRef.current.then(async () => {
      try {
        await AsyncStorage.setItem('neon-budget-transactions', JSON.stringify(data));
        setAllTransactions(data);
      } catch (e) {
        Alert.alert('Błąd', 'Nie udało się wgrać danych.');
      }
    });
  };

  const currentMonthTransactions = useMemo(() => {
    return allTransactions.filter(t => {
      const d = new Date(t.date);
      const tMonthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      return tMonthKey === selectedMonthKey;
    });
  }, [allTransactions, selectedMonthKey]);

  const displayedTransactions = useMemo(() => {
    return currentMonthTransactions.filter(t => {
      const matchesSearch = t.description.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            t.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filterType === 'all' || t.type === filterType;
      const matchesDate = selectedDate ? t.date.startsWith(selectedDate) : true;
      return matchesSearch && matchesFilter && matchesDate;
    });
  }, [currentMonthTransactions, searchQuery, filterType, selectedDate]);

  const prevMonthKey = useMemo(() => {
    const [y, m] = selectedMonthKey.split('-');
    let date = new Date(parseInt(y), parseInt(m) - 1, 1);
    date.setMonth(date.getMonth() - 1);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  }, [selectedMonthKey]);

  const prevMonthTransactions = useMemo(() => {
    return allTransactions.filter(t => {
      const d = new Date(t.date);
      const tMonthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      return tMonthKey === prevMonthKey;
    });
  }, [allTransactions, prevMonthKey]);

  const prevTotalExpense = prevMonthTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalIncome = displayedTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = displayedTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpense;

  const streakDays = useMemo(() => {
    const uniqueDates = Array.from(new Set(allTransactions.map(t => t.date.split('T')[0]))).sort().reverse();
    if (uniqueDates.length === 0) return 0;
    
    let currentStreak = 0;
    let expectedDate = new Date();
    const todayStr = expectedDate.toISOString().split('T')[0];
    let startIndex = uniqueDates.indexOf(todayStr);
    
    if (startIndex === -1) {
      expectedDate.setDate(expectedDate.getDate() - 1);
      const yesterdayStr = expectedDate.toISOString().split('T')[0];
      startIndex = uniqueDates.indexOf(yesterdayStr);
      if (startIndex === -1) return 0;
    }
    
    for (let i = startIndex; i < uniqueDates.length; i++) {
      if (uniqueDates[i] === expectedDate.toISOString().split('T')[0]) {
        currentStreak++;
        expectedDate.setDate(expectedDate.getDate() - 1);
      } else {
        break;
      }
    }
    return currentStreak;
  }, [allTransactions]);

  if (!isAppReady) {
    return <View style={styles.container} />;
  }

  if (savedPin && isAppLocked) {
    return (
      <View style={styles.container}>
        <AppLock onUnlock={() => setIsAppLocked(false)} savedPin={savedPin} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
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
              <View style={styles.headerRight}>
                {streakDays > 0 && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 12, backgroundColor: 'rgba(255, 159, 28, 0.15)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255, 159, 28, 0.3)' }}>
                    <Flame size={16} color="#FF9F1C" />
                    <Text style={{ color: '#FF9F1C', fontWeight: 'bold', marginLeft: 4, fontFamily: theme.typography.fontFamily }}>{streakDays}</Text>
                  </View>
                )}
                <TouchableOpacity onPress={() => setInsightsVisible(true)} style={styles.headerIcon}>
                  <TrendingUp size={24} color={theme.colors.textPrimary} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setSettingsVisible(true)} style={styles.headerIcon}>
                  <Settings size={24} color={theme.colors.textPrimary} />
                </TouchableOpacity>
              </View>
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
              monthlyLimit={monthlyLimit}
              prevTotalExpense={prevTotalExpense}
            />

            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
              <TouchableOpacity style={styles.quickActionBtn} onPress={() => handleSubmitTransaction('50', 'Spożywcze', 'expense', 'Jedzenie')}>
                <Text style={styles.quickActionText}>-50 Spożywcze</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.quickActionBtn} onPress={() => handleSubmitTransaction('150', 'Paliwo', 'expense', 'Transport')}>
                <Text style={styles.quickActionText}>-150 Paliwo</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.quickActionBtn} onPress={() => handleSubmitTransaction('15', 'Kawa', 'expense', 'Inne')}>
                <Text style={styles.quickActionText}>-15 Kawa</Text>
              </TouchableOpacity>
            </View>

            <CategoryChart 
              transactions={displayedTransactions} 
              totalExpense={displayedTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)} 
            />

            <DateStrip 
              selectedMonthKey={selectedMonthKey}
              transactions={currentMonthTransactions}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
            />

            <SavingsGoals 
              goals={savingsGoals}
              onAddGoal={handleAddGoal}
              onAddFunds={handleAddFunds}
              onDeleteGoal={handleDeleteGoal}
            />

            <Subscriptions 
              subs={subscriptions}
              onAddSub={handleAddSub}
              onDeleteSub={handleDeleteSub}
              onPaySub={handlePaySub}
            />

            <TransactionForm 
              onSubmitTransaction={handleSubmitTransaction} 
              validationError={validationError} 
              expenseCategories={expenseCategories}
              incomeCategories={incomeCategories}
              transactionToEdit={allTransactions.find(t => t.id === editingTransactionId)}
              onCancelEdit={handleCancelEdit}
            />

            <View style={styles.searchContainer}>
              <Search size={20} color={theme.colors.textSecondary} />
              <TextInput 
                style={styles.searchInput}
                placeholder="Szukaj po tytule lub kategorii..."
                placeholderTextColor={theme.colors.textSecondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            <View style={styles.filterTabs}>
              <TouchableOpacity onPress={() => setFilterType('all')} style={[styles.filterTab, filterType === 'all' && styles.filterTabActive]}>
                <Text style={[styles.filterTabText, filterType === 'all' && styles.filterTabTextActive]}>Wszystko</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setFilterType('expense')} style={[styles.filterTab, filterType === 'expense' && styles.filterTabActive]}>
                <Text style={[styles.filterTabText, filterType === 'expense' && styles.filterTabTextActive]}>Wydatki</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setFilterType('income')} style={[styles.filterTab, filterType === 'income' && styles.filterTabActive]}>
                <Text style={[styles.filterTabText, filterType === 'income' && styles.filterTabTextActive]}>Przychody</Text>
              </TouchableOpacity>
            </View>

            <TransactionList 
              transactions={displayedTransactions} 
              searchQuery={searchQuery}
              onDeleteTransaction={handleDeleteTransaction} 
              onEditTransaction={handleEditTransaction}
              onTagClick={(tag) => {
                if (!searchQuery.includes(tag)) {
                  setSearchQuery(searchQuery ? `${searchQuery} ${tag}`.trim() : tag);
                }
              }}
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

            <SettingsModal 
              visible={isSettingsVisible} 
              onClose={() => setSettingsVisible(false)}
              expenseCategories={expenseCategories}
              incomeCategories={incomeCategories}
              onAddCategory={handleAddCategory}
              onDeleteCategory={handleDeleteCategory}
              monthlyLimit={monthlyLimit}
              onUpdateLimit={handleUpdateLimit}
              allTransactions={allTransactions}
              onImportData={handleImportData}
              savedPin={savedPin}
              onUpdatePin={handleUpdatePin}
            />

            <InsightsModal
              visible={isInsightsVisible}
              onClose={() => setInsightsVisible(false)}
              transactions={currentMonthTransactions}
              allTransactions={allTransactions}
              selectedMonthKey={selectedMonthKey}
            />

          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
      </SafeAreaView>
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
    padding: theme.spacing.lg,
    paddingBottom: 100,
  },
  quickActionBtn: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionText: {
    fontFamily: theme.typography.fontFamily,
    color: theme.colors.textSecondary,
    fontSize: 11,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
    gap: 12,
  },
  headerTitle: {
    fontFamily: theme.typography.fontFamily,
    fontWeight: 'bold',
    fontSize: 24,
    color: theme.colors.textPrimary,
    letterSpacing: 0.5,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  headerIcon: {
    padding: 4,
  },
  title: {
    fontFamily: theme.typography.fontFamily, fontWeight: 'bold',
    fontSize: 28,
    color: theme.colors.textPrimary,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontFamily: theme.typography.fontFamily, fontWeight: '500',
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
    fontFamily: theme.typography.fontFamily, fontWeight: '500',
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
    fontFamily: theme.typography.fontFamily, fontWeight: '500',
    color: theme.colors.danger,
    fontSize: 12,
    letterSpacing: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: 14,
    marginBottom: 16,
    height: 48,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    color: theme.colors.textPrimary,
    fontFamily: theme.typography.fontFamily,
    fontSize: 14,
    height: '100%',
  },
  filterTabs: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  filterTabActive: {
    backgroundColor: 'rgba(123, 44, 191, 0.2)',
    borderColor: theme.colors.neonPurple,
  },
  filterTabText: {
    fontFamily: theme.typography.fontFamily,
    color: theme.colors.textSecondary,
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  filterTabTextActive: {
    color: theme.colors.textPrimary,
    fontWeight: 'bold',
  }
});
