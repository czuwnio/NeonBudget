import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Lock, Fingerprint } from 'lucide-react-native';
import { theme } from '../theme/theme';
import * as LocalAuthentication from 'expo-local-authentication';

interface Props {
  onUnlock: () => void;
  savedPin: string;
}

export const AppLock: React.FC<Props> = ({ onUnlock, savedPin }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [biometricSupported, setBiometricSupported] = useState(false);

  useEffect(() => {
    if (Platform.OS === 'web') return;
    handleBiometricAuth(true); // Cicha próba przy starcie (silent = true)
  }, []);

  const handleBiometricAuth = async (silent = false) => {
    if (Platform.OS === 'web') return;
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      
      if (!compatible || !enrolled) {
        if (!silent) alert('Biometria nie jest skonfigurowana na tym urządzeniu.');
        return;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Odblokuj NeonBudget',
        fallbackLabel: 'Użyj kodu PIN',
        cancelLabel: 'Anuluj',
        disableDeviceFallback: true,
      });

      if (result.success) {
        onUnlock();
      }
    } catch (e) {
      if (!silent) alert('Wystąpił błąd autoryzacji biometrycznej.');
    }
  };

  const handlePress = (num: string) => {
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);
      setError(false);
      if (newPin.length === 4) {
        if (newPin === savedPin) {
          onUnlock();
        } else {
          setError(true);
          setTimeout(() => setPin(''), 500);
        }
      }
    }
  };

  const handleBackspace = () => {
    setPin(pin.slice(0, -1));
    setError(false);
  };

  return (
    <LinearGradient colors={['#0f0518', '#05050A', '#020205']} style={styles.container}>
      <View style={styles.content}>
        <Lock size={48} color={theme.colors.neonPurple} style={{ marginBottom: 20 }} />
        <Text style={styles.title}>Wprowadź kod PIN</Text>
        
        <View style={styles.dots}>
          {[0, 1, 2, 3].map(i => (
            <View 
              key={i} 
              style={[
                styles.dot, 
                pin.length > i && styles.dotFilled, 
                error && styles.dotError
              ]} 
            />
          ))}
        </View>

        {error ? <Text style={styles.errorText}>Nieprawidłowy kod</Text> : <Text style={styles.spacer}> </Text>}

        <View style={styles.keypad}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
            <TouchableOpacity key={num} style={styles.key} onPress={() => handlePress(num.toString())}>
              <Text style={styles.keyText}>{num}</Text>
            </TouchableOpacity>
          ))}
          
          <TouchableOpacity style={styles.key} onPress={() => handleBiometricAuth(false)}>
            {Platform.OS !== 'web' ? <Fingerprint size={28} color={theme.colors.neonPurpleLight} /> : <Text style={styles.keyText}></Text>}
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.key} onPress={() => handlePress('0')}>
            <Text style={styles.keyText}>0</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.key} onPress={handleBackspace}>
            <Text style={styles.keyText}>⌫</Text>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  content: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    padding: 20,
  },
  title: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 24,
    color: theme.colors.textPrimary,
    fontWeight: 'bold',
    marginBottom: 40,
  },
  dots: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: theme.colors.textSecondary,
  },
  dotFilled: {
    backgroundColor: theme.colors.neonPurple,
    borderColor: theme.colors.neonPurple,
    shadowColor: theme.colors.neonPurple,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  dotError: {
    backgroundColor: theme.colors.danger,
    borderColor: theme.colors.danger,
    shadowColor: theme.colors.danger,
  },
  errorText: {
    fontFamily: theme.typography.fontFamily,
    color: theme.colors.danger,
    fontSize: 14,
    marginBottom: 30,
    fontWeight: 'bold',
  },
  spacer: {
    fontSize: 14,
    marginBottom: 30,
  },
  keypad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 280,
    justifyContent: 'center',
    gap: 15,
  },
  key: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: 'rgba(255,255,255,0.06)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  keyText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 32,
    color: '#ffffff',
    fontWeight: '600',
  }
});
