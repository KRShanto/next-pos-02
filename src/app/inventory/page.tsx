"use client";

import { SelectItem } from "@/components/ui/select";

import { SelectContent } from "@/components/ui/select";

import { SelectValue } from "@/components/ui/select";

import { SelectTrigger } from "@/components/ui/select";

import { Select } from "@/components/ui/select";

import type React from "react";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Search, Edit, Trash2, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  minQuantity: number;
  cost: number;
  supplier: string;
  lastRestocked: string;
}

export default function InventoryPage() {
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Load inventory items from localStorage
    const storedItems = localStorage.getItem("inventoryItems");
    if (storedItems) {
      const items = JSON.parse(storedItems);
      setInventoryItems(items);

      // Extract unique categories
      const uniqueCategories = Array.from(
        new Set(items.map((item: InventoryItem) => item.category))
      );
      setCategories(uniqueCategories as string[]);
    } else {
      // Initialize with sample data if nothing exists
      const sampleItems: InventoryItem[] = [
        {
          id: "1",
          name: "Flour",
          category: "Baking",
          quantity: 25,
          unit: "kg",
          minQuantity: 10,
          cost: 1.5,
          supplier: "Wholesale Foods Inc.",
          lastRestocked: new Date(
            Date.now() - 15 * 24 * 60 * 60 * 1000
          ).toISOString(),
        },
        {
          id: "2",
          name: "Tomatoes",
          category: "Produce",
          quantity: 8,
          unit: "kg",
          minQuantity: 10,
          cost: 2.99,
          supplier: "Local Farms Co.",
          lastRestocked: new Date(
            Date.now() - 3 * 24 * 60 * 60 * 1000
          ).toISOString(),
        },
        {
          id: "3",
          name: "Mozzarella Cheese",
          category: "Dairy",
          quantity: 15,
          unit: "kg",
          minQuantity: 5,
          cost: 8.5,
          supplier: "Dairy Distributors",
          lastRestocked: new Date(
            Date.now() - 7 * 24 * 60 * 60 * 1000
          ).toISOString(),
        },
        {
          id: "4",
          name: "Olive Oil",
          category: "Oils",
          quantity: 12,
          unit: "liters",
          minQuantity: 5,
          cost: 12.99,
          supplier: "Mediterranean Imports",
          lastRestocked: new Date(
            Date.now() - 30 * 24 * 60 * 60 * 1000
          ).toISOString(),
        },
      ];

      setInventoryItems(sampleItems);
      setCategories(["Baking", "Produce", "Dairy", "Oils"]);
      localStorage.setItem("inventoryItems", JSON.stringify(sampleItems));
    }
  }, []);

  const saveInventoryItems = (items: InventoryItem[]) => {
    setInventoryItems(items);
    localStorage.setItem("inventoryItems", JSON.stringify(items));

    // Update categories
    const uniqueCategories = Array.from(
      new Set(items.map((item) => item.category))
    );
    setCategories(uniqueCategories as string[]);
  };

  const handleAddItem = (
    newItem: Omit<InventoryItem, "id" | "lastRestocked">
  ) => {
    const item = {
      ...newItem,
      id: Date.now().toString(),
      lastRestocked: new Date().toISOString(),
    };

    const updatedItems = [...inventoryItems, item];
    saveInventoryItems(updatedItems);

    setShowAddForm(false);
    toast({
      title: "Item Added",
      description: `${newItem.name} has been added to inventory.`,
    });
  };

  const handleUpdateItem = (updatedItem: InventoryItem) => {
    const updatedItems = inventoryItems.map((item) =>
      item.id === updatedItem.id ? updatedItem : item
    );

    saveInventoryItems(updatedItems);
    setEditingItem(null);

    toast({
      title: "Item Updated",
      description: `${updatedItem.name} has been updated.`,
    });
  };

  const handleDeleteItem = (id: string) => {
    const itemToDelete = inventoryItems.find((item) => item.id === id);
    const updatedItems = inventoryItems.filter((item) => item.id !== id);
    saveInventoryItems(updatedItems);

    toast({
      title: "Item Deleted",
      description: itemToDelete
        ? `${itemToDelete.name} has been removed from inventory.`
        : "Item has been removed.",
    });
  };

  const handleRestockItem = (id: string) => {
    const updatedItems = inventoryItems.map((item) => {
      if (item.id === id) {
        // For simplicity, we'll just set quantity to a higher value
        // In a real app, you'd have a form to input the new quantity
        return {
          ...item,
          quantity: item.minQuantity * 3,
          lastRestocked: new Date().toISOString(),
        };
      }
      return item;
    });

    saveInventoryItems(updatedItems);

    const itemName = inventoryItems.find((item) => item.id === id)?.name;
    toast({
      title: "Item Restocked",
      description: `${itemName} has been restocked.`,
    });
  };

  const filteredItems = inventoryItems.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.supplier.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getLowStockItems = () => {
    return inventoryItems.filter((item) => item.quantity <= item.minQuantity);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const getStockLevel = (item: InventoryItem) => {
    const ratio = item.quantity / item.minQuantity;
    if (ratio <= 1) return "low";
    if (ratio <= 2) return "medium";
    return "good";
  };

  const getStockLevelColor = (level: string) => {
    switch (level) {
      case "low":
        return "bg-red-500";
      case "medium":
        return "bg-yellow-500";
      case "good":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Inventory Management</h1>
        <Button onClick={() => setShowAddForm(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Inventory Item
        </Button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            className="pl-10"
            placeholder="Search inventory by name, category, or supplier..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {getLowStockItems().length > 0 && (
        <Card className="mb-6 border-red-500 border">
          <CardHeader>
            <CardTitle className="flex items-center text-red-500">
              <AlertTriangle className="mr-2 h-5 w-5" />
              Low Stock Alert
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {getLowStockItems().map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center"
                >
                  <div>
                    <span className="font-medium">{item.name}</span>
                    <span className="text-sm text-muted-foreground ml-2">
                      ({item.quantity} {item.unit} remaining, minimum:{" "}
                      {item.minQuantity} {item.unit})
                    </span>
                  </div>
                  <Button size="sm" onClick={() => handleRestockItem(item.id)}>
                    Restock
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {showAddForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Add New Inventory Item</CardTitle>
          </CardHeader>
          <CardContent>
            <InventoryItemForm
              onSubmit={handleAddItem}
              onCancel={() => setShowAddForm(false)}
              existingCategories={categories}
            />
          </CardContent>
        </Card>
      )}

      {editingItem && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Edit Inventory Item</CardTitle>
          </CardHeader>
          <CardContent>
            <InventoryItemForm
              onSubmit={handleUpdateItem}
              onCancel={() => setEditingItem(null)}
              existingCategories={categories}
              initialValues={editingItem}
            />
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue={categories[0] || "all"}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Items</TabsTrigger>
          {categories.map((category) => (
            <TabsTrigger key={category} value={category}>
              {category}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="all">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredItems.map((item) => (
              <InventoryItemCard
                key={item.id}
                item={item}
                onEdit={() => setEditingItem(item)}
                onDelete={() => handleDeleteItem(item.id)}
                onRestock={() => handleRestockItem(item.id)}
              />
            ))}
          </div>
        </TabsContent>

        {categories.map((category) => (
          <TabsContent key={category} value={category}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredItems
                .filter((item) => item.category === category)
                .map((item) => (
                  <InventoryItemCard
                    key={item.id}
                    item={item}
                    onEdit={() => setEditingItem(item)}
                    onDelete={() => handleDeleteItem(item.id)}
                    onRestock={() => handleRestockItem(item.id)}
                  />
                ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

function InventoryItemCard({
  item,
  onEdit,
  onDelete,
  onRestock,
}: {
  item: InventoryItem;
  onEdit: () => void;
  onDelete: () => void;
  onRestock: () => void;
}) {
  const stockLevel =
    item.quantity <= item.minQuantity
      ? "low"
      : item.quantity <= item.minQuantity * 2
      ? "medium"
      : "good";

  const stockLevelText =
    stockLevel === "low"
      ? "Low Stock"
      : stockLevel === "medium"
      ? "Medium Stock"
      : "Good Stock";

  const stockLevelColor =
    stockLevel === "low"
      ? "bg-red-500"
      : stockLevel === "medium"
      ? "bg-yellow-500"
      : "bg-green-500";

  const progressValue = Math.min(
    100,
    (item.quantity / (item.minQuantity * 3)) * 100
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-bold text-lg">{item.name}</h3>
            <div className="flex items-center mt-1">
              <Badge variant="outline" className="bg-primary/10 text-primary">
                {item.category}
              </Badge>
            </div>
          </div>
          <Badge className={stockLevelColor}>{stockLevelText}</Badge>
        </div>

        <div className="mt-4">
          <div className="flex justify-between text-sm mb-1">
            <span>Current Stock:</span>
            <span className="font-medium">
              {item.quantity} {item.unit}
            </span>
          </div>
          <Progress value={progressValue} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>
              Min: {item.minQuantity} {item.unit}
            </span>
            <span>
              Target: {item.minQuantity * 3} {item.unit}
            </span>
          </div>
        </div>

        <div className="mt-4 space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Cost per {item.unit}:</span>
            <span>${item.cost.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Supplier:</span>
            <span>{item.supplier}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Last Restocked:</span>
            <span>{formatDate(item.lastRestocked)}</span>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t flex justify-between">
          <div className="flex space-x-2">
            <Button variant="ghost" size="sm" onClick={onEdit}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
            <Button variant="ghost" size="sm" onClick={onDelete}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
          {stockLevel === "low" && (
            <Button size="sm" onClick={onRestock}>
              Restock
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface InventoryItemFormProps {
  onSubmit: (item: any) => void;
  onCancel: () => void;
  existingCategories: string[];
  initialValues?: InventoryItem;
}

function InventoryItemForm({
  onSubmit,
  onCancel,
  existingCategories,
  initialValues,
}: InventoryItemFormProps) {
  const [name, setName] = useState(initialValues?.name || "");
  const [category, setCategory] = useState(initialValues?.category || "");
  const [newCategory, setNewCategory] = useState("");
  const [quantity, setQuantity] = useState(
    initialValues?.quantity.toString() || "0"
  );
  const [unit, setUnit] = useState(initialValues?.unit || "kg");
  const [minQuantity, setMinQuantity] = useState(
    initialValues?.minQuantity.toString() || "0"
  );
  const [cost, setCost] = useState(initialValues?.cost.toString() || "0");
  const [supplier, setSupplier] = useState(initialValues?.supplier || "");
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const finalCategory = showNewCategoryInput ? newCategory : category;

    const inventoryItem = {
      ...(initialValues && {
        id: initialValues.id,
        lastRestocked: initialValues.lastRestocked,
      }),
      name,
      category: finalCategory,
      quantity: Number.parseInt(quantity),
      unit,
      minQuantity: Number.parseInt(minQuantity),
      cost: Number.parseFloat(cost),
      supplier,
    };

    onSubmit(inventoryItem);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Item Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter item name"
          required
        />
      </div>

      <div className="space-y-2">
        {!showNewCategoryInput ? (
          <>
            <Label htmlFor="category">Category</Label>
            <div className="flex gap-2">
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {existingCategories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowNewCategoryInput(true)}
              >
                New
              </Button>
            </div>
          </>
        ) : (
          <>
            <Label htmlFor="newCategory">New Category</Label>
            <div className="flex gap-2">
              <Input
                id="newCategory"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="Enter new category"
                required
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowNewCategoryInput(false)}
              >
                Cancel
              </Button>
            </div>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="quantity">Current Quantity</Label>
          <Input
            id="quantity"
            type="number"
            min="0"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="unit">Unit of Measurement</Label>
          <Select value={unit} onValueChange={setUnit}>
            <SelectTrigger>
              <SelectValue placeholder="Select unit" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="kg">Kilograms (kg)</SelectItem>
              <SelectItem value="g">Grams (g)</SelectItem>
              <SelectItem value="liters">Liters</SelectItem>
              <SelectItem value="ml">Milliliters (ml)</SelectItem>
              <SelectItem value="units">Units</SelectItem>
              <SelectItem value="boxes">Boxes</SelectItem>
              <SelectItem value="bottles">Bottles</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="minQuantity">Minimum Quantity</Label>
          <Input
            id="minQuantity"
            type="number"
            min="0"
            value={minQuantity}
            onChange={(e) => setMinQuantity(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="cost">Cost per {unit}</Label>
          <Input
            id="cost"
            type="number"
            step="0.01"
            min="0"
            value={cost}
            onChange={(e) => setCost(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="supplier">Supplier</Label>
        <Input
          id="supplier"
          value={supplier}
          onChange={(e) => setSupplier(e.target.value)}
          placeholder="Enter supplier name"
        />
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {initialValues ? "Update Item" : "Add Item"}
        </Button>
      </div>
    </form>
  );
}
