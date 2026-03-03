export interface Product {
  id: string;
  name: string;
  type: 's' | ''; // simple (checkbox) or quantity
  enabled: boolean;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  enabled: boolean;
  items: Product[];
}

export interface Employee {
  id: string;
  name: string;
  color: string;
  rate: number;
  enabled: boolean;
}

export interface Location {
  id: string;
  name: string;
  icon: string;
  color: string;
  enabled: boolean;
}

export interface AppConfig {
  locations: Location[];
  employees: Employee[];
  categories: Category[];
}
