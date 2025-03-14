"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Edit, Trash2, Users, ShoppingCart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";

interface Table {
  id: string;
  name: string;
  capacity: number;
  status: "available" | "occupied" | "reserved" | "cleaning";
  currentOrderId?: string;
  assignedServer?: string;
  reservationTime?: string;
  reservationName?: string;
}

interface Server {
  id: string;
  name: string;
}

export default function TablesPage() {
  const [tables, setTables] = useState<Table[]>([]);
  const [servers, setServers] = useState<Server[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch tables
        const tablesResponse = await fetch("/api/tables");
        const tablesData = await tablesResponse.json();
        setTables(tablesData);

        // Fetch servers/employees
        const serversResponse = await fetch("/api/employees");
        const serversData = await serversResponse.json();
        setServers(serversData);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };

    fetchData();
  }, []);

  const saveTables = (updatedTables: Table[]) => {
    setTables(updatedTables);
  };

  const handleAddTable = async (newTable: Omit<Table, "id">) => {
    const table = {
      ...newTable,
      id: Date.now().toString(),
    };

    const updatedTables = [...tables, table];
    setTables(updatedTables);

    // Make an API call to add the new table to the database
    try {
      await fetch("/api/tables", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(table),
      });

      toast({
        title: "Table Added",
        description: `${newTable.name} has been added to the tables.`,
      });
    } catch (error) {
      console.error("Failed to save table:", error);
      toast({
        title: "Error",
        description: "Failed to save table to the database.",
        variant: "destructive",
      });
    }

    setShowAddForm(false);
  };

  const handleUpdateTable = async (updatedTable: Table | Omit<Table, "id">) => {
    // If it's a new table without an ID, we shouldn't reach this code path
    if (!("id" in updatedTable)) {
      console.error("Attempted to update a table without an ID");
      return;
    }

    const updatedTables = tables.map((table) =>
      table.id === updatedTable.id ? (updatedTable as Table) : table
    );

    setTables(updatedTables);

    // Make an API call to update the database
    try {
      await fetch(`/api/tables/${updatedTable.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedTable),
      });

      toast({
        title: "Table Updated",
        description: `${updatedTable.name} has been updated.`,
      });
    } catch (error) {
      console.error("Failed to update table:", error);
      toast({
        title: "Error",
        description: "Failed to update table in the database.",
        variant: "destructive",
      });
    }

    setEditingTable(null);
  };

  const handleDeleteTable = async (id: string) => {
    const tableToDelete = tables.find((table) => table.id === id);
    const updatedTables = tables.filter((table) => table.id !== id);
    setTables(updatedTables);

    // Make an API call to delete the table from the database
    try {
      await fetch(`/api/tables/${id}`, {
        method: "DELETE",
      });

      toast({
        title: "Table Deleted",
        description: tableToDelete
          ? `${tableToDelete.name} has been removed.`
          : "Table has been removed.",
      });
    } catch (error) {
      console.error("Failed to delete table:", error);
      toast({
        title: "Error",
        description: "Failed to delete table from the database.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateTableStatus = async (
    tableId: string,
    status: Table["status"]
  ) => {
    const updatedTables = tables.map((table) => {
      if (table.id === tableId) {
        // Reset relevant fields when changing status
        const updatedTable = { ...table, status };

        if (status === "available") {
          delete updatedTable.currentOrderId;
          delete updatedTable.assignedServer;
          delete updatedTable.reservationTime;
          delete updatedTable.reservationName;
        }

        return updatedTable;
      }
      return table;
    });

    setTables(updatedTables);

    try {
      // Make an API call to update the table status in the database
      await fetch(`/api/tables/${tableId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      toast({
        title: "Status Updated",
        description: `Table status has been updated to ${status}.`,
      });
    } catch (error) {
      console.error("Failed to update table status:", error);
      toast({
        title: "Error",
        description: "Failed to update table status in the database.",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-500";
      case "occupied":
        return "bg-red-500";
      case "reserved":
        return "bg-blue-500";
      case "cleaning":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  const getServerName = (serverId?: string) => {
    if (!serverId) return "Unassigned";
    const server = servers.find((s) => s.id === serverId);
    return server ? server.name : "Unknown";
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Table Management</h1>
        <Button onClick={() => setShowAddForm(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Table
        </Button>
      </div>

      {showAddForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Add New Table</CardTitle>
          </CardHeader>
          <CardContent>
            <TableForm
              onSubmit={handleAddTable}
              onCancel={() => setShowAddForm(false)}
              servers={servers}
            />
          </CardContent>
        </Card>
      )}

      {editingTable && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Edit Table</CardTitle>
          </CardHeader>
          <CardContent>
            <TableForm
              onSubmit={handleUpdateTable}
              onCancel={() => setEditingTable(null)}
              initialValues={editingTable}
              servers={servers}
            />
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {tables.map((table) => (
          <Card
            key={table.id}
            className={
              table.status === "available"
                ? "border-green-500 border-2"
                : table.status === "occupied"
                ? "border-red-500 border-2"
                : table.status === "reserved"
                ? "border-blue-500 border-2"
                : "border-yellow-500 border-2"
            }
          >
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg">{table.name}</h3>
                  <div className="flex items-center mt-1">
                    <Users className="h-4 w-4 mr-1 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Capacity: {table.capacity}
                    </span>
                  </div>
                  {table.assignedServer && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Server: {getServerName(table.assignedServer)}
                    </p>
                  )}
                  {table.reservationTime && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Reserved:{" "}
                      {new Date(table.reservationTime).toLocaleTimeString()} -{" "}
                      {table.reservationName}
                    </p>
                  )}
                </div>
                <Badge className={getStatusColor(table.status)}>
                  {table.status.charAt(0).toUpperCase() + table.status.slice(1)}
                </Badge>
              </div>

              <div className="mt-4 space-y-2">
                <Select
                  value={table.status}
                  onValueChange={(value) =>
                    handleUpdateTableStatus(table.id, value as Table["status"])
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Change Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="occupied">Occupied</SelectItem>
                    <SelectItem value="reserved">Reserved</SelectItem>
                    <SelectItem value="cleaning">Cleaning</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex space-x-2">
                  {table.status === "occupied" && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      asChild
                    >
                      <Link href={`/orders?tableId=${table.id}`}>
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        View Order
                      </Link>
                    </Button>
                  )}
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => setEditingTable(table)}
                      >
                        <Users className="mr-2 h-4 w-4" />
                        Assign Server
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Assign Server to {table.name}</DialogTitle>
                      </DialogHeader>
                      <ServerAssignmentForm
                        currentServerId={table.assignedServer}
                        servers={servers}
                        onAssign={(serverId) => {
                          const updatedTables = tables.map((t) =>
                            t.id === table.id
                              ? { ...t, assignedServer: serverId }
                              : t
                          );
                          saveTables(updatedTables);
                          toast({
                            title: "Server Assigned",
                            description: `${getServerName(
                              serverId
                            )} has been assigned to ${table.name}.`,
                          });
                        }}
                      />
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1"
                    onClick={() => setEditingTable(table)}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleDeleteTable(table.id)}
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

interface TableFormProps {
  onSubmit: (table: Table) => void;
  onCancel: () => void;
  initialValues?: Table;
  servers: Server[];
}

function TableForm({
  onSubmit,
  onCancel,
  initialValues,
  servers,
}: TableFormProps) {
  const [name, setName] = useState(initialValues?.name || "");
  const [capacity, setCapacity] = useState(
    initialValues?.capacity.toString() || "4"
  );
  const [status, setStatus] = useState<Table["status"]>(
    initialValues?.status || "available"
  );
  const [assignedServer, setAssignedServer] = useState(
    initialValues?.assignedServer || ""
  );
  const [reservationTime, setReservationTime] = useState(
    initialValues?.reservationTime || ""
  );
  const [reservationName, setReservationName] = useState(
    initialValues?.reservationName || ""
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const tableData = {
      ...(initialValues && { id: initialValues.id }),
      name,
      capacity: Number.parseInt(capacity),
      status,
      ...(assignedServer && { assignedServer }),
      ...(reservationTime && { reservationTime }),
      ...(reservationName && { reservationName }),
    };

    onSubmit(tableData as Table);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Table Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Table 1"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="capacity">Capacity</Label>
        <Input
          id="capacity"
          type="number"
          min="1"
          value={capacity}
          onChange={(e) => setCapacity(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Select
          value={status}
          onValueChange={(value) => setStatus(value as Table["status"])}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="available">Available</SelectItem>
            <SelectItem value="occupied">Occupied</SelectItem>
            <SelectItem value="reserved">Reserved</SelectItem>
            <SelectItem value="cleaning">Cleaning</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {status === "occupied" && (
        <div className="space-y-2">
          <Label htmlFor="server">Assigned Server</Label>
          <Select value={assignedServer} onValueChange={setAssignedServer}>
            <SelectTrigger>
              <SelectValue placeholder="Select server" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Unassigned</SelectItem>
              {servers.map((server) => (
                <SelectItem key={server.id} value={server.id}>
                  {server.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {status === "reserved" && (
        <>
          <div className="space-y-2">
            <Label htmlFor="reservationTime">Reservation Time</Label>
            <Input
              id="reservationTime"
              type="datetime-local"
              value={
                reservationTime
                  ? new Date(reservationTime).toISOString().slice(0, 16)
                  : ""
              }
              onChange={(e) =>
                setReservationTime(
                  e.target.value ? new Date(e.target.value).toISOString() : ""
                )
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reservationName">Reservation Name</Label>
            <Input
              id="reservationName"
              value={reservationName}
              onChange={(e) => setReservationName(e.target.value)}
              placeholder="e.g., Smith Family"
            />
          </div>
        </>
      )}

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {initialValues ? "Update Table" : "Add Table"}
        </Button>
      </div>
    </form>
  );
}

function ServerAssignmentForm({
  currentServerId,
  servers,
  onAssign,
}: {
  currentServerId?: string;
  servers: Server[];
  onAssign: (serverId: string) => void;
}) {
  const [serverId, setServerId] = useState(currentServerId || "");

  return (
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="server">Select Server</Label>
        <Select value={serverId} onValueChange={setServerId}>
          <SelectTrigger>
            <SelectValue placeholder="Select a server" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="unassigned">Unassigned</SelectItem>
            {servers.map((server) => (
              <SelectItem key={server.id} value={server.id}>
                {server.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end">
        <Button onClick={() => onAssign(serverId)}>Assign Server</Button>
      </div>
    </div>
  );
}
