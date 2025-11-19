import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';

export default function CustomTimeModal({ visible, onClose, onSave, initialSeconds = 1500 }) {
  const format = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${String(sec).padStart(2, '0')}`;
  };

  const [text, setText] = useState(format(initialSeconds));

  useEffect(() => {
    setText(format(initialSeconds));
  }, [initialSeconds, visible]);

  function sanitizeInput(value) {
    let v = value.replace(/[^0-9:]/g, '');
    const parts = v.split(':');
    if (parts.length > 2) {
      v = parts[0] + ':' + parts.slice(1).join('');
    }
    if (v.length > 7) v = v.slice(0,7);
    return v;
  }

  function handleChange(value) {
    setText(sanitizeInput(value));
  }

  function handleSave() {
    const v = text.trim();
    if (v.includes(':')) {
      const [mRaw, sRaw] = v.split(':');
      const m = parseInt(mRaw || '0', 10);
      let s = parseInt((sRaw || '0').padEnd(2, '0'), 10);
      if (isNaN(m) || isNaN(s) || s < 0 || m < 0) {
        onClose();
        return;
      }
      if (s >= 60) {
        const extraM = Math.floor(s / 60);
        s = s % 60;
        const totalSeconds = (m + extraM) * 60 + s;
        onSave(totalSeconds);
      } else {
        onSave(m * 60 + s);
      }
      onClose();
    } else {
      const m = parseInt(v || '0', 10);
      if (isNaN(m) || m <= 0) {
        onClose();
        return;
      }
      onSave(m * 60);
      onClose();
    }
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.center}>
        <View style={styles.card}>
          <Text style={styles.title}>Tempo customizado (M:SS)</Text>
          <TextInput
            keyboardType={Platform.OS === 'ios' ? 'numbers-and-punctuation' : 'numeric'}
            value={text}
            onChangeText={handleChange}
            style={styles.input}
            placeholder="Ex: 1:50"
            placeholderTextColor="#94A3B8"
            returnKeyType="done"
            maxLength={7}
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
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
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