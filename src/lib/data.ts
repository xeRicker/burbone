export const EMPLOYEES = ["Paweł", "Radek", "Sebastian", "Tomek", "Kacper", "Natalia", "Dominik"] as const;

export const EMPLOYEE_COLORS: Record<string, string> = {
  Paweł: "#3498db",
  Radek: "#2ecc71",
  Sebastian: "#e74c3c",
  Tomek: "#f1c40f",
  Natalia: "#9b59b6",
  Kacper: "#e67e22",
  Dominik: "#1abc9c",
};

export const TIME_PRESETS = [
  { label: "12:00 - 19:30", value: "12:00-19:30" },
  { label: "12:00 - 20:00", value: "12:00-20:00" },
  { label: "12:00 - 20:30", value: "12:00-20:30" },
  { label: "12:00 - 21:00", value: "12:00-21:00" },
  { label: "12:00 - 21:30", value: "12:00-21:30" },
  { label: "12:00 - 22:00", value: "12:00-22:00" },
  { label: "14:00 - 19:30", value: "14:00-19:30" },
  { label: "14:00 - 20:00", value: "14:00-20:00" },
  { label: "14:00 - 20:30", value: "14:00-20:30" },
  { label: "14:00 - 21:00", value: "14:00-21:00" },
  { label: "14:00 - 21:30", value: "14:00-21:30" },
  { label: "14:00 - 22:00", value: "14:00-22:00" },
  { label: "16:00 - 19:30", value: "16:00-19:30" },
  { label: "16:00 - 20:00", value: "16:00-20:00" },
  { label: "16:00 - 20:30", value: "16:00-20:30" },
  { label: "16:00 - 21:30", value: "16:00-21:30" },
  { label: "16:00 - 22:00", value: "16:00-22:00" },
] as const;
