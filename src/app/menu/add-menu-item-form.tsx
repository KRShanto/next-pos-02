"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface MenuItem {
  id: string
  name: string
  price: number
  category: string
  description: string
}

interface AddMenuItemFormProps {
  onSubmit: (item: MenuItem | Omit<MenuItem, "id">) => void
  onCancel: () => void
  existingCategories: string[]
  initialValues?: MenuItem
}

export default function AddMenuItemForm({
  onSubmit,
  onCancel,
  existingCategories,
  initialValues,
}: AddMenuItemFormProps) {
  const [name, setName] = useState(initialValues?.name || "")
  const [price, setPrice] = useState(initialValues?.price.toString() || "")
  const [category, setCategory] = useState(initialValues?.category || "")
  const [newCategory, setNewCategory] = useState("")
  const [description, setDescription] = useState(initialValues?.description || "")
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const finalCategory = showNewCategoryInput ? newCategory : category

    const menuItem = {
      ...(initialValues && { id: initialValues.id }),
      name,
      price: Number.parseFloat(price),
      category: finalCategory,
      description,
    }

    onSubmit(menuItem)
  }

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
        <Label htmlFor="price">Price</Label>
        <Input
          id="price"
          type="number"
          step="0.01"
          min="0"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="0.00"
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
              <Button type="button" variant="outline" onClick={() => setShowNewCategoryInput(true)}>
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
              <Button type="button" variant="outline" onClick={() => setShowNewCategoryInput(false)}>
                Cancel
              </Button>
            </div>
          </>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter item description"
          rows={3}
        />
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">{initialValues ? "Update Item" : "Add Item"}</Button>
      </div>
    </form>
  )
}

