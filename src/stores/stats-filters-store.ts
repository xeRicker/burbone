import { create } from 'zustand';
import { startOfWeek, endOfWeek, subDays } from 'date-fns';

type DateRange = {
  from: Date;
  to: Date;
};

type State = {
  dateRange: DateRange;
  locationId: number | 'all';
  currentMonth: Date;
};

type Actions = {
  setDateRange: (range: DateRange) => void;
  setLocationId: (id: number | 'all') => void;
  setCurrentMonth: (month: Date) => void;
};

const initialState: State = {
  dateRange: {
    from: startOfWeek(new Date(), { weekStartsOn: 1 }),
    to: endOfWeek(new Date(), { weekStartsOn: 1 }),
  },
  locationId: 'all',
  currentMonth: new Date(), // Initialize to current month
};

export const useStatsFiltersStore = create<State & Actions>((set) => ({
  ...initialState,
  setDateRange: (dateRange) => set({ dateRange }),
  setLocationId: (locationId) => set({ locationId }),
  setCurrentMonth: (currentMonth) => set({ currentMonth }),
}));
