import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Platform } from 'react-native';
import { Target, Plus, Trash2 } from 'lucide-react-native';
import { theme } from '../theme/theme';

export interface SavingsGoal {
  id: string;
  name: string;
  currentAmount: number;
  targetAmount: number;
  color: string;
}

interface Props {
  goals: SavingsGoal[];
  onAddGoal: (name: string, target: number) => void;
  onAddFunds: (id: string, amount: number) => void;
  onDeleteGoal: (id: string) => void;
}

export const SavingsGoals: React.FC<Props> = ({ goals, onAddGoal, onAddFunds, onDeleteGoal }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newTarget, setNewTarget] = useState('');

  const handleAdd = () => {
    if (!newName.trim() || !newTarget) return;
    const t = parseFloat(newTarget.replace(',', '.'));
    if (isNaN(t) || t <= 0) return;
    onAddGoal(newName.trim(), t);
    setNewName('');
    setNewTarget('');
    setIsAdding(false);
  };

  const handleFund = (id: string) => {
    if (Platform.OS === 'web') {
      const val = window.prompt('Ile chcesz wpłacić do tej skarbonki?');
      if (!val) return;
      const parsed = parseFloat(val.replace(',', '.'));
      if (isNaN(parsed) || parsed <= 0) return;
      onAddFunds(id, parsed);
    } else {
      // W wersji mobilnej idealnie by było zrobić custom modal, ale dla uproszczenia
      // na razie zostawiamy (w web to działa idealnie z promp). 
      // Jako że skupiamy się na Vercel (web), używamy prompt.
      // Ewentualnie mobilne aplikacje można też obsługiwać osobnym stanem.
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTitle}>
          <Target size={20} color={theme.colors.neonGreen} />
          <Text style={styles.title}>Skarbonki</Text>
        </View>
        <TouchableOpacity onPress={() => setIsAdding(!isAdding)}>
          <Plus size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {isAdding && (
        <View style={styles.addForm}>
          <TextInput 
            style={styles.input} 
            placeholder="Na co zbierasz?" 
            placeholderTextColor={theme.colors.textSecondary}
            value={newName}
            onChangeText={setNewName}
          />
          <View style={styles.row}>
            <TextInput 
              style={[styles.input, { flex: 1 }]} 
              placeholder="Cel" 
              placeholderTextColor={theme.colors.textSecondary}
              value={newTarget}
              onChangeText={setNewTarget}
              keyboardType="numeric"
            />
            <TouchableOpacity style={styles.saveBtn} onPress={handleAdd}>
              <Text style={styles.saveBtnText}>Dodaj</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {goals.length === 0 && !isAdding && (
        <Text style={styles.empty}>Brak aktywnych celów. Dodaj pierwszą skarbonkę!</Text>
      )}

      {goals.map(goal => {
        const progress = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
        return (
          <View key={goal.id} style={styles.goalCard}>
            <View style={styles.goalHeader}>
              <Text style={styles.goalName}>{goal.name}</Text>
              <TouchableOpacity onPress={() => onDeleteGoal(goal.id)}>
                <Trash2 size={16} color={theme.colors.danger} />
              </TouchableOpacity>
            </View>
            <View style={styles.goalInfo}>
              <Text style={styles.goalAmount}>{goal.currentAmount.toFixed(2)} / {goal.targetAmount.toFixed(2)} PLN</Text>
              <Text style={styles.goalPercent}>{progress.toFixed(0)}%</Text>
            </View>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${progress}%`, backgroundColor: goal.color }]} />
            </View>
            <TouchableOpacity style={styles.fundBtn} onPress={() => handleFund(goal.id)}>
              <Text style={styles.fundBtnText}>+ Wpłać</Text>
            </TouchableOpacity>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: theme.borderRadius.xl,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    marginBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontFamily: theme.typography.fontFamily,
    fontWeight: 'bold',
    fontSize: 18,
    color: theme.colors.textPrimary,
  },
  addForm: {
    gap: 10,
    marginBottom: 16,
  },
  input: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: theme.borderRadius.md,
    padding: 12,
    color: theme.colors.textPrimary,
    fontFamily: theme.typography.fontFamily,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  saveBtn: {
    backgroundColor: theme.colors.neonGreen,
    justifyContent: 'center',
    paddingHorizontal: 20,
    borderRadius: theme.borderRadius.md,
  },
  saveBtnText: {
    color: '#000',
    fontFamily: theme.typography.fontFamily,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  empty: {
    color: theme.colors.textSecondary,
    fontFamily: theme.typography.fontFamily,
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 10,
  },
  goalCard: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    padding: 16,
    borderRadius: theme.borderRadius.lg,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  goalName: {
    color: theme.colors.textPrimary,
    fontFamily: theme.typography.fontFamily,
    fontWeight: 'bold',
    fontSize: 16,
  },
  goalInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  goalAmount: {
    color: theme.colors.textSecondary,
    fontFamily: theme.typography.fontFamily,
    fontSize: 12,
  },
  goalPercent: {
    color: theme.colors.textPrimary,
    fontFamily: theme.typography.fontFamily,
    fontWeight: 'bold',
    fontSize: 12,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  fundBtn: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: theme.borderRadius.md,
  },
  fundBtnText: {
    fontFamily: theme.typography.fontFamily,
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  }
});
