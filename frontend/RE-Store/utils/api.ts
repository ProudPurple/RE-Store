import { Platform } from 'react-native';
import { useEffect, useState } from 'react';

// On web the app is served by the backend itself, so requests stay same-origin.
export const API_URL = Platform.OS === 'web' ? '' : 'https://nonlinkage-unpunctiliously-goldie.ngrok-free.dev';
export const API_HEADERS = { 'ngrok-skip-browser-warning': 'true' };

export type Group = { photos: string[] };

// Showcase deployments run without a GPU, so the backend reports whether Restore works
export const useRestoreEnabled = () => {
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/config`, { headers: API_HEADERS })
      .then(res => res.json())
      .then(data => setEnabled(data.restoreEnabled !== false))
      .catch(() => {});
  }, []);

  return enabled;
};

export const useGroups = (pollMs?: number) => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const res = await fetch(`${API_URL}/groups`, { headers: API_HEADERS });
        const data = await res.json();
        if (active) { setGroups(data); setLoaded(true); }
      } catch (error) {
        console.log("Error Loading Groups: ", error);
      }
    };
    load();
    const timer = pollMs ? setInterval(load, pollMs) : undefined;
    return () => { active = false; if (timer) clearInterval(timer); };
  }, [pollMs]);

  return { groups, loaded };
};
