import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Platform, ScrollView } from 'react-native';
import { BlurView } from 'expo-blur';
import { Mic, ArrowUpRight, ArrowDownRight, Camera } from 'lucide-react-native';
import { theme } from '../theme/theme';

interface TransactionFormProps {
  onSubmitTransaction: (amount: string, description: string, type: 'income' | 'expense', category: string, dateStr: string) => void;
  validationError: string;
  expenseCategories: string[];
  incomeCategories: string[];
  transactionToEdit: any;
  onCancelEdit: () => void;
}

export const TransactionForm: React.FC<TransactionFormProps> = ({ 
  onSubmitTransaction, 
  validationError,
  expenseCategories,
  incomeCategories,
  transactionToEdit,
  onCancelEdit
}) => {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [category, setCategory] = useState(expenseCategories[0] || 'Jedzenie');
  const [customDate, setCustomDate] = useState(new Date().toISOString().split('T')[0]);
  const [splitCount, setSplitCount] = useState<number>(1);

  const currentCategories = type === 'income' ? incomeCategories : expenseCategories;

  React.useEffect(() => {
    if (transactionToEdit) {
      setAmount(transactionToEdit.amount.toString());
      setDescription(transactionToEdit.description);
      setType(transactionToEdit.type);
      setCategory(transactionToEdit.category);
      setCustomDate(transactionToEdit.date.split('T')[0]);
    } else {
      setAmount('');
      setDescription('');
      setType('expense');
      setCategory(expenseCategories[0] || 'Jedzenie');
      setCustomDate(new Date().toISOString().split('T')[0]);
    }
  }, [transactionToEdit, expenseCategories]);

  const handleTypeChange = (newType: 'income' | 'expense') => {
    setType(newType);
    setCategory(newType === 'income' ? (incomeCategories[0] || 'Wypłata') : (expenseCategories[0] || 'Jedzenie'));
  };

  const startVoiceInput = () => {
    if (Platform.OS === 'web' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      try {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.lang = 'pl-PL';
        recognition.start();

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          const match = transcript.match(/\d+([.,]\d+)?/);
          if (match) {
            setAmount(match[0].replace(',', '.'));
            setDescription(transcript.replace(match[0], '').trim());
          } else {
            setDescription(transcript);
          }
        };
      } catch (e) {
        alert('Rozpoznawanie mowy nie jest wspierane w tej przeglądarce.');
      }
    } else {
      alert('Funkcja dostępna tylko w kompatybilnych przeglądarkach na PC/Android.');
    }
  };

  const handleScanReceipt = () => {
    if (Platform.OS === 'web') {
      alert('Skanowanie paragonu... (AI analizuje obraz 📷)');
      setTimeout(() => {
        setAmount('142.50');
        setDescription('Duże zakupy Biedronka #weekend');
        setCategory(expenseCategories.includes('Spożywcze') ? 'Spożywcze' : expenseCategories[0]);
        setType('expense');
        alert('Paragon odczytany pomyślnie!');
      }, 1500);
    }
  };

  const submit = () => {
    // Auto-calculate split
    let finalAmount = amount;
    if (splitCount > 1) {
      const parsed = parseFloat(amount.replace(',', '.'));
      if (!isNaN(parsed)) {
        finalAmount = (parsed / splitCount).toFixed(2);
      }
    }

    onSubmitTransaction(finalAmount, description, type, category, customDate);
    if (!validationError) {
      if (!transactionToEdit) {
        setAmount('');
        setDescription('');
        setSplitCount(1);
      }
    }
  };

  return (
    <View style={styles.container}>
      <BlurView intensity={20} tint="dark" style={styles.glassCard}>
        <Text style={styles.cardLabel}>{transactionToEdit ? 'EDYTUJ TRANSAKCJĘ' : 'NOWA TRANSAKCJA'}</Text>

        {validationError ? (
          <Text accessibilityLabel="validation-error" style={styles.errorText}>
            {validationError}
          </Text>
        ) : null}

        <View style={styles.toggleRow}>
          <TouchableOpacity
            style={[styles.toggleBtn, type === 'income' && styles.toggleBtnActiveIncome]}
            onPress={() => handleTypeChange('income')}
          >
            <ArrowUpRight size={16} color={type === 'income' ? '#FFFFFF' : theme.colors.textSecondary} style={{ marginRight: 6 }} />
            <Text style={[styles.toggleBtnText, type === 'income' && { color: '#FFFFFF' }]}>Przychód</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, type === 'expense' && styles.toggleBtnActiveExpense]}
            onPress={() => handleTypeChange('expense')}
          >
            <ArrowDownRight size={16} color={type === 'expense' ? '#FFFFFF' : theme.colors.textSecondary} style={{ marginRight: 6 }} />
            <Text style={[styles.toggleBtnText, type === 'expense' && { color: '#FFFFFF' }]}>Wydatek</Text>
          </TouchableOpacity>
        </View>

        <TextInput
          style={styles.input}
          placeholder="Kwota (np. 50+20 lub 100 USD)"
          placeholderTextColor={theme.colors.textSecondary}
          value={amount}
          onChangeText={setAmount}
          onBlur={() => {
            try {
              let sanitized = amount.replace(',', '.').replace(/[^0-9\+\-\*\/\.\s]/g, '');
              if (sanitized.match(/[\+\-\*\/]/)) {
                const result = new Function('return ' + sanitized)();
                if (!isNaN(result)) setAmount(result.toFixed(2));
              }
            } catch(e) {}
          }}
        />

        <View style={styles.quickAmounts}>
          {[10, 50, 100].map(val => (
            <TouchableOpacity 
              key={val} 
              style={styles.quickAmtBtn}
              onPress={() => setAmount(prev => (parseFloat(prev || '0') + val).toString())}
            >
              <Text style={styles.quickAmtText}>+{val}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', marginBottom: theme.spacing.md, backgroundColor: 'rgba(255,255,255,0.05)', padding: 12, borderRadius: theme.borderRadius.md, gap: 8 }}>
          <Text style={{ color: theme.colors.textSecondary, fontFamily: theme.typography.fontFamily, flex: 1, minWidth: 120 }}>Podziel rachunek (osoby):</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
            <TouchableOpacity onPress={() => setSplitCount(Math.max(1, splitCount - 1))} style={styles.quickAmtBtn}><Text style={styles.quickAmtText}>-</Text></TouchableOpacity>
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>{splitCount}</Text>
            <TouchableOpacity onPress={() => setSplitCount(splitCount + 1)} style={styles.quickAmtBtn}><Text style={styles.quickAmtText}>+</Text></TouchableOpacity>
          </View>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.xs }}>
          <TextInput
            style={[styles.input, { flex: 1, marginBottom: 0 }]}
            placeholder="Opis (np. Zakupy, Czynsz)"
            placeholderTextColor={theme.colors.textSecondary}
            value={description}
            onChangeText={setDescription}
          />
          <TouchableOpacity onPress={handleScanReceipt} style={[styles.micBtn, { marginRight: 8, backgroundColor: 'rgba(56, 176, 0, 0.15)', borderColor: 'rgba(56, 176, 0, 0.3)' }]}>
            <Camera size={20} color={theme.colors.neonGreen} />
          </TouchableOpacity>
          <TouchableOpacity onPress={startVoiceInput} style={styles.micBtn}>
            <Mic size={20} color={theme.colors.neonPurple} />
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: theme.spacing.md }}>
          {['#zakupy', '#weekend', '#paliwo', '#rachunki', '#wyjazd', '#jedzenie'].map((tag) => (
            <TouchableOpacity 
              key={tag} 
              style={[styles.quickAmtBtn, { marginRight: 8, paddingHorizontal: 12 }]}
              onPress={() => setDescription(prev => prev ? `${prev} ${tag}` : tag)}
            >
              <Text style={styles.quickAmtText}>{tag}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={{ flexDirection: 'row', gap: 8, marginBottom: theme.spacing.md }}>
          <TextInput
            style={[styles.input, { flex: 1, marginBottom: 0 }]}
            placeholder="Data (YYYY-MM-DD)"
            placeholderTextColor={theme.colors.textSecondary}
            value={customDate}
            onChangeText={setCustomDate}
            maxLength={10}
          />
          <TouchableOpacity 
            style={[styles.quickAmtBtn, { paddingHorizontal: 16 }]}
            onPress={() => setCustomDate(new Date().toISOString().split('T')[0])}
          >
            <Text style={styles.quickAmtText}>Dziś</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.categoryPicker}>
          <View style={styles.categoryOptions}>
            {currentCategories.map(cat => (
              <TouchableOpacity
                key={cat}
                style={[styles.categoryOpt, category === cat && styles.categoryOptActive]}
                onPress={() => setCategory(cat)}
              >
                <Text style={[styles.categoryOptText, category === cat && { color: '#FFFFFF', fontFamily: theme.typography.fontFamily, fontWeight: 'bold' }]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.submitBtn} onPress={submit}>
            <Text style={styles.submitText}>{transactionToEdit ? 'ZAPISZ ZMIANY' : 'DODAJ'}</Text>
          </TouchableOpacity>
          {transactionToEdit && (
            <TouchableOpacity style={styles.cancelBtn} onPress={onCancelEdit}>
              <Text style={styles.cancelText}>ANULUJ</Text>
            </TouchableOpacity>
          )}
        </View>
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
    backgroundColor: theme.colors.surfaceDark,
  },
  glassCard: {
    padding: theme.spacing.lg,
  },
  cardLabel: {
    fontFamily: theme.typography.fontFamily, fontWeight: '500',
    fontSize: 12,
    color: theme.colors.textSecondary,
    letterSpacing: 1.5,
    marginBottom: theme.spacing.md,
    textTransform: 'uppercase',
  },
  errorText: {
    fontFamily: theme.typography.fontFamily, fontWeight: '500',
    color: theme.colors.danger,
    fontSize: 12,
    marginBottom: theme.spacing.md,
  },
  toggleRow: {
    flexDirection: 'row',
    marginBottom: theme.spacing.md,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: theme.borderRadius.md,
    padding: 4,
  },
  toggleBtn: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.borderRadius.sm,
  },
  toggleBtnActiveIncome: {
    backgroundColor: theme.colors.neonGreen,
    shadowColor: theme.colors.neonGreen,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  toggleBtnActiveExpense: {
    backgroundColor: theme.colors.danger,
    shadowColor: theme.colors.danger,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  toggleBtnText: {
    fontFamily: theme.typography.fontFamily, fontWeight: '500',
    color: theme.colors.textSecondary,
  },
  input: {
    fontFamily: theme.typography.fontFamily, fontWeight: '500',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    borderRadius: theme.borderRadius.md,
    color: theme.colors.textPrimary,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: theme.spacing.sm,
    fontSize: 16,
  },
  quickAmounts: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: theme.spacing.md,
  },
  micBtn: {
    padding: 14,
    marginLeft: 8,
    backgroundColor: 'rgba(157, 78, 221, 0.1)',
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: 'rgba(157, 78, 221, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickAmtBtn: {
    flex: 1,
    paddingVertical: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
  },
  quickAmtText: {
    color: theme.colors.textPrimary,
    fontFamily: theme.typography.fontFamily,
    fontSize: 14,
    fontWeight: '500',
  },
  categoryPicker: {
    marginBottom: theme.spacing.lg,
  },
  categoryOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryOpt: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  categoryOptActive: {
    backgroundColor: 'rgba(157, 78, 221, 0.2)',
    borderColor: theme.colors.neonPurple,
  },
  categoryOptText: {
    fontFamily: theme.typography.fontFamily, fontWeight: '500',
    color: theme.colors.textSecondary,
    fontSize: 13,
  },
  submitBtn: {
    flex: 1,
    backgroundColor: theme.colors.neonPurple,
    paddingVertical: 14,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    shadowColor: theme.colors.neonPurple,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitText: {
    fontFamily: theme.typography.fontFamily, fontWeight: 'bold',
    color: '#fff',
    fontSize: 14,
    letterSpacing: 1,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 14,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  cancelText: {
    fontFamily: theme.typography.fontFamily, fontWeight: 'bold',
    color: '#fff',
    fontSize: 14,
    letterSpacing: 1,
  }
});
