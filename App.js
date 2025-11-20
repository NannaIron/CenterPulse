import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import * as NavigationBar from 'expo-navigation-bar';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons'; // <--- adicionado
import HomeScreen from './src/screens/HomeScreen';
import StatsScreen from './src/screens/StatsScreen';
import HistoryScreen from './src/screens/HistoryScreen';

export default function App() {
  const [route, setRoute] = useState('home');

  useEffect(() => {
    if (Platform.OS === 'android') {
      NavigationBar.setVisibilityAsync('hidden').catch(()=>{});
    }
    return () => {
      if (Platform.OS === 'android') {
        NavigationBar.setVisibilityAsync('visible').catch(()=>{});
      }
    };
  }, []);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar hidden />
        <View style={styles.header}>
          <Text style={styles.title}>CenterPulse</Text>
        </View>

        <View style={styles.content}>
          {route === 'home' && <HomeScreen />}
          {route === 'stats' && <StatsScreen />}
          {route === 'history' && <HistoryScreen />}
        </View>

        <View style={styles.tabbar}>
          <TouchableOpacity style={styles.tab} onPress={() => setRoute('stats')}>
            <Ionicons name="bar-chart-outline" size={28} color="#94A3B8" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.tab} onPress={() => setRoute('home')}>
            <Ionicons name="home-outline" size={28} color="#94A3B8" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.tab} onPress={() => setRoute('history')}>
            <Ionicons name="time-outline" size={28} color="#94A3B8" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  header: { padding: 16, alignItems: 'center' },
  title: { color: '#F8FAFC', fontSize: 20, fontWeight: '600', marginTop: 10 },
  content: { flex: 1 },
  tabbar: { flexDirection: 'row', height: 64, borderTopWidth: 1, borderTopColor: '#1E293B' },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  tabText: { color: '#94A3B8' },
});
