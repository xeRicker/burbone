export interface Employee {
    id: number;
    name: string;
    hourlyRate: string;
    icon: string;
    color: string;
    isActive: boolean;
    slug?: string;
}

export interface Location {
    id: number;
    name: string;
    address: string;
    icon: string;
    color: string;
    isActive: boolean;
}

export interface Product {
    id: number;
    name: string;
    categoryId: number;
    type: string;
    icon: string;
    isActive: boolean;
}

export interface Category {
    id: number;
    name: string;
    icon: string;
    color: string;
    isActive: boolean;
}

export interface WorkLog {
    hoursWorked: number;
    employeeSlug?: string;
    employeeId?: number;
}

export interface Report {
    id?: number;
    date: string;
    locationId: number;
    revenue: number;
    cardRevenue?: number;
    workLogs?: WorkLog[];
}
