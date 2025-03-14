"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function DatabaseMigration() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleMigrateData = async () => {
    try {
      setIsLoading(true);

      // Collect all data from localStorage
      const data = {
        menuItems: JSON.parse(localStorage.getItem("menuItems") || "[]"),
        orders: JSON.parse(localStorage.getItem("orders") || "[]"),
        customers: JSON.parse(localStorage.getItem("customers") || "[]"),
        tables: JSON.parse(localStorage.getItem("tables") || "[]"),
        inventoryItems: JSON.parse(
          localStorage.getItem("inventoryItems") || "[]"
        ),
        invoices: JSON.parse(localStorage.getItem("invoices") || "[]"),
        restaurantSettings: JSON.parse(
          localStorage.getItem("restaurantSettings") || "null"
        ),
        appSettings: JSON.parse(localStorage.getItem("appSettings") || "null"),
      };

      // Send data to migration API
      const response = await fetch("/api/migrate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Migration Successful",
          description:
            "Your data has been successfully migrated to the database.",
        });
      } else {
        throw new Error(result.error || "Migration failed");
      }
    } catch (error) {
      console.error("Migration error:", error);
      toast({
        title: "Migration Failed",
        description:
          error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSeedDatabase = async () => {
    try {
      setIsLoading(true);

      const response = await fetch("/api/seed", {
        method: "POST",
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Database Seeded",
          description: "Sample data has been added to your database.",
        });
      } else {
        throw new Error(result.error || "Seeding failed");
      }
    } catch (error) {
      console.error("Seeding error:", error);
      toast({
        title: "Seeding Failed",
        description:
          error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Database Management</CardTitle>
        <CardDescription>
          Migrate your local data to the database or seed the database with
          sample data.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-2">Migrate Local Data</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Transfer all your current data from browser storage to the database.
          </p>
          <Button onClick={handleMigrateData} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Migrating...
              </>
            ) : (
              "Migrate to Database"
            )}
          </Button>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-2">Seed Database</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Add sample data to your database. Useful for testing or starting
            fresh.
          </p>
          <Button
            variant="outline"
            onClick={handleSeedDatabase}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Seeding...
              </>
            ) : (
              "Seed Database"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
