"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layouts/page-header";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Employee } from "@/types/common";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { EmployeeForm } from "@/components/features/employees/employee-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { deleteEmployee } from "@/app/actions";
import { Badge } from "@/components/ui/badge";

const fetchEmployees = async () => (await fetch('/api/employees')).json();

const EmployeeCard = ({
  employee,
  onEdit,
  onDelete,
}: {
  employee: Employee;
  onEdit: () => void;
  onDelete: (id: number) => void;
}) => {
  return (
    <Card className="flex flex-col justify-between">
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full" style={{ backgroundColor: employee.color }}>
              <Icon name={employee.icon as any || "User"} size={24} className="text-text-on-primary" />
            </div>
            <CardTitle style={{ color: employee.color }}>{employee.name}</CardTitle>
          </div>
          <Badge variant={employee.isActive ? "success" : "error"}>
            {employee.isActive ? "Aktywny" : "Nieaktywny"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-text-secondary">Stawka: {employee.hourlyRate} zł/h</p>
      </CardContent>
      <CardFooter className="flex gap-2 pt-0">
        <Button variant="tonal" size="sm" onClick={onEdit} className="flex-1">
          <Pencil className="w-4 h-4 mr-2" />
          Edytuj
        </Button>
        <Button variant="outlined" size="sm" onClick={() => onDelete(employee.id)}>
          <Trash2 className="w-4 h-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default function EmployeesPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | undefined>(undefined);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<number | null>(null);

  const queryClient = useQueryClient();
  const { data: employeesData, isLoading } = useQuery({ queryKey: ['employees'], queryFn: fetchEmployees });

  const deleteMutation = useMutation({
    mutationFn: deleteEmployee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      setIsDeleteDialogOpen(false);
      setEmployeeToDelete(null);
    },
  });

  const handleEdit = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsFormOpen(true);
  };

  const handleAdd = () => {
    setSelectedEmployee(undefined);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedEmployee(undefined);
  };

  const handleDeleteClick = (id: number) => {
    setEmployeeToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (employeeToDelete !== null) {
      deleteMutation.mutate(employeeToDelete);
    }
  };

  return (
    <div>
      <PageHeader title="Zarządzanie ekipą">
        <Button variant="tonal" onClick={handleAdd}>
          <Plus className="w-4 h-4 mr-2" />
          Dodaj pracownika
        </Button>
      </PageHeader>

      {isLoading && <p>Ładowanie...</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {employeesData?.map((employee: Employee) => (
          <EmployeeCard
            key={employee.id}
            employee={employee}
            onEdit={() => handleEdit(employee)}
            onDelete={handleDeleteClick}
          />
        ))}
      </div>

      {isFormOpen && (
        <EmployeeForm
          isOpen={isFormOpen}
          onClose={handleCloseForm}
          employee={selectedEmployee}
        />
      )}

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Potwierdź usunięcie</DialogTitle>
          </DialogHeader>
          <p className="text-text-secondary">
            Czy na pewno chcesz usunąć tego pracownika? Tej operacji nie można cofnąć.
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
