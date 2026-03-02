import { create } from 'zustand';
import { Location, Employee, Product, Category, Report } from '@/types/common';

interface AppData {
  locations: Location[];
  employees: Employee[];
  products: Product[];
  categories: Category[];
  reports: Report[];
}

interface AppState extends AppData {
  isLoaded: boolean;
  isDirty: boolean;
  actions: {
    setData: (data: AppData) => void;
    // ... actions to modify data will be added here
    // e.g., updateLocation, addEmployee, etc.
  };
}

export const useDataStore = create<AppState>((set) => ({
  locations: [],
  employees: [],
  products: [],
  categories: [],
  reports: [],
  isLoaded: false,
  isDirty: false,
  actions: {
    setData: (data) => set({ ...data, isLoaded: true, isDirty: false }),
  },
}));

export const useData = () => useDataStore((state) => ({ ...state, actions: state.actions }));
export const useDataActions = () => useDataStore((state) => state.actions);
