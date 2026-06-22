import React, { useState, useEffect, useRef, useMemo } from 'react';
import { StyleSheet, Text, View, ScrollView, Alert, LayoutAnimation, Platform, UIManager, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Wallet, Download, Settings, Search, TrendingUp, Flame, Star, X } from 'lucide-react-native';
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

class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error: Error | null}> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#05050A', padding: 20 }}>
          <Text style={{ color: 'red', fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>CRASH:</Text>
          <Text style={{ color: '#fff', fontSize: 14 }}>{this.state.error?.message}</Text>
          <Text style={{ color: '#888', fontSize: 10, marginTop: 10 }}>{this.state.error?.stack}</Text>
        </View>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <MainApp />
    </ErrorBoundary>
  );
}

function MainApp() {
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [validationError, setValidationError] = useState('');
  
  const [expenseCategories, setExpenseCategories] = useState(['Jedzenie', 'Czynsz', 'Transport', 'Rachunki', 'Inne']);
  const [incomeCategories, setIncomeCategories] = useState(['Wypłata', 'Inne']);
  const [monthlyLimit, setMonthlyLimit] = useState<number>(0);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [liveRates, setLiveRates] = useState<{ USD: number; EUR: number; GBP: number }>({ USD: 4.0, EUR: 4.3, GBP: 5.0 });
  const [isSettingsVisible, setSettingsVisible] = useState(false);
  const [isInsightsVisible, setInsightsVisible] = useState(false);
  const [editingTransactionId, setEditingTransactionId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [customTags, setCustomTags] = useState<string[]>(['zakupy', 'weekend', 'paliwo', 'rachunki', 'wyjazd', 'jedzenie']);
  const [biometricsEnabled, setBiometricsEnabled] = useState<boolean>(true);
  const prevLevelRef = useRef(1);

  const now = new Date();
  const initialMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const [selectedMonthKey, setSelectedMonthKey] = useState(initialMonthKey);
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

        const storedTags = await AsyncStorage.getItem('neon-budget-custom-tags');
        if (storedTags) {
          const parsed = JSON.parse(storedTags);
          if (Array.isArray(parsed) && parsed.length > 0) setCustomTags(parsed);
        }

        const storedBiometrics = await AsyncStorage.getItem('neon-budget-biometrics');
        if (storedBiometrics !== null) {
          setBiometricsEnabled(storedBiometrics === 'true');
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

  const handleUpdateCustomTags = (tags: string[]) => {
    queueRef.current = queueRef.current.then(async () => {
      setCustomTags(tags);
      await AsyncStorage.setItem('neon-budget-custom-tags', JSON.stringify(tags));
    });
  };

  const handleUpdateBiometrics = (enabled: boolean) => {
    queueRef.current = queueRef.current.then(async () => {
      setBiometricsEnabled(enabled);
      await AsyncStorage.setItem('neon-budget-biometrics', String(enabled));
    });
  };

  const playSound = () => {
    if (Platform.OS === 'web') {
      try {
        const audio = new Audio('https://www.soundjay.com/misc/sounds/coins-in-hand-2.mp3');
        audio.volume = 0.5;
        audio.play().catch(() => {});
      } catch (e) {}
    }
  };

  const speakTransaction = (type: string, desc: string, amount: number) => {
    if (Platform.OS === 'web' && 'speechSynthesis' in window) {
      try {
        const text = `Dodano ${type === 'expense' ? 'wydatek' : 'przychód'}: ${desc}, ${amount.toFixed(2)} złotych`;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'pl-PL';
        utterance.rate = 1.1;
        window.speechSynthesis.speak(utterance);
      } catch (e) {}
    }
  };

  const handleSubmitTransaction = (amount: string, description: string, type: 'income' | 'expense', category: string, dateStr?: string) => {
    const trimmedDesc = description.trim();
    if (!trimmedDesc || !amount) {
      setValidationError('Błąd walidacji: opis i kwota są wymagane');
      return;
    }

    let parsedAmount = parseFloat(amount.replace(',', '.'));
    
    // Auto Currency Converter
    const lowerAmt = amount.toLowerCase();
    if (lowerAmt.includes('usd')) parsedAmount *= liveRates.USD;
    else if (lowerAmt.includes('eur')) parsedAmount *= liveRates.EUR;
    else if (lowerAmt.includes('gbp')) parsedAmount *= liveRates.GBP;

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setValidationError('Wprowadź prawidłową kwotę większą od zera.');
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

  const cloneTransaction = (id: string) => {
    const toClone = allTransactions.find(t => t.id === id);
    if (toClone) {
      const cloned = { ...toClone, id: Date.now().toString(), date: new Date().toISOString() };
      setAllTransactions([cloned, ...allTransactions]);
      setEditingTransactionId(null);
    }
  };

  const deleteTransaction = (id: string) => {
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

  const currentMonthExpense = useMemo(() => {
    return currentMonthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [currentMonthTransactions]);

  const remainingLimit = monthlyLimit > 0 ? monthlyLimit - currentMonthExpense : null;
  const isOverBudget = monthlyLimit > 0 && currentMonthExpense > monthlyLimit;

  const userXP = useMemo(() => allTransactions.length * 15, [allTransactions]);
  const userLevel = Math.floor(userXP / 100) + 1;

  useEffect(() => {
    if (isAppReady && userLevel > prevLevelRef.current && prevLevelRef.current > 0) {
      setShowLevelUp(true);
      setTimeout(() => setShowLevelUp(false), 4000);
    }
    prevLevelRef.current = userLevel;
  }, [userLevel, isAppReady]);

  const MOCK_QUOTES = [
    '"Oszczędność to wielki dochód." - Seneka',
    '"Nie oszczędzaj resztek, wydawaj to co zostanie po oszczędzeniu." - Buffett',
    '"Pieniądze często kosztują zbyt wiele." - R.W. Emerson',
    '"Zarządzaj swoimi pieniędzmi, inaczej one będą zarządzać tobą." - Nieznany'
  ];
  const dailyQuote = useMemo(() => MOCK_QUOTES[Math.floor(Math.random() * MOCK_QUOTES.length)], []);

  if (!isAppReady) {
    return <View style={styles.container} />;
  }

  if (savedPin && isAppLocked) {
    return (
      <SafeAreaProvider>
        <LinearGradient colors={['#05050A', '#0f0f1a']} style={styles.container}>
          {Platform.OS === 'web' && (
            <>
              <View style={{ position: 'absolute', top: -50, left: -50, width: 300, height: 300, borderRadius: 150, backgroundColor: theme.colors.neonPurple, opacity: 0.15, filter: 'blur(80px)', pointerEvents: 'none' }} />
              <View style={{ position: 'absolute', bottom: -50, right: -50, width: 300, height: 300, borderRadius: 150, backgroundColor: theme.colors.neonGreen, opacity: 0.1, filter: 'blur(80px)', pointerEvents: 'none' }} />
            </>
          )}

          {showLevelUp && (
            <View style={{ position: 'absolute', top: 50, left: 20, right: 20, backgroundColor: theme.colors.neonPurple, padding: 16, borderRadius: theme.borderRadius.md, zIndex: 9999, alignItems: 'center', shadowColor: theme.colors.neonPurple, shadowOpacity: 0.8, shadowRadius: 15 }}>
              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18, fontFamily: theme.typography.fontFamily }}>AWANS! Osiągnąłeś Poziom {userLevel}! 🎉</Text>
            </View>
          )}

          {isOverBudget && (
            <View style={{ backgroundColor: 'rgba(255, 0, 50, 0.2)', padding: 10, alignItems: 'center', borderBottomWidth: 1, borderColor: 'rgba(255, 0, 50, 0.5)' }}>
              <Text style={{ color: '#ff3366', fontWeight: 'bold', fontSize: 12 }}>⚠️ UWAGA: Przekroczono miesięczny limit wydatków!</Text>
            </View>
          )}

          <AppLock onUnlock={() => setIsAppLocked(false)} savedPin={savedPin} biometricsEnabled={biometricsEnabled} />
        </LinearGradient>
      </SafeAreaProvider>
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
              <View style={{ flex: 1, paddingRight: 8 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' }}>
                  <Wallet size={28} color={theme.colors.neonPurpleLight} style={{ marginRight: 8 }} />
                  <Text style={styles.title}>NeonBudget</Text>
                  {userLevel >= 5 && <Text style={{ color: theme.colors.neonPurpleLight, fontWeight: 'bold', marginLeft: 8, fontSize: 10, borderWidth: 1, borderColor: theme.colors.neonPurpleLight, paddingHorizontal: 4, paddingVertical: 2, borderRadius: 4, fontFamily: theme.typography.fontFamily, marginTop: 2 }}>PRO</Text>}
                </View>
                <Text style={{ color: theme.colors.textSecondary, fontSize: 11, marginTop: 4, opacity: 0.8 }}>Ekskluzywne zarządzanie finansami</Text>
              </View>
              <View style={[styles.headerRight, { flexShrink: 0 }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 8, backgroundColor: 'rgba(157, 78, 221, 0.15)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(157, 78, 221, 0.3)' }}>
                  <Star size={14} color={theme.colors.neonPurpleLight} />
                  <Text style={{ color: theme.colors.neonPurpleLight, fontWeight: 'bold', marginLeft: 4, fontFamily: theme.typography.fontFamily, fontSize: 12 }}>Lvl {userLevel}</Text>
                </View>
                {streakDays > 0 && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 12, backgroundColor: 'rgba(255, 159, 28, 0.15)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255, 159, 28, 0.3)' }}>
                    <Flame size={14} color="#FF9F1C" />
                    <Text style={{ color: '#FF9F1C', fontWeight: 'bold', marginLeft: 4, fontFamily: theme.typography.fontFamily, fontSize: 12 }}>{streakDays}</Text>
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
            <Text style={[styles.subtitle, { fontStyle: 'italic' }]}>{dailyQuote}</Text>

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

            {/* Usunięto szybkie przyciski wydatków (Zadanie 3) */}

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

            {editingTransactionId && (
              <View style={{ flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.8)', padding: 20 }}>
                <View style={{ backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.lg, padding: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>Edytuj transakcję</Text>
                    <TouchableOpacity onPress={() => setEditingTransactionId(null)}>
                      <X size={24} color="#fff" />
                    </TouchableOpacity>
                  </View>
                  {allTransactions.find(t => t.id === editingTransactionId) && (
                    <TransactionForm
                      onSubmitTransaction={handleSubmitTransaction}
                      transactionToEdit={allTransactions.find(t => t.id === editingTransactionId)}
                      validationError={validationError}
                      expenseCategories={expenseCategories}
                      incomeCategories={incomeCategories}
                      onCancelEdit={handleCancelEdit}
                      customTags={customTags}
                    />
                  )}
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 }}>
                    <TouchableOpacity
                      style={{ backgroundColor: 'rgba(255,0,0,0.2)', padding: 12, borderRadius: 8, alignItems: 'center', flex: 1, marginRight: 8, borderWidth: 1, borderColor: 'rgba(255,0,0,0.5)' }}
                      onPress={() => deleteTransaction(editingTransactionId)}
                    >
                      <Text style={{ color: '#ff3366', fontWeight: 'bold' }}>Usuń transakcję</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={{ backgroundColor: 'rgba(56,176,0,0.2)', padding: 12, borderRadius: 8, alignItems: 'center', flex: 1, borderWidth: 1, borderColor: 'rgba(56,176,0,0.5)' }}
                      onPress={() => cloneTransaction(editingTransactionId)}
                    >
                      <Text style={{ color: theme.colors.neonGreen, fontWeight: 'bold' }}>Klonuj transakcję</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}

            {isGameVisible && (
              <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.95)', zIndex: 10000, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ color: theme.colors.neonGreen, fontSize: 40, fontWeight: 'bold', marginBottom: 60, fontFamily: theme.typography.fontFamily }}>Zebrane Monety: {gameCoins}</Text>
                <TouchableOpacity onPress={() => setGameCoins(c => c + 1)} style={{ backgroundColor: theme.colors.neonPurple, width: 160, height: 160, borderRadius: 80, justifyContent: 'center', alignItems: 'center', shadowColor: theme.colors.neonPurple, shadowOpacity: 1, shadowRadius: 30 }}>
                  <Text style={{ fontSize: 60 }}>🪙</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => { setGameVisible(false); setGameCoins(0); }} style={{ marginTop: 80, padding: 15, borderWidth: 1, borderColor: '#fff', borderRadius: 8 }}>
                  <Text style={{ color: '#fff', fontSize: 18 }}>Powrót do budżetu</Text>
                </TouchableOpacity>
              </View>
            )}

            <TransactionForm 
              onSubmitTransaction={handleSubmitTransaction} 
              validationError={validationError} 
              expenseCategories={expenseCategories}
              incomeCategories={incomeCategories}
              transactionToEdit={allTransactions.find(t => t.id === editingTransactionId)}
              onCancelEdit={handleCancelEdit}
              customTags={customTags}
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
              onDeleteTransaction={deleteTransaction} 
              onEditTransaction={handleEditTransaction}
              onTagClick={(tag) => {
                if (!searchQuery.includes(tag)) {
                  setSearchQuery(searchQuery ? `${searchQuery} ${tag}`.trim() : tag);
                }
              }}
            />
            {/* Usunięta sekcja actionZone zgodnie z Zadaniem 8 */}

            {isSettingsVisible && (
              <SettingsModal
                visible={isSettingsVisible}
                onClose={() => setSettingsVisible(false)}
                monthlyLimit={monthlyLimit}
                expenseCategories={expenseCategories}
                incomeCategories={incomeCategories}
                onUpdateCategories={(type, cats) => type === 'expense' ? setExpenseCategories(cats) : setIncomeCategories(cats)}
                onUpdateLimit={handleUpdateLimit}
                allTransactions={allTransactions}
                onImportData={handleImportData}
                savedPin={savedPin}
                onUpdatePin={handleUpdatePin}
                onWipeData={handleClearAll}
                customTags={customTags}
                onUpdateCustomTags={handleUpdateCustomTags}
                biometricsEnabled={biometricsEnabled}
                onUpdateBiometrics={handleUpdateBiometrics}
              />
            )}

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
    textAlign: 'center',
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
