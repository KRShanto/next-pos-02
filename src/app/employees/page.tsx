"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Employee {
  id: string;
  name: string;
  role: string;
  email: string;
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await fetch("/api/employees");
        const data = await response.json();
        setEmployees(data);
      } catch (error) {
        console.error("Failed to fetch employees:", error);
      }
    };

    fetchEmployees();
  }, []);

  const handleAddEmployee = async (newEmployee: Omit<Employee, "id">) => {
    const employee = {
      ...newEmployee,
      id: Date.now().toString(),
    };

    const updatedEmployees = [...employees, employee];
    setEmployees(updatedEmployees);

    try {
      await fetch("/api/employees", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(employee),
      });

      toast({
        title: "Employee Added",
        description: `${newEmployee.name} has been added to the employees list.`,
      });
    } catch (error) {
      console.error("Failed to add employee:", error);
      toast({
        title: "Error",
        description: "Failed to add employee to the database.",
        variant: "destructive",
      });
    }

    setShowAddForm(false);
  };

  const handleUpdateEmployee = async (updatedEmployee: Employee) => {
    if (!updatedEmployee.id) {
      console.error("Employee ID is required for updates.");
      return;
    }

    const updatedEmployees = employees.map((employee) =>
      employee.id === updatedEmployee.id ? updatedEmployee : employee
    );

    setEmployees(updatedEmployees);

    try {
      await fetch(`/api/employees/${updatedEmployee.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedEmployee),
      });

      toast({
        title: "Employee Updated",
        description: `${updatedEmployee.name} has been updated.`,
      });
    } catch (error) {
      console.error("Failed to update employee:", error);
      toast({
        title: "Error",
        description: "Failed to update employee in the database.",
        variant: "destructive",
      });
    }

    setEditingEmployee(null);
  };

  const handleDeleteEmployee = async (id: string) => {
    const employeeToDelete = employees.find((employee) => employee.id === id);
    const updatedEmployees = employees.filter((employee) => employee.id !== id);
    setEmployees(updatedEmployees);

    try {
      await fetch(`/api/employees/${id}`, {
        method: "DELETE",
      });

      toast({
        title: "Employee Deleted",
        description: employeeToDelete
          ? `${employeeToDelete.name} has been removed.`
          : "Employee has been removed.",
      });
    } catch (error) {
      console.error("Failed to delete employee:", error);
      toast({
        title: "Error",
        description: "Failed to delete employee from the database.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Employee Management</h1>
        <Button onClick={() => setShowAddForm(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Employee
        </Button>
      </div>

      {showAddForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Add New Employee</CardTitle>
          </CardHeader>
          <CardContent>
            <EmployeeForm
              onSubmit={handleAddEmployee}
              onCancel={() => setShowAddForm(false)}
            />
          </CardContent>
        </Card>
      )}

      {editingEmployee && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Edit Employee</CardTitle>
          </CardHeader>
          <CardContent>
            <EmployeeForm
              onSubmit={handleUpdateEmployee as any}
              onCancel={() => setEditingEmployee(null)}
              initialValues={editingEmployee}
            />
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {employees.map((employee) => (
          <Card key={employee.id} className="border-2">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg">{employee.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Role: {employee.role}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Email: {employee.email}
                  </p>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1"
                    onClick={() => setEditingEmployee(employee)}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleDeleteEmployee(employee.id)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

interface EmployeeFormProps {
  onSubmit: (employee: Employee | Omit<Employee, "id">) => void;
  onCancel: () => void;
  initialValues?: Employee;
}

function EmployeeForm({
  onSubmit,
  onCancel,
  initialValues,
}: EmployeeFormProps) {
  const [name, setName] = useState(initialValues?.name || "");
  const [role, setRole] = useState(initialValues?.role || "");
  const [email, setEmail] = useState(initialValues?.email || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const employeeData = {
      name,
      role,
      email,
    };

    if (initialValues && initialValues.id) {
      // Update existing employee
      onSubmit({ ...employeeData, id: initialValues.id } as Employee);
    } else {
      onSubmit(employeeData as Omit<Employee, "id">);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., John Doe"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="role">Role</Label>
        <Input
          id="role"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          placeholder="e.g., Server"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="e.g., john.doe@example.com"
          required
        />
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {initialValues ? "Update Employee" : "Add Employee"}
        </Button>
      </div>
    </form>
  );
}
