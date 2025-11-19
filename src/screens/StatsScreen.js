import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getSessions } from '../services/storage';

export default function StatsScreen() {
  const [sessions, setSessions] = useState([]);
  const [totalMonthMinutes, setTotalMonthMinutes] = useState(0);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const arr = await getSessions();
    setSessions(arr);
    computeStats(arr);
  }

  function computeStats(arr) {
    const now = new Date();
    const month = now.getMonth();
    const total = arr
      .filter(s => new Date(s.date).getMonth() === month && s.completed)
      .reduce((a,b) => a + (b.actualMinutes || 0), 0);
    setTotalMonthMinutes(total);

    const byDate = {};
    arr.filter(s => s.completed).forEach(s => { byDate[s.date] = true; });
    let streakCount = 0;
    for (let i = 0; i < 30; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0,10);
      if (byDate[key]) streakCount++; else break;
    }
    setStreak(streakCount);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Estatísticas</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Total focado este mês</Text>
        <Text style={styles.cardValue}>{Math.floor(totalMonthMinutes/60)}h {totalMonthMinutes%60}m</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Streak atual</Text>
        <Text style={styles.cardValue}>{streak} dias 🔥</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Sessões totais</Text>
        <Text style={styles.cardValue}>{sessions.length}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: { color: '#F8FAFC', fontSize: 18, marginBottom: 12 },
  card: { backgroundColor: '#0B1220', padding: 12, borderRadius: 8, marginBottom: 10 },
  cardTitle: { color: '#94A3B8' },
  cardValue: { color: '#F8FAFC', fontSize: 16, fontWeight: '700' },
});