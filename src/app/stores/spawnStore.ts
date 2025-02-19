import { create } from 'zustand';

interface SpawnState {
  position: { x: number; y: number };
  setPosition: (x: number, y: number) => void;
}

export const useSpawnStore = create<SpawnState>((set) => ({
  position: { x: 1, y: 4 }, // Default spawn
  setPosition: (x, y) => set({ position: { x, y } }),
}));