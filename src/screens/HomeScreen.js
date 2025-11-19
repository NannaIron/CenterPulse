import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, AppState } from 'react-native';
import TimerCircle from '../components/TimerCircle';
import CustomTimeModal from '../components/CustomTimeModal';
import { saveSession, getSessions, saveActiveSession, getActiveSession, clearActiveSession } from '../services/storage';

function createId() {
  return `${Date.now()}-${Math.floor(Math.random()*10000)}`;
}

export default function HomeScreen() {
  const [plannedSeconds, setPlannedSeconds] = useState(25 * 60);
  const [remaining, setRemaining] = useState(plannedSeconds);
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef(null);
  const [todayTotalSeconds, setTodayTotalSeconds] = useState(0);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const activeRef = useRef(null);
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    setRemaining(plannedSeconds);
  }, [plannedSeconds]);

  useEffect(() => {
    (async () => {
      const active = await getActiveSession();
      if (active) {
        activeRef.current = active;
        setPlannedSeconds(active.plannedSeconds || plannedSeconds);
        const rem = Math.max(0, Math.ceil((active.endTime - Date.now()) / 1000));
        setRemaining(rem);
        setRunning(rem > 0);
      }
      computeTodayTotal();
    })();
  }, []);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (next) => {
      if (appState.current.match(/inactive|background/) && next === 'active') {
        if (activeRef.current) {
          const rem = Math.max(0, Math.ceil((activeRef.current.endTime - Date.now()) / 1000));
          setRemaining(rem);
          if (rem === 0) {
            finishSession();
          }
        }
      }
      appState.current = next;
    });
    return () => sub.remove();
  }, []);

  useEffect(() => {
    if (running && activeRef.current) {
      intervalRef.current = setInterval(() => {
        const rem = Math.max(0, Math.ceil((activeRef.current.endTime - Date.now()) / 1000));
        setRemaining(rem);
        setElapsed(prev => prev + 1);
        if (rem <= 0) {
          finishSession();
        }
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running]);

  async function startSession() {
    const id = createId();
    const startTime = Date.now();
    const endTime = startTime + plannedSeconds * 1000;
    const active = { id, startTime, plannedSeconds, endTime };
    activeRef.current = active;
    await saveActiveSession(active); 
    setRemaining(Math.max(0, Math.ceil((endTime - Date.now()) / 1000)));
    setElapsed(0);
    setRunning(true);
  }

  async function finishSession() {
    clearInterval(intervalRef.current);
    setRunning(false);
    const actualSeconds = Math.round(elapsed + (plannedSeconds - remaining));
    const session = {
      id: activeRef.current?.id || createId(),
      date: new Date().toISOString().slice(0,10),
      startTime: activeRef.current?.startTime || Date.now() - actualSeconds * 1000,
      plannedMinutes: Math.round(plannedSeconds / 60),
      actualMinutes: Math.round(actualSeconds / 60),
      completed: remaining === 0,
    };
    await saveSession(session); 
    await clearActiveSession();
    activeRef.current = null;
    setElapsed(0);
    setRemaining(plannedSeconds);
    computeTodayTotal();
  }

  async function stopSession() {
    clearInterval(intervalRef.current);
    setRunning(false);
    const actualSeconds = elapsed;
    const session = {
      id: activeRef.current?.id || createId(),
      date: new Date().toISOString().slice(0,10),
      startTime: activeRef.current?.startTime || Date.now() - actualSeconds * 1000,
      plannedMinutes: Math.round(plannedSeconds / 60),
      actualMinutes: Math.round(actualSeconds / 60),
      completed: false,
    };
    await saveSession(session);
    await clearActiveSession();
    activeRef.current = null;
    setElapsed(0);
    setRemaining(plannedSeconds);
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

  const displayMin = Math.floor(remaining / 60);
  const displaySec = remaining % 60;

  function handleCustomSave(newSeconds) {
    setPlannedSeconds(newSeconds);
  }

  return (
    <View style={styles.container}>
      <TimerCircle minutes={displayMin} seconds={displaySec} />
      <View style={styles.quick}>
        <TouchableOpacity style={styles.quickBtn} onPress={() => setPlannedSeconds(25 * 60)}>
          <Text style={styles.quickText}>25:00</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickBtn} onPress={() => setPlannedSeconds(50 * 60)}>
          <Text style={styles.quickText}>50:00</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickBtn} onPress={() => setShowCustomModal(true)}>
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

      <CustomTimeModal
        visible={showCustomModal}
        onClose={() => setShowCustomModal(false)}
        onSave={handleCustomSave}
        initialSeconds={plannedSeconds}
      />
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