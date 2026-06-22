import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
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
    if (Platform.OS === 'web') return; // Do not use LocalAuthentication on the web to prevent crashes
    
    const checkBiometrics = async () => {
      try {
        const compatible = await LocalAuthentication.hasHardwareAsync();
        const enrolled = await LocalAuthentication.isEnrolledAsync();
        if (compatible && enrolled) {
          setBiometricSupported(true);
          handleBiometricAuth(); // Auto-prompt on load
        }
      } catch (e) {
        console.log('Biometrics check error:', e);
      }
    };
    checkBiometrics();
  }, []);

  const handleBiometricAuth = async () => {
    try {
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
      console.log('Biometric auth error', e);
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
    <View style={styles.container}>
      <BlurView intensity={80} tint="dark" style={styles.blur}>
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
          
          <TouchableOpacity style={styles.key} onPress={biometricSupported ? handleBiometricAuth : () => {}}>
            {biometricSupported ? <Fingerprint size={28} color={theme.colors.neonPurpleLight} /> : <Text style={styles.keyText}></Text>}
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.key} onPress={() => handlePress('0')}>
            <Text style={styles.keyText}>0</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.key} onPress={handleBackspace}>
            <Text style={styles.keyText}>⌫</Text>
          </TouchableOpacity>
        </View>
      </BlurView>
    </View>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  blur: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
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
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  keyText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 28,
    color: theme.colors.textPrimary,
    fontWeight: '500',
  }
});
