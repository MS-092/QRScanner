import { create } from 'zustand';

export interface ScanResult {
  id: string;
  data: string;
  type: 'url' | 'text';
  timestamp: number;
}

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
        { id: Date.now().toString(), data, type, timestamp: Date.now() },
        ...state.scans,
      ],
    })),
  removeScan: (id) =>
    set((state) => ({
      scans: state.scans.filter((scan) => scan.id !== id),
    })),
  clearScans: () => set({ scans: [] }),
}));