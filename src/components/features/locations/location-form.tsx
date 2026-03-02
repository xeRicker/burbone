"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { upsertLocation } from "@/app/actions";
import { Location } from "@/types/common";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface LocationFormProps {
  location?: Location;
  isOpen: boolean;
  onClose: () => void;
}

export function LocationForm({ location, isOpen, onClose }: LocationFormProps) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Location>({
    defaultValues: location || { name: "", address: "", color: "#5A4030", icon: "MapPin", isActive: true } as Location,
  });
  const [serverError, setServerError] = useState<string | null>(null);

  const onSubmit = async (data: Location) => {
    setServerError(null);
    const result = await upsertLocation(data);
    if (result.success) {
      onClose();
    } else {
      setServerError(result.error || "Wystąpił nieznany błąd.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{location ? "Edytuj punkt" : "Dodaj nowy punkt"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nazwa</Label>
            <Input id="name" {...register("name", { required: "Nazwa jest wymagana." })} />
            {errors.name && <p className="text-sm text-error">{errors.name.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Adres</Label>
            <Input id="address" {...register("address")} />
          </div>
          
          {/* TODO: Add Color and Icon Pickers here */}

          {serverError && <p className="text-sm text-error">{serverError}</p>}
          
          <DialogFooter>
            <Button type="button" variant="outlined" onClick={onClose}>Anuluj</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Zapisywanie..." : "Zapisz"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
