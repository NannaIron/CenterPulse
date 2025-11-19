import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';

export default function CustomTimeModal({ visible, onClose, onSave, initialMinutes = 25 }) {
  const [minutes, setMinutes] = useState(String(initialMinutes));

  useEffect(() => {
    setMinutes(String(initialMinutes));
  }, [initialMinutes, visible]);

  function handleSave() {
    const n = parseInt(minutes, 10);
    if (!isNaN(n) && n > 0) {
      onSave(n);
      onClose();
    } else {
      setMinutes(String(initialMinutes));
      onClose();
    }
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.center}>
        <View style={styles.card}>
          <Text style={styles.title}>Tempo customizado (min)</Text>
          <TextInput
            keyboardType="number-pad"
            value={minutes}
            onChangeText={setMinutes}
            style={styles.input}
            placeholder="Ex: 30"
            placeholderTextColor="#94A3B8"
            returnKeyType="done"
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