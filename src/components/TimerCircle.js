import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function TimerCircle({ minutes, seconds }) {
  const mm = String(minutes).padStart(2, '0');
  const ss = String(seconds).padStart(2, '0');
  return (
    <View style={styles.wrapper}>
      <View style={styles.circle}>
        <Text style={styles.time}>{mm}:{ss}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { alignItems: 'center', justifyContent: 'center', padding: 16 },
  circle: {
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  time: { color: '#F8FAFC', fontSize: 44, fontWeight: '700' },
});