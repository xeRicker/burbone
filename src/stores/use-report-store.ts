import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface EmployeeShift {
  start: string;
  end: string;
}

interface ReportState {
  location: string | null;
  revenue: string;
  cardRevenue: string;
  employees: Record<string, EmployeeShift>;
  products: Record<string, number>;
  
  setLocation: (location: string | null) => void;
  setRevenue: (val: string) => void;
  setCardRevenue: (val: string) => void;
  setEmployeeShift: (id: string, start: string, end: string) => void;
  toggleProduct: (name: string, val?: number) => void;
  reset: () => void;
}

export const useReportStore = create<ReportState>()(
  persist(
    (set) => ({
      location: null,
      revenue: '',
      cardRevenue: '',
      employees: {},
      products: {},

      setLocation: (location: string | null) => set({ location }),
      setRevenue: (revenue: string) => set({ revenue }),
      setCardRevenue: (cardRevenue: string) => set({ cardRevenue }),
      setEmployeeShift: (id: string, start: string, end: string) => 
        set((state: ReportState) => ({
          employees: {
            ...state.employees,
            [id]: { start, end }
          }
        })),
      toggleProduct: (name: string, val?: number) =>
        set((state: ReportState) => {
          const products = { ...state.products };
          if (val === undefined) {
            if (products[name]) delete products[name];
            else products[name] = 1;
          } else if (val === 0) {
            delete products[name];
          } else {
            products[name] = val;
          }
          return { products };
        }),
      reset: () => set({ revenue: '', cardRevenue: '', employees: {}, products: {} }),
    }),
    {
      name: 'burbone-report-state',
    }
  )
);
