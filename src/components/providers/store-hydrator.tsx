"use client";

import { useEffect, useRef } from 'react';
import { useDataStore } from '@/stores/data-store';
import { Location, Employee, Product, Category, Report } from '@/types/common';

interface AppData {
  locations: Location[];
  employees: Employee[];
  products: Product[];
  categories: Category[];
  reports: Report[];
}

interface StoreHydratorProps {
  data: AppData;
}

export function StoreHydrator({ data }: StoreHydratorProps) {
  const isInitialized = useRef(false);
  const { actions } = useDataStore();

  useEffect(() => {
    if (!isInitialized.current) {
      actions.setData(data);
      isInitialized.current = true;
    }
  }, [data, actions]);

  return null;
}
