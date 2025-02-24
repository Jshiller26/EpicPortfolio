import { create } from 'zustand';
import { FileSystemItem } from '../types/fileSystem';

type ClipboardOperation = 'cut' | 'copy' | null;

interface ClipboardState {
  item: FileSystemItem | null;
  operation: ClipboardOperation;
  setClipboard: (item: FileSystemItem, operation: 'cut' | 'copy') => void;
  clear: () => void;
}

export const useClipboardStore = create<ClipboardState>((set) => ({
  item: null,
  operation: null,

  setClipboard: (item, operation) => set({ 
    item, 
    operation 
  }),
  
  clear: () => set({ 
    item: null, 
    operation: null 
  })
}));