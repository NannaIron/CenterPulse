import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import TimerCircle from '../components/TimerCircle';
import { saveSession, getSessions } from '../services/storage';

function createId() {
  return `${Date.now()}-${Math.floor(Math.random()*10000)}`;
}

export default function HomeScreen() {
  const [minutesPlanned, setMinutesPlanned] = useState(25);
  const [remaining, setRemaining] = useState(minutesPlanned * 60);
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef(null);
  const [todayTotalSeconds, setTodayTotalSeconds] = useState(0);

  useEffect(() => {
    setRemaining(minutesPlanned * 60);
  }, [minutesPlanned]);

  useEffect(() => {
    computeTodayTotal();
  }, []);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setRemaining(r => {
          if (r <= 1) {
            finishSession();
            return 0;
          }
          setElapsed(e => e + 1);
          return r - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running]);

  function startSession() {
    setRunning(true);
  }

  async function finishSession() {
    clearInterval(intervalRef.current);
    setRunning(false);
    const actualSeconds = Math.round(elapsed + (minutesPlanned * 60 - remaining));
    const session = {
      id: createId(),
      date: new Date().toISOString().slice(0,10),
      startTime: Date.now() - actualSeconds * 1000,
      plannedMinutes: minutesPlanned,
      actualMinutes: Math.round(actualSeconds / 60),
      completed: remaining === 0,
    };
    await saveSession(session); 
    setElapsed(0);
    setRemaining(minutesPlanned * 60);
    computeTodayTotal();
  }

  async function stopSession() {
    clearInterval(intervalRef.current);
    setRunning(false);
    const actualSeconds = elapsed;
    const session = {
      id: createId(),
      date: new Date().toISOString().slice(0,10),
      startTime: Date.now() - actualSeconds * 1000,
      plannedMinutes: minutesPlanned,
      actualMinutes: Math.round(actualSeconds / 60),
      completed: false,
    };
    await saveSession(session);
    setElapsed(0);
    setRemaining(minutesPlanned * 60);
    computeTodayTotal();
  }

  async function computeTodayTotal() {
    const arr = await getSessions();
    const today = new Date().toISOString().slice(0,10);
    const seconds = arr
      .filter(s => s.date === today && s.completed)
      .reduce((acc, s) => acc + (s.actualMinutes * 60), 0);
    setTodayTotalSeconds(seconds);
  }

  const displayMin = Math.floor((remaining) / 60);
  const displaySec = remaining % 60;

  return (
    <View style={styles.container}>
      <TimerCircle minutes={displayMin} seconds={displaySec} />
      <View style={styles.quick}>
        <TouchableOpacity style={styles.quickBtn} onPress={() => setMinutesPlanned(25)}>
          <Text style={styles.quickText}>25 min</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickBtn} onPress={() => setMinutesPlanned(50)}>
          <Text style={styles.quickText}>50 min</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickBtn} onPress={() => {}}>
          <Text style={styles.quickText}>Custom</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.controls}>
        {!running ? (
          <TouchableOpacity style={styles.start} onPress={startSession}>
            <Text style={styles.startText} onPress={() => setRunning(true)}>INICIAR</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.pause} onPress={() => setRunning(false)}>
            <Text style={styles.pauseText}>PAUSAR</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.stop} onPress={stopSession}>
          <Text style={styles.stopText}>PARAR</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardText}>Sessões hoje (concluídas): {Math.floor(todayTotalSeconds/60)} min</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', padding: 16 },
  quick: { flexDirection: 'row', marginTop: 8 },
  quickBtn: { padding: 8, margin: 6, backgroundColor: '#1E293B', borderRadius: 8 },
  quickText: { color: '#F8FAFC' },
  controls: { flexDirection: 'row', marginTop: 18 },
  start: { backgroundColor: '#7C3AED', padding: 14, borderRadius: 40, marginRight: 12 },
  startText: { color: '#fff', fontWeight: '700' },
  pause: { backgroundColor: '#2563EB', padding: 14, borderRadius: 40, marginRight: 12 },
  pauseText: { color: '#fff', fontWeight: '700' },
  stop: { backgroundColor: '#EF4444', padding: 14, borderRadius: 40 },
  stopText: { color: '#fff', fontWeight: '700' },
  card: { marginTop: 24, backgroundColor: '#111827', padding: 12, borderRadius: 8, width: '100%' },
  cardText: { color: '#F8FAFC' },
});