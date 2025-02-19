import { create } from 'zustand';
import { FileSystemItem } from '../types/fileSystem';

interface ClipboardState {
  item: FileSystemItem | null;
  operation: 'cut' | 'copy' | null;
  setClipboard: (item: FileSystemItem, operation: 'cut' | 'copy') => void;
  clear: () => void;
}

export const useClipboardStore = create<ClipboardState>((set) => ({
  item: null,
  operation: null,
  setClipboard: (item, operation) => set({ item, operation }),
  clear: () => set({ item: null, operation: null }),
}));