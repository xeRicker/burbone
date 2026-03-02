"use client";

import { useForm } from "react-hook-form";
import { upsertEmployee } from "@/app/actions";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { IconPicker } from "@/components/ui/icon-picker";
import { Switch } from "@/components/ui/switch";
import { Employee } from "@/types/common";

interface EmployeeFormProps {
  employee?: Employee;
  isOpen: boolean;
  onClose: () => void;
}

// Simple random color generator (replace with more robust if needed)
const generateRandomColor = () => {
  const colors = [
    "#FF8C42", "#42B4FF", "#66D97A", "#FFD166", "#FF6B6B", "#64B5F6",
    "#9B59B6", "#E67E22", "#1ABC9C", "#3498DB", "#E74C3C", "#2ECC71"
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

export function EmployeeForm({ employee, isOpen, onClose }: EmployeeFormProps) {
  const { register, handleSubmit, control, setValue, watch, formState: { errors, isSubmitting } } = useForm<Employee>({
    defaultValues: employee || {
      name: "",
      hourlyRate: "29.00",
      icon: "User",
      color: generateRandomColor(), // Assign random color for new employees
      isActive: true,
    } as Employee,
  });
  const [serverError, setServerError] = useState<string | null>(null);

  const selectedIcon = watch("icon");
  const selectedColor = watch("color");
  const isActive = watch("isActive");

  const onSubmit = async (data: Employee) => {
    setServerError(null);
    const result = await upsertEmployee(data);
    if (result.success) {
      onClose();
    } else {
      setServerError(result.error || "Wystąpił nieznany błąd.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader><DialogTitle>{employee ? "Edytuj pracownika" : "Dodaj pracownika"}</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Imię</Label>
            <Input id="name" {...register("name", { required: "Imię jest wymagane." })} />
            {errors.name && <p className="text-sm text-error">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="hourlyRate">Stawka godzinowa</Label>
            <Input id="hourlyRate" type="number" step="0.01" {...register("hourlyRate", { required: "Stawka jest wymagana." })} />
            {errors.hourlyRate && <p className="text-sm text-error">{errors.hourlyRate.message}</p>}
          </div>

          <IconPicker
            label="Ikona"
            value={selectedIcon}
            onChange={(iconName) => setValue("icon", iconName)}
          />

          <div className="space-y-2">
            <Label htmlFor="color">Kolor</Label>
            <Input
              id="color"
              type="color"
              value={selectedColor}
              onChange={(e) => setValue("color", e.target.value)}
              className="w-full h-10 p-1 rounded-sm border border-border-default cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="isActive">Aktywny</Label>
            <Switch
              id="isActive"
              checked={isActive}
              onCheckedChange={(checked) => setValue("isActive", checked)}
            />
          </div>

          {serverError && <p className="text-sm text-error">{serverError}</p>}

          <DialogFooter>
            <Button type="button" variant="outlined" onClick={onClose}>Anuluj</Button>
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Zapisywanie..." : "Zapisz"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
