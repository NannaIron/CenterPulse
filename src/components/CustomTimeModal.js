import React, { useState, useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Pressable,
  Keyboard,
  StyleSheet,
  KeyboardAvoidingView,
  Platform
} from 'react-native';

export default function CustomTimeModal({ visible, onClose, onSave, initialSeconds = 1500 }) {
  const [digits, setDigits] = useState('0000');
  const digitsRef = useRef(digits);

  useEffect(() => {
    if (visible) {
      setDigits('0000');
      digitsRef.current = '0000';
    }
  }, [visible]);

  function formatFromDigits(d) {
    const padded = d.padStart(4, '0');
    const mm = padded.slice(0,2);
    const ss = padded.slice(2,4);
    return `${mm}:${ss}`;
  }

  function extractDigitsFromText(t) {
    return (t.match(/\d/g) || []).join('').slice(0, 100);
  }

  function handleChangeText(text) {
    const raw = extractDigitsFromText(text);
    const last4 = raw.slice(-4).padStart(4, '0');
    setDigits(last4);
    digitsRef.current = last4;
  }

  function handleKeyPress({ nativeEvent }) {
    const key = nativeEvent.key;
    if (key === 'Backspace') {
      setDigits(prev => {
        const next = ('0' + prev.slice(0,3)).slice(0,4);
        digitsRef.current = next;
        return next;
      });
      return;
    }
    if (/^\d$/.test(key)) {
      setDigits(prev => {
        const next = (prev.slice(1) + key).slice(-4);
        digitsRef.current = next;
        return next;
      });
    }
  }

  function handleSave() {
    const padded = digitsRef.current.padStart(4, '0');
    const mm = parseInt(padded.slice(0,2), 10);
    const ss = parseInt(padded.slice(2,4), 10);
    const totalSeconds = mm * 60 + ss;
    onSave(totalSeconds);
    onClose();
  }

  function handleOverlayPress() {
    Keyboard.dismiss();
    onClose();
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={handleOverlayPress}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.center}
        >
          <Pressable onPress={() => {}} style={styles.cardWrapper}>
            <View style={styles.card}>
              <Text style={styles.title}>Tempo customizado (MM:SS)</Text>
              <TextInput
                keyboardType={Platform.OS === 'ios' ? 'numbers-and-punctuation' : 'numeric'}
                value={formatFromDigits(digits)}
                onChangeText={handleChangeText}
                onKeyPress={handleKeyPress}
                style={styles.input}
                placeholder="00:00"
                placeholderTextColor="#94A3B8"
                returnKeyType="done"
                maxLength={5}
                caretHidden={true}
              />
              <View style={styles.row}>
                <TouchableOpacity style={[styles.btn, styles.cancel]} onPress={onClose}>
                  <Text style={styles.btnText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.btn, styles.save]} onPress={handleSave}>
                  <Text style={styles.btnText}>Salvar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  cardWrapper: { width: '100%', alignItems: 'center' },
  card: { width: '85%', backgroundColor: '#0B1220', padding: 18, borderRadius: 12, alignItems: 'center' },
  title: { color: '#F8FAFC', fontSize: 16, marginBottom: 12 },
  input: {
    width: '60%',
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#111827',
    color: '#F8FAFC',
    textAlign: 'center',
    fontSize: 18,
    marginBottom: 16
  },
  row: { flexDirection: 'row', width: '100%', justifyContent: 'space-between' },
  btn: { flex: 1, padding: 12, marginHorizontal: 6, borderRadius: 8, alignItems: 'center' },
  cancel: { backgroundColor: '#1E293B' },
  save: { backgroundColor: '#7C3AED' },
  btnText: { color: '#fff', fontWeight: '700' }
});