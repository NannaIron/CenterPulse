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
  const [focusedSeconds, setFocusedSeconds] = useState(0); 
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

        if (active.paused) {
          const rem = typeof active.remaining === 'number' ? active.remaining : Math.max(0, Math.ceil((active.endTime - Date.now()) / 1000));
          setRemaining(rem);
          setRunning(false);
          setFocusedSeconds(Math.max(0, (active.plannedSeconds || plannedSeconds) - rem));
        } else {
          const rem = Math.max(0, Math.ceil((active.endTime - Date.now()) / 1000));
          setRemaining(rem);
          setRunning(rem > 0);
          setFocusedSeconds((active.plannedSeconds || plannedSeconds) - rem);
          if (rem === 0) {
            finishSession(rem);
          }
        }
      }
      computeTodayTotal();
    })();
  }, []);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (next) => {
      if (appState.current.match(/inactive|background/) && next === 'active') {
        if (activeRef.current) {
          if (activeRef.current.paused) {
            const rem = typeof activeRef.current.remaining === 'number' ? activeRef.current.remaining : Math.max(0, Math.ceil((activeRef.current.endTime - Date.now()) / 1000));
            setRemaining(rem);
            setRunning(false);
            setFocusedSeconds((activeRef.current.plannedSeconds || plannedSeconds) - rem);
          } else {
            const rem = Math.max(0, Math.ceil((activeRef.current.endTime - Date.now()) / 1000));
            setRemaining(rem);
            if (rem === 0) {
              finishSession(rem);
            } else {
              setRunning(true);
              setFocusedSeconds((activeRef.current.plannedSeconds || plannedSeconds) - rem);
            }
          }
        }
      }
      appState.current = next;
    });
    return () => sub.remove();
  }, []);

  useEffect(() => {
    if (running && activeRef.current && !activeRef.current.paused) {
      intervalRef.current = setInterval(() => {
        const rem = Math.max(0, Math.ceil((activeRef.current.endTime - Date.now()) / 1000));
        setRemaining(rem);
        setFocusedSeconds(prev => prev + 1);
        if (rem <= 0) {
          finishSession(rem);
        }
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running]);

  async function addTime(secondsToAdd) {
    const currentPlanned = activeRef.current?.plannedSeconds ?? plannedSeconds;
    const newPlanned = currentPlanned + secondsToAdd;
    setPlannedSeconds(newPlanned);

    setRemaining((r) => Math.max(0, r + secondsToAdd));

    if (activeRef.current) {
      if (activeRef.current.paused) {
        const rem = typeof activeRef.current.remaining === 'number'
          ? activeRef.current.remaining
          : Math.max(0, Math.ceil((activeRef.current.endTime - Date.now()) / 1000));
        activeRef.current.remaining = rem + secondsToAdd;
      } else {
        activeRef.current.endTime = (activeRef.current.endTime || Date.now()) + secondsToAdd * 1000;
      }
      activeRef.current.plannedSeconds = newPlanned;
      await saveActiveSession(activeRef.current);
    }
  }

  async function handleStartPress() {
    if (activeRef.current && activeRef.current.paused) {
      const rem = typeof activeRef.current.remaining === 'number' ? activeRef.current.remaining : Math.max(0, Math.ceil((activeRef.current.endTime - Date.now()) / 1000));
      const newEnd = Date.now() + rem * 1000;
      activeRef.current.endTime = newEnd;
      activeRef.current.paused = false;
      delete activeRef.current.remaining;
      await saveActiveSession(activeRef.current);
      setRemaining(rem);
      setRunning(true);
      return;
    }

    const id = createId();
    const startTime = Date.now();
    const endTime = startTime + plannedSeconds * 1000;
    const active = { id, startTime, plannedSeconds, endTime, pauseCount: 0, paused: false };
    activeRef.current = active;
    await saveActiveSession(active);
    setRemaining(Math.max(0, Math.ceil((endTime - Date.now()) / 1000)));
    setFocusedSeconds(0);
    setRunning(true);
  }

  async function handlePausePress() {
    if (!activeRef.current || activeRef.current.paused) return;
    const rem = Math.max(0, Math.ceil((activeRef.current.endTime - Date.now()) / 1000));
    activeRef.current.remaining = rem;
    activeRef.current.paused = true;
    activeRef.current.pauseCount = (activeRef.current.pauseCount || 0) + 1;
    await saveActiveSession(activeRef.current);
    setRemaining(rem);
    setRunning(false);
  }

  async function handleStopPress() {
    clearInterval(intervalRef.current);
    setRunning(false);

    const actualSeconds = focusedSeconds;
    const session = {
      id: activeRef.current?.id || createId(),
      date: new Date().toISOString().slice(0,10),
      startTime: activeRef.current?.startTime || Date.now() - actualSeconds * 1000,
      plannedMinutes: Math.round(plannedSeconds / 60),
      actualMinutes: Math.round(actualSeconds / 60),
      completed: false,
      pauseCount: activeRef.current?.pauseCount || 0,
    };
    await saveSession(session);
    await clearActiveSession();
    activeRef.current = null;
    setFocusedSeconds(0);
    setRemaining(plannedSeconds);
    computeTodayTotal();
  }

  async function finishSession(finalRemaining = null) {
    clearInterval(intervalRef.current);
    setRunning(false);

    const rem = typeof finalRemaining === 'number' ? finalRemaining : remaining;
    const completed = rem === 0;

    const actualSeconds = completed
      ? (activeRef.current?.plannedSeconds ?? plannedSeconds)
      : Math.round(focusedSeconds);

    const session = {
      id: activeRef.current?.id || createId(),
      date: new Date().toISOString().slice(0,10),
      startTime: activeRef.current?.startTime || Date.now() - actualSeconds * 1000,
      plannedMinutes: Math.round((activeRef.current?.plannedSeconds ?? plannedSeconds) / 60),
      actualMinutes: Math.round(actualSeconds / 60),
      completed,
      pauseCount: activeRef.current?.pauseCount || 0,
    };

    await saveSession(session);
    await clearActiveSession();
    activeRef.current = null;
    setFocusedSeconds(0);
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
        <TouchableOpacity style={styles.quickBtn} onPress={() => addTime(30)}>
          <Text style={styles.quickText}>+ 0:30</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickBtn} onPress={() => addTime(60)}>
          <Text style={styles.quickText}>+ 1:00</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickBtn} onPress={() => setShowCustomModal(true)}>
          <Text style={styles.quickText}>Custom</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity style={styles.start} onPress={handleStartPress}>
          <Text style={styles.startText}>INICIO</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.pause} onPress={handlePausePress}>
          <Text style={styles.pauseText}>PAUSAR</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.stop} onPress={handleStopPress}>
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
  start: { backgroundColor: '#7C3AED', padding: 14, borderRadius: 40, marginRight: 8 },
  startText: { color: '#fff', fontWeight: '700' },
  pause: { backgroundColor: '#2563EB', padding: 14, borderRadius: 40, marginRight: 8 },
  pauseText: { color: '#fff', fontWeight: '700' },
  stop: { backgroundColor: '#EF4444', padding: 14, borderRadius: 40 },
  stopText: { color: '#fff', fontWeight: '700' },
  card: { marginTop: 24, backgroundColor: '#111827', padding: 12, borderRadius: 8, width: '100%' },
  cardText: { color: '#F8FAFC' },
});