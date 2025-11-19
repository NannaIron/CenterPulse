import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { getSessions, clearSessions } from '../services/storage';

export default function HistoryScreen() {
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const arr = await getSessions();
    setSessions(arr);
  }

  async function handleClear() {
    await clearSessions();
    setSessions([]);
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Histórico</Text>
        <TouchableOpacity onPress={handleClear}>
          <Text style={styles.clear}>Limpar</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={sessions}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.itemText}>{item.date} • {item.plannedMinutes}min • {item.completed ? 'Concluída ✅' : 'Abandonada ❌'}</Text>
            <Text style={styles.subText}>Real: {item.actualMinutes} min</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>Nenhuma sessão ainda</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  title: { color: '#F8FAFC', fontSize: 18 },
  clear: { color: '#F59E0B' },
  item: { padding: 12, backgroundColor: '#0B1220', borderRadius: 8, marginBottom: 8 },
  itemText: { color: '#F8FAFC' },
  subText: { color: '#94A3B8', marginTop: 6 },
  empty: { color: '#94A3B8', textAlign: 'center', marginTop: 20 },
});