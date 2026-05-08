import { create } from 'zustand';

export interface ScanResult {
  id: string;
  data: string;
  type: 'url' | 'text';
  timestamp: number;
}

const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

interface ScanStore {
  scans: ScanResult[];
  addScan: (data: string, type: 'url' | 'text') => void;
  removeScan: (id: string) => void;
  clearScans: () => void;
}

export const useScanStore = create<ScanStore>((set) => ({
  scans: [],
  addScan: (data, type) =>
    set((state) => ({
      scans: [
        { id: generateId(), data, type, timestamp: Date.now() },
        ...state.scans,
      ],
    })),
  removeScan: (id) =>
    set((state) => ({
      scans: state.scans.filter((scan) => scan.id !== id),
    })),
  clearScans: () => set({ scans: [] }),
}));