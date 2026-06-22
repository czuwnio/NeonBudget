import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, ScrollView, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { X, Plus, Trash2 } from 'lucide-react-native';
import { theme } from '../theme/theme';
import { Transaction } from '../types';

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
  expenseCategories: string[];
  incomeCategories: string[];
  onUpdateCategories: (type: 'expense' | 'income', newCategories: string[]) => void;
  monthlyLimit: number;
  onUpdateLimit: (limit: number) => void;
  allTransactions: Transaction[];
  onImportData: (data: Transaction[]) => void;
  savedPin: string | null;
  onUpdatePin: (pin: string | null) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  visible,
  onClose,
  expenseCategories,
  incomeCategories,
  onUpdateCategories,
  monthlyLimit,
  onUpdateLimit,
  allTransactions,
  onImportData,
  savedPin,
  onUpdatePin,
}) => {
  const [newExpenseCat, setNewExpenseCat] = useState('');
  const [newIncomeCat, setNewIncomeCat] = useState('');
  const [localLimit, setLocalLimit] = useState(monthlyLimit ? monthlyLimit.toString() : '');
  const [backupCode, setBackupCode] = useState('');
  const [newPin, setNewPin] = useState('');

  React.useEffect(() => {
    if (visible) {
      setLocalLimit(monthlyLimit ? monthlyLimit.toString() : '');
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

  const handleSave = () => {
    const parsed = parseFloat(localLimit.replace(',', '.'));
    if (!isNaN(parsed) && parsed >= 0) {
      onUpdateLimit(parsed);
    } else {
      onUpdateLimit(0);
    }
    onClose();
  };

  const generateBackup = () => {
    setBackupCode(JSON.stringify(allTransactions));
  };

  const loadBackup = () => {
    try {
      const data = JSON.parse(backupCode);
      if (Array.isArray(data)) {
        onImportData(data);
        setBackupCode('');
        alert('Kopia zapasowa wgrana pomyślnie!');
      } else {
        alert('Błąd: Nieprawidłowy format pliku JSON.');
      }
    } catch(e) {
      alert('Błąd: Nieprawidłowy kod zapasowy.');
    }
  };

  const downloadCSV = () => {
    if (Platform.OS === 'web') {
      const header = 'ID,Data,Opis,Kategoria,Typ,Kwota\n';
      const rows = allTransactions.map(t => `${t.id},${t.date.split('T')[0]},"${t.description.replace(/"/g, '""')}",${t.category},${t.type},${t.amount}`).join('\n');
      const csvContent = "data:text/csv;charset=utf-8," + encodeURIComponent(header + rows);
      const link = document.createElement("a");
      link.setAttribute("href", csvContent);
      link.setAttribute("download", "neonbudget_export.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      alert('Funkcja eksportu do CSV jest dostępna w wersji przeglądarkowej.');
    }
  };

  const handleSavePin = () => {
    if (newPin.length === 4) {
      onUpdatePin(newPin);
      setNewPin('');
      Alert.alert('Sukces', 'Kod PIN został ustawiony.');
    } else if (newPin === '') {
      onUpdatePin(null);
      Alert.alert('Sukces', 'Zabezpieczenie PIN wyłączone.');
    } else {
      Alert.alert('Błąd', 'PIN musi składać się z 4 cyfr lub pozostać pusty (wyłączenie).');
    }
  };

  const handleWipeData = () => {
    if (Platform.OS === 'web') {
      if (window.confirm('Czy na pewno chcesz usunąć WSZYSTKIE dane? Tej operacji nie można cofnąć.')) {
        onImportData([]);
        alert('Dane zostały bezpowrotnie wyczyszczone.');
      }
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
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>ZABEZPIECZENIE PIN</Text>
              <TextInput
                style={styles.input}
                value={newPin}
                onChangeText={setNewPin}
                placeholder={savedPin ? "Zmień obecny PIN" : "Wprowadź 4 cyfry"}
                placeholderTextColor={theme.colors.textSecondary}
                keyboardType="numeric"
                maxLength={4}
                secureTextEntry
              />
              <TouchableOpacity style={[styles.backupBtn, { marginTop: 8 }]} onPress={handleSavePin}>
                <Text style={styles.backupBtnText}>{savedPin ? 'Zaktualizuj PIN' : 'Ustaw PIN'}</Text>
              </TouchableOpacity>
              {savedPin && <Text style={styles.pinActiveText}>Status: PIN jest aktywny</Text>}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>MIESIĘCZNY LIMIT WYDATKÓW (PLN)</Text>
              <TextInput
                style={styles.input}
                value={localLimit}
                onChangeText={setLocalLimit}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor={theme.colors.textSecondary}
              />
              <Text style={styles.helperText}>Ustaw 0 aby wyłączyć limit.</Text>
            </View>

            <View style={styles.section}>
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
                <TouchableOpacity style={styles.addBtnIcon} onPress={() => handleAddCat('expense')}>
                  <Plus size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.section}>
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
                <TouchableOpacity style={styles.addBtnIcon} onPress={() => handleAddCat('income')}>
                  <Plus size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>KOPIA ZAPASOWA (JSON)</Text>
              <TouchableOpacity style={styles.backupBtn} onPress={generateBackup}>
                <Text style={styles.backupBtnText}>Generuj mój kod zapasowy</Text>
              </TouchableOpacity>
              
              <TextInput
                style={[styles.input, { height: 80, textAlignVertical: 'top', marginTop: 12 }]}
                value={backupCode}
                onChangeText={setBackupCode}
                multiline
                numberOfLines={4}
                placeholder="Wklej kod zapasowy tutaj..."
                placeholderTextColor={theme.colors.textSecondary}
              />
              <TouchableOpacity style={[styles.backupBtn, { marginTop: 8 }]} onPress={loadBackup}>
                <Text style={styles.backupBtnText}>Przywróć z wklejonego kodu</Text>
              </TouchableOpacity>
              <Text style={styles.helperText}>Skopiuj wygenerowany kod i zapisz go w bezpiecznym miejscu.</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>EKSPORT DANYCH</Text>
              <TouchableOpacity style={[styles.backupBtn, { backgroundColor: 'rgba(56, 176, 0, 0.15)', borderColor: 'rgba(56, 176, 0, 0.3)', borderWidth: 1 }]} onPress={downloadCSV}>
                <Text style={[styles.backupBtnText, { color: theme.colors.neonGreen }]}>Pobierz arkusz CSV</Text>
              </TouchableOpacity>
              <Text style={styles.helperText}>Wyeksportuj swoje dane, by móc otworzyć je w Excelu.</Text>
            </View>

            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.danger }]}>STREFA NIEBEZPIECZNA</Text>
              <TouchableOpacity style={[styles.backupBtn, { backgroundColor: 'rgba(255, 77, 77, 0.15)', borderColor: 'rgba(255, 77, 77, 0.3)', borderWidth: 1 }]} onPress={handleWipeData}>
                <Text style={[styles.backupBtnText, { color: theme.colors.danger }]}>Wyczyść wszystkie dane</Text>
              </TouchableOpacity>
              <Text style={styles.helperText}>Bezpowrotnie usuwa wszystkie transakcje z pamięci urządzenia.</Text>
            </View>

            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveBtnText}>Zapisz ustawienia</Text>
            </TouchableOpacity>
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: theme.typography.fontFamily,
    fontWeight: '500',
    fontSize: 12,
    color: theme.colors.textSecondary,
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  helperText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 8,
    fontStyle: 'italic',
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
  addBtnIcon: {
    backgroundColor: theme.colors.neonPurple,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderRadius: theme.borderRadius.md,
  },
  backupBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 10,
    borderRadius: theme.borderRadius.sm,
    alignItems: 'center',
  },
  backupBtnText: {
    fontFamily: theme.typography.fontFamily,
    color: theme.colors.textPrimary,
    fontSize: 13,
  },
  pinActiveText: {
    color: theme.colors.neonGreen,
    fontSize: 12,
    marginTop: 8,
    fontFamily: theme.typography.fontFamily,
  },
  saveBtn: {
    backgroundColor: theme.colors.neonPurple,
    paddingVertical: 16,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 30,
  },
  saveBtnText: {
    fontFamily: theme.typography.fontFamily,
    fontWeight: 'bold',
    color: '#fff',
    fontSize: 16,
    letterSpacing: 1,
  },
});
