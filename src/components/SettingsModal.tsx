import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, ScrollView, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { X, Plus, Trash2 } from 'lucide-react-native';
import { theme } from '../theme/theme';

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
  expenseCategories: string[];
  incomeCategories: string[];
  onUpdateCategories: (type: 'expense' | 'income', newCategories: string[]) => void;
  monthlyLimit: number;
  onUpdateLimit: (limit: number) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  visible,
  onClose,
  expenseCategories,
  incomeCategories,
  onUpdateCategories,
  monthlyLimit,
  onUpdateLimit,
}) => {
  const [newExpenseCat, setNewExpenseCat] = useState('');
  const [newIncomeCat, setNewIncomeCat] = useState('');
  const [limitInput, setLimitInput] = useState(monthlyLimit ? monthlyLimit.toString() : '');

  // Synchronize when modal opens
  React.useEffect(() => {
    if (visible) {
      setLimitInput(monthlyLimit ? monthlyLimit.toString() : '');
    }
  }, [visible, monthlyLimit]);

  const handleAddCat = (type: 'expense' | 'income') => {
    if (type === 'expense') {
      const trimmed = newExpenseCat.trim();
      if (trimmed && !expenseCategories.includes(trimmed)) {
        onUpdateCategories('expense', [...expenseCategories, trimmed]);
        setNewExpenseCat('');
      }
    } else {
      const trimmed = newIncomeCat.trim();
      if (trimmed && !incomeCategories.includes(trimmed)) {
        onUpdateCategories('income', [...incomeCategories, trimmed]);
        setNewIncomeCat('');
      }
    }
  };

  const handleRemoveCat = (type: 'expense' | 'income', catToRemove: string) => {
    if (type === 'expense') {
      onUpdateCategories('expense', expenseCategories.filter(c => c !== catToRemove));
    } else {
      onUpdateCategories('income', incomeCategories.filter(c => c !== catToRemove));
    }
  };

  const handleSaveLimit = () => {
    const parsed = parseFloat(limitInput.replace(',', '.'));
    if (!isNaN(parsed) && parsed >= 0) {
      onUpdateLimit(parsed);
      onClose(); // Optional: close modal on save, or just show success
    } else {
      onUpdateLimit(0);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFillObject} />
        
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Ustawienia</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={24} color={theme.colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollArea}>
            <Text style={styles.sectionTitle}>MIESIĘCZNY LIMIT WYDATKÓW (BUDŻET)</Text>
            <View style={styles.addRow}>
              <TextInput
                style={styles.input}
                placeholder="Np. 3000 (0 = brak limitu)"
                placeholderTextColor={theme.colors.textSecondary}
                value={limitInput}
                onChangeText={setLimitInput}
                keyboardType="numeric"
              />
              <TouchableOpacity style={styles.addBtn} onPress={handleSaveLimit}>
                <Text style={styles.saveBtnText}>Zapisz</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.divider} />

            <Text style={styles.sectionTitle}>KATEGORIE WYDATKÓW</Text>
            <View style={styles.catList}>
              {expenseCategories.map(cat => (
                <View key={cat} style={styles.catItem}>
                  <Text style={styles.catText}>{cat}</Text>
                  {expenseCategories.length > 1 && (
                    <TouchableOpacity onPress={() => handleRemoveCat('expense', cat)}>
                      <Trash2 size={16} color={theme.colors.danger} />
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </View>

            <View style={styles.addRow}>
              <TextInput
                style={styles.input}
                placeholder="Nowa kategoria wydatku"
                placeholderTextColor={theme.colors.textSecondary}
                value={newExpenseCat}
                onChangeText={setNewExpenseCat}
                onSubmitEditing={() => handleAddCat('expense')}
              />
              <TouchableOpacity style={styles.addBtn} onPress={() => handleAddCat('expense')}>
                <Plus size={20} color="#fff" />
              </TouchableOpacity>
            </View>

            <View style={styles.divider} />

            <Text style={styles.sectionTitle}>KATEGORIE PRZYCHODÓW</Text>
            <View style={styles.catList}>
              {incomeCategories.map(cat => (
                <View key={cat} style={styles.catItem}>
                  <Text style={styles.catText}>{cat}</Text>
                  {incomeCategories.length > 1 && (
                    <TouchableOpacity onPress={() => handleRemoveCat('income', cat)}>
                      <Trash2 size={16} color={theme.colors.danger} />
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </View>

            <View style={styles.addRow}>
              <TextInput
                style={styles.input}
                placeholder="Nowa kategoria przychodu"
                placeholderTextColor={theme.colors.textSecondary}
                value={newIncomeCat}
                onChangeText={setNewIncomeCat}
                onSubmitEditing={() => handleAddCat('income')}
              />
              <TouchableOpacity style={styles.addBtn} onPress={() => handleAddCat('income')}>
                <Plus size={20} color="#fff" />
              </TouchableOpacity>
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
    maxHeight: '80%',
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
  scrollArea: {
    padding: 20,
  },
  sectionTitle: {
    fontFamily: theme.typography.fontFamily,
    fontWeight: '500',
    fontSize: 12,
    color: theme.colors.textSecondary,
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  catList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  catItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: theme.borderRadius.md,
    gap: 8,
  },
  catText: {
    fontFamily: theme.typography.fontFamily,
    color: theme.colors.textPrimary,
    fontSize: 14,
  },
  addRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  input: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    borderRadius: theme.borderRadius.md,
    color: theme.colors.textPrimary,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: theme.typography.fontFamily,
  },
  addBtn: {
    backgroundColor: theme.colors.neonPurple,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderRadius: theme.borderRadius.md,
  },
  saveBtnText: {
    fontFamily: theme.typography.fontFamily,
    fontWeight: 'bold',
    color: '#fff',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginVertical: 20,
  }
});
