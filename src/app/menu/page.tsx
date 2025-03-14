"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Edit, Trash2, Search } from "lucide-react";
import AddMenuItemForm from "./add-menu-item-form";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";

interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  description: string;
}

export default function MenuPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const response = await fetch("/api/menu");
        const data = await response.json();
        setMenuItems(data);

        // Extract unique categories
        const uniqueCategories = Array.from(
          new Set(data.map((item: MenuItem) => item.category)),
        );
        setCategories(uniqueCategories as string[]);
      } catch (error) {
        console.error("Failed to fetch menu items:", error);
      }
    };

    fetchMenuItems();
  }, []);

  const saveMenuItems = async (items: MenuItem[]) => {
    try {
      // Update the local state
      setMenuItems(items);

      // Extract unique categories
      const uniqueCategories = Array.from(
        new Set(items.map((item) => item.category)),
      );
      setCategories(uniqueCategories as string[]);

      // Make API calls to update the database
      for (const item of items) {
        if (item.id) {
          // Update existing item
          await fetch(`/api/menu/${item.id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(item),
          });
        } else {
          // Create new item
          await fetch("/api/menu", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(item),
          });
        }
      }
    } catch (error) {
      console.error("Failed to save menu items:", error);
      toast({
        title: "Error",
        description: "Failed to save menu items to the database.",
        variant: "destructive",
      });
    }
  };

  const handleAddItem = async (newItem: Omit<MenuItem, "id">) => {
    const item = {
      ...newItem,
      id: Date.now().toString(),
    };

    const updatedItems = [...menuItems, item];
    setMenuItems(updatedItems);

    // Make an API call to add the new item to the database
    try {
      await fetch("/api/menu", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(item),
      });

      toast({
        title: "Item Added",
        description: `${newItem.name} has been added to the menu.`,
      });
    } catch (error) {
      console.error("Failed to save menu item:", error);
      toast({
        title: "Error",
        description: "Failed to save menu item to the database.",
        variant: "destructive",
      });
    }

    setShowAddForm(false);
  };

  const handleUpdateItem = (updatedItem: MenuItem | Omit<MenuItem, "id">) => {
    // If it's a new item without an ID, we shouldn't reach this code path
    if (!("id" in updatedItem)) {
      console.error("Attempted to update an item without an ID");
      return;
    }

    const updatedItems = menuItems.map((item) =>
      item.id === updatedItem.id ? (updatedItem as MenuItem) : item,
    );

    saveMenuItems(updatedItems);
    setEditingItem(null);

    toast({
      title: "Item Updated",
      description: `${updatedItem.name} has been updated.`,
    });
  };

  const handleDeleteItem = (id: string) => {
    const itemToDelete = menuItems.find((item) => item.id === id);
    const updatedItems = menuItems.filter((item) => item.id !== id);
    saveMenuItems(updatedItems);

    toast({
      title: "Item Deleted",
      description: itemToDelete
        ? `${itemToDelete.name} has been removed from the menu.`
        : "Item has been removed.",
    });
  };

  const filteredItems = menuItems.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="container mx-auto py-10">
      <div className="mb-6 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold">Menu Management</h1>
          <p className="mt-1 text-muted-foreground">
            Add, edit, and organize your menu items
          </p>
        </div>
        <Button onClick={() => setShowAddForm(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Menu Item
        </Button>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
          <Input
            className="pl-10"
            placeholder="Search menu items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {showAddForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Add New Menu Item</CardTitle>
          </CardHeader>
          <CardContent>
            <AddMenuItemForm
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
            <CardTitle>Edit Menu Item</CardTitle>
          </CardHeader>
          <CardContent>
            <AddMenuItemForm
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
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredItems.map((item) => (
              <MenuItemCard
                key={item.id}
                item={item}
                onEdit={() => setEditingItem(item)}
                onDelete={() => handleDeleteItem(item.id)}
              />
            ))}
          </div>
        </TabsContent>

        {categories.map((category) => (
          <TabsContent key={category} value={category}>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredItems
                .filter((item) => item.category === category)
                .map((item) => (
                  <MenuItemCard
                    key={item.id}
                    item={item}
                    onEdit={() => setEditingItem(item)}
                    onDelete={() => handleDeleteItem(item.id)}
                  />
                ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

function MenuItemCard({
  item,
  onEdit,
  onDelete,
}: {
  item: MenuItem;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-md">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-bold">{item.name}</h3>
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
              {item.description}
            </p>
            <div className="mt-2 flex items-center gap-2">
              <span className="text-lg font-medium">
                ${item.price.toFixed(2)}
              </span>
              <span className="rounded-full bg-primary/10 px-2 py-1 text-xs text-primary">
                {item.category}
              </span>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={onEdit}
              className="h-8 w-8"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onDelete}
              className="h-8 w-8"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
