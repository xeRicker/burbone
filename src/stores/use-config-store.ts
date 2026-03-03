import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AppConfig, Category, Employee, Location, Product } from '@/types/config';

interface ConfigState extends AppConfig {
  isLoading: boolean;
  isDirty: boolean; // Tells if there are unsaved changes
  
  setConfig: (config: AppConfig) => void;
  setLoading: (loading: boolean) => void;
  
  // Locations CRUD
  updateLocation: (id: string, data: Partial<Location>) => void;
  addLocation: (loc: Location) => void;
  
  // Employees CRUD
  updateEmployee: (id: string, data: Partial<Employee>) => void;
  addEmployee: (emp: Employee) => void;
  
  // Categories/Products CRUD
  updateCategory: (id: string, data: Partial<Category>) => void;
  addCategory: (cat: Category) => void;
  moveCategory: (index: number, direction: 'up' | 'down') => void;
  updateProduct: (catId: string, prodId: string, data: Partial<Product>) => void;
  addProduct: (catId: string, prod: Product) => void;
  
  // Persistence
  saveToServer: () => Promise<void>;
}

export const useConfigStore = create<ConfigState>()(
  persist(
    (set, get) => ({
      locations: [],
      employees: [],
      categories: [],
      isLoading: true,
      isDirty: false,

      setConfig: (config) => set({ ...config, isLoading: false, isDirty: false }),
      setLoading: (isLoading) => set({ isLoading }),

      updateLocation: (id, data) => set(state => ({
        locations: state.locations.map(l => l.id === id ? { ...l, ...data } : l),
        isDirty: true
      })),
      addLocation: (loc) => set(state => ({
        locations: [...state.locations, loc],
        isDirty: true
      })),

      updateEmployee: (id, data) => set(state => ({
        employees: state.employees.map(e => e.id === id ? { ...e, ...data } : e),
        isDirty: true
      })),
      addEmployee: (emp) => set(state => ({
        employees: [...state.employees, emp],
        isDirty: true
      })),

      updateCategory: (id, data) => set(state => ({
        categories: state.categories.map(c => c.id === id ? { ...c, ...data } : c),
        isDirty: true
      })),
      addCategory: (cat) => set(state => ({
        categories: [...state.categories, cat],
        isDirty: true
      })),

      moveCategory: (index, direction) => set(state => {
        const newCats = [...state.categories];
        if (direction === 'up' && index > 0) {
          [newCats[index - 1], newCats[index]] = [newCats[index]!, newCats[index - 1]!];
        } else if (direction === 'down' && index < newCats.length - 1) {
          [newCats[index], newCats[index + 1]] = [newCats[index + 1]!, newCats[index]!];
        }
        return { categories: newCats, isDirty: true };
      }),

      updateProduct: (catId, prodId, data) => set(state => ({
        categories: state.categories.map(c => c.id === catId ? {
          ...c,
          items: c.items.map(p => p.id === prodId ? { ...p, ...data } : p)
        } : c),
        isDirty: true
      })),
      addProduct: (catId, prod) => set(state => ({
        categories: state.categories.map(c => c.id === catId ? {
          ...c,
          items: [...c.items, prod]
        } : c),
        isDirty: true
      })),

      saveToServer: async () => {
        const { locations, employees, categories } = get();
        const response = await fetch('/api/config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ locations, employees, categories })
        });
        if (response.ok) set({ isDirty: false });
      }
    }),
    { name: 'burbone-config' }
  )
);
