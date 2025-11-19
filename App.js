import React, { useEffect, useState } from 'react';
import { SafeAreaView, Text, Button, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@centerpulse/demo';

export default function App() {
  const [data, setData] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  async function saveData() {
    try {
      const payload = { ts: Date.now() };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      setData(payload);
    } catch (e) {
      console.warn('saveData error', e);
    }
  }

  async function loadData() {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      setData(raw ? JSON.parse(raw) : null);
    } catch (e) {
      console.warn('loadData error', e);
    }
  }

  async function clearData() {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      setData(null);
    } catch (e) {
      console.warn('clearData error', e);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>CenterPulse (demo)</Text>
      <Text>Dados armazenados: {data ? JSON.stringify(data) : '—'}</Text>
      <Button title="Salvar agora" onPress={saveData} />
      <Button title="Carregar" onPress={loadData} />
      <Button title="Limpar" onPress={clearData} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 },
  title: { fontSize: 18, marginBottom: 12 },
});
