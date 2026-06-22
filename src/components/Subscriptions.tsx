import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { Repeat, Plus, Trash2 } from 'lucide-react-native';
import { theme } from '../theme/theme';

export interface Subscription {
  id: string;
  name: string;
  amount: number;
}

interface Props {
  subs: Subscription[];
  onAddSub: (name: string, amount: number) => void;
  onDeleteSub: (id: string) => void;
  onPaySub: (sub: Subscription) => void;
}

export const Subscriptions: React.FC<Props> = ({ subs, onAddSub, onDeleteSub, onPaySub }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newAmount, setNewAmount] = useState('');

  const handleAdd = () => {
    if (!newName.trim() || !newAmount) return;
    const t = parseFloat(newAmount.replace(',', '.'));
    if (isNaN(t) || t <= 0) return;
    onAddSub(newName.trim(), t);
    setNewName('');
    setNewAmount('');
    setIsAdding(false);
  };

  const totalSubs = subs.reduce((sum, s) => sum + s.amount, 0);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTitle}>
          <Repeat size={20} color={theme.colors.neonPurpleLight} />
          <Text style={styles.title}>Subskrypcje i Stałe</Text>
        </View>
        <TouchableOpacity onPress={() => setIsAdding(!isAdding)}>
          <Plus size={24} color={theme.colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <Text style={styles.totalText}>Miesięcznie: {totalSubs.toFixed(2)} PLN</Text>

      {isAdding && (
        <View style={styles.addForm}>
          <TextInput 
            style={styles.input} 
            placeholder="Nazwa (np. Netflix)" 
            placeholderTextColor={theme.colors.textSecondary}
            value={newName}
            onChangeText={setNewName}
          />
          <View style={styles.row}>
            <TextInput 
              style={[styles.input, { flex: 1 }]} 
              placeholder="Kwota (PLN)" 
              placeholderTextColor={theme.colors.textSecondary}
              value={newAmount}
              onChangeText={setNewAmount}
              keyboardType="numeric"
            />
            <TouchableOpacity style={styles.saveBtn} onPress={handleAdd}>
              <Text style={styles.saveBtnText}>Dodaj</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {subs.length === 0 && !isAdding && (
        <Text style={styles.empty}>Nie masz zapisanych subskrypcji.</Text>
      )}

      {subs.map(sub => (
        <View key={sub.id} style={styles.subCard}>
          <Text style={styles.subName}>{sub.name}</Text>
          <View style={styles.subRight}>
            <Text style={styles.subAmount}>{sub.amount.toFixed(2)} PLN</Text>
            <TouchableOpacity style={styles.payBtn} onPress={() => onPaySub(sub)}>
              <Text style={styles.payBtnText}>Zapłać</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => onDeleteSub(sub.id)}>
              <Trash2 size={16} color={theme.colors.danger} />
            </TouchableOpacity>
          </View>
        </View>
      ))}
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
    marginBottom: 4,
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
  totalText: {
    fontFamily: theme.typography.fontFamily,
    color: theme.colors.textSecondary,
    fontSize: 14,
    marginBottom: 16,
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
    backgroundColor: theme.colors.neonPurpleLight,
    justifyContent: 'center',
    paddingHorizontal: 20,
    borderRadius: theme.borderRadius.md,
  },
  saveBtnText: {
    color: '#000',
    fontFamily: theme.typography.fontFamily,
    fontWeight: 'bold',
  },
  empty: {
    color: theme.colors.textSecondary,
    fontFamily: theme.typography.fontFamily,
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 10,
  },
  subCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    padding: 12,
    borderRadius: theme.borderRadius.lg,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  subName: {
    color: theme.colors.textPrimary,
    fontFamily: theme.typography.fontFamily,
    fontWeight: '500',
    fontSize: 14,
  },
  subRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  subAmount: {
    color: theme.colors.textSecondary,
    fontFamily: theme.typography.fontFamily,
    fontSize: 14,
  },
  payBtn: {
    backgroundColor: 'rgba(157, 78, 221, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.colors.neonPurple,
  },
  payBtnText: {
    color: theme.colors.neonPurpleLight,
    fontFamily: theme.typography.fontFamily,
    fontSize: 12,
    fontWeight: 'bold',
  }
});
