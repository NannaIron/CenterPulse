import AsyncStorage from '@react-native-async-storage/async-storage';

const SESSIONS_KEY = '@CenterPulse:sessions';
const SETTINGS_KEY = '@CenterPulse:settings';

export async function getSessions() {
  try {
    const raw = await AsyncStorage.getItem(SESSIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.warn('getSessions error', e);
    return [];
  }
}

export async function saveSession(session) {
  try {
    const arr = await getSessions();
    arr.unshift(session);
    await AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(arr));
    return true;
  } catch (e) {
    console.warn('saveSession error', e);
    return false;
  }
}

export async function clearSessions() {
  try {
    await AsyncStorage.removeItem(SESSIONS_KEY);
    return true;
  } catch (e) {
    console.warn('clearSessions error', e);
    return false;
  }
}

export async function getSettings() {
  try {
    const raw = await AsyncStorage.getItem(SETTINGS_KEY);
    return raw ? JSON.parse(raw) : { defaultMinutes: 25, sound: true };
  } catch (e) {
    console.warn('getSettings error', e);
    return { defaultMinutes: 25, sound: true };
  }
}

export async function saveSettings(settings) {
  try {
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    return true;
  } catch (e) {
    console.warn('saveSettings error', e);
    return false;
  }
}