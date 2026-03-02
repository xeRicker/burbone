"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layouts/page-header";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Location } from "@/types/common";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { LocationForm } from "@/components/features/locations/location-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { deleteLocation } from "@/app/actions";
import { Badge } from "@/components/ui/badge";

const fetchLocations = async () => (await fetch('/api/locations')).json();

const LocationCard = ({
  location,
  onEdit,
  onDelete,
}: {
  location: Location;
  onEdit: () => void;
  onDelete: (id: number) => void;
}) => {
  return (
    <Card className="flex flex-col justify-between">
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full" style={{ backgroundColor: location.color }}>
              <Icon name={location.icon as any || "MapPin"} size={24} className="text-text-on-primary" />
            </div>
            <CardTitle style={{ color: location.color }}>{location.name}</CardTitle>
          </div>
          <Badge variant={location.isActive ? "success" : "error"}>
            {location.isActive ? "Aktywny" : "Nieaktywny"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-text-secondary h-10">{location.address || "Brak adresu"}</p>
      </CardContent>
      <CardFooter className="flex gap-2 pt-0">
        <Button variant="tonal" size="sm" onClick={onEdit} className="flex-1">
          <Pencil className="w-4 h-4 mr-2" />
          Edytuj
        </Button>
        <Button variant="outlined" size="sm" onClick={() => onDelete(location.id)}>
          <Trash2 className="w-4 h-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default function LocationsPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | undefined>(undefined);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [locationToDelete, setLocationToDelete] = useState<number | null>(null);

  const queryClient = useQueryClient();
  const { data: locationsData, isLoading } = useQuery({ queryKey: ['locations'], queryFn: fetchLocations });

  const deleteMutation = useMutation({
    mutationFn: deleteLocation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
      setIsDeleteDialogOpen(false);
      setLocationToDelete(null);
    },
  });

  const handleEdit = (location: Location) => {
    setSelectedLocation(location);
    setIsFormOpen(true);
  };

  const handleAdd = () => {
    setSelectedLocation(undefined);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedLocation(undefined);
  };

  const handleDeleteClick = (id: number) => {
    setLocationToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (locationToDelete !== null) {
      deleteMutation.mutate(locationToDelete);
    }
  };

  return (
    <div>
      <PageHeader title="Punkty">
        <Button variant="tonal" onClick={handleAdd}>
          <Plus className="w-4 h-4 mr-2" />
          Dodaj punkt
        </Button>
      </PageHeader>

      {isLoading && <p>Ładowanie lokalizacji...</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {locationsData?.map((location: Location) => (
          <LocationCard
            key={location.id}
            location={location}
            onEdit={() => handleEdit(location)}
            onDelete={handleDeleteClick}
          />
        ))}
      </div>

      {isFormOpen && (
        <LocationForm
          isOpen={isFormOpen}
          onClose={handleCloseForm}
          location={selectedLocation}
        />
      )}

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Potwierdź usunięcie</DialogTitle>
          </DialogHeader>
          <p className="text-text-secondary">
            Czy na pewno chcesz usunąć ten punkt? Tej operacji nie można cofnąć.
          </p>
          <DialogFooter>
            <Button variant="outlined" onClick={() => setIsDeleteDialogOpen(false)}>
              Anuluj
            </Button>
            <Button variant="error" onClick={handleConfirmDelete} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? "Usuwanie..." : "Usuń"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
