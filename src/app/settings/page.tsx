"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "next-themes";

interface RestaurantSettings {
  name: string;
  address: string;
  phone: string;
  taxRate: number;
  enableTips: boolean;
  defaultTipPercentages: number[];
}

interface AppSettings {
  darkMode: boolean;
  compactMode: boolean;
  receiptFooter: string;
}

export default function SettingsPage() {
  const [restaurantSettings, setRestaurantSettings] =
    useState<RestaurantSettings>({
      name: "My Restaurant",
      address: "123 Main St, City, State",
      phone: "(555) 123-4567",
      taxRate: 8.5,
      enableTips: true,
      defaultTipPercentages: [15, 18, 20],
    });

  const [appSettings, setAppSettings] = useState<AppSettings>({
    darkMode: false,
    compactMode: false,
    receiptFooter: "Thank you for your business!",
  });

  const { toast } = useToast();
  const { resolvedTheme, setTheme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await fetch("/api/settings");
        if (!response.ok) {
          throw new Error("Failed to load settings");
        }
        const data = await response.json();

        if (data.restaurantSettings) {
          setRestaurantSettings(data.restaurantSettings);
        }
        if (data.appSettings) {
          setAppSettings(data.appSettings);
          if (data.appSettings.darkMode) {
            setTheme("dark");
          } else {
            setTheme("light");
          }
        }
      } catch (error) {
        console.error("Error loading settings:", error);
        toast({
          title: "Error",
          description: "Failed to load settings",
          variant: "destructive",
        });
      }
    };

    loadSettings();
  }, []);

  useEffect(() => {
    // Update appSettings.darkMode when theme changes
    setAppSettings((prev) => ({
      ...prev,
      darkMode: resolvedTheme === "dark",
    }));
  }, [resolvedTheme]);

  const saveRestaurantSettings = async () => {
    setIsLoading(true);
    try {
      // First get current settings
      const currentSettingsResponse = await fetch("/api/settings");
      const currentSettings = await currentSettingsResponse.json();

      const response = await fetch("/api/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          restaurantSettings,
          appSettings: currentSettings.appSettings || appSettings,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save settings");
      }

      toast({
        title: "Settings Saved",
        description: "Restaurant settings have been updated.",
      });
    } catch (error) {
      console.error("Error saving restaurant settings:", error);
      toast({
        title: "Error",
        description: "Failed to save restaurant settings",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveAppSettings = async () => {
    setIsLoading(true);
    try {
      // First get current settings
      const currentSettingsResponse = await fetch("/api/settings");
      const currentSettings = await currentSettingsResponse.json();

      const response = await fetch("/api/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          appSettings,
          restaurantSettings:
            currentSettings.restaurantSettings || restaurantSettings,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save settings");
      }

      // Apply dark mode if enabled
      if (appSettings.darkMode) {
        setTheme("dark");
      } else {
        setTheme("light");
      }

      toast({
        title: "Settings Saved",
        description: "Application settings have been updated.",
      });
    } catch (error) {
      console.error("Error saving app settings:", error);
      toast({
        title: "Error",
        description: "Failed to save application settings",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestaurantChange = (
    field: keyof RestaurantSettings,
    value: string | number | boolean,
  ) => {
    setRestaurantSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAppChange = (
    field: keyof AppSettings,
    value: string | number | boolean,
  ) => {
    setAppSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleTipPercentageChange = (index: number, value: string) => {
    const newPercentages = [...restaurantSettings.defaultTipPercentages];
    newPercentages[index] = Number.parseInt(value) || 0;
    handleRestaurantChange("defaultTipPercentages", newPercentages as any);
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="mb-6 text-3xl font-bold">Settings</h1>

      <Tabs defaultValue="restaurant">
        <TabsList className="mb-6">
          <TabsTrigger value="restaurant">Restaurant</TabsTrigger>
          <TabsTrigger value="application">Application</TabsTrigger>
          <TabsTrigger value="data">Data Management</TabsTrigger>
        </TabsList>

        <TabsContent value="restaurant">
          <Card>
            <CardHeader>
              <CardTitle>Restaurant Information</CardTitle>
              <CardDescription>
                Configure your restaurant details that will appear on receipts
                and orders.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="restaurant-name">Restaurant Name</Label>
                <Input
                  id="restaurant-name"
                  value={restaurantSettings.name}
                  onChange={(e) =>
                    handleRestaurantChange("name", e.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={restaurantSettings.address}
                  onChange={(e) =>
                    handleRestaurantChange("address", e.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={restaurantSettings.phone}
                  onChange={(e) =>
                    handleRestaurantChange("phone", e.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tax-rate">Tax Rate (%)</Label>
                <Input
                  id="tax-rate"
                  type="number"
                  step="0.1"
                  value={restaurantSettings.taxRate}
                  onChange={(e) =>
                    handleRestaurantChange(
                      "taxRate",
                      Number.parseFloat(e.target.value) || 0,
                    )
                  }
                />
              </div>

              <div className="space-y-4 pt-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="enable-tips">Enable Tips</Label>
                  <Switch
                    id="enable-tips"
                    checked={restaurantSettings.enableTips}
                    onCheckedChange={(checked: boolean) =>
                      handleRestaurantChange("enableTips", checked)
                    }
                  />
                </div>

                {restaurantSettings.enableTips && (
                  <div className="space-y-2">
                    <Label>Default Tip Percentages</Label>
                    <div className="flex gap-4">
                      {restaurantSettings.defaultTipPercentages.map(
                        (percentage, index) => (
                          <div key={index} className="w-20">
                            <Input
                              type="number"
                              value={percentage}
                              onChange={(e) =>
                                handleTipPercentageChange(index, e.target.value)
                              }
                            />
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                )}
              </div>

              <Button
                onClick={saveRestaurantSettings}
                className="mt-6"
                disabled={isLoading}
              >
                {isLoading ? "Saving..." : "Save Restaurant Settings"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="application">
          <Card>
            <CardHeader>
              <CardTitle>Application Settings</CardTitle>
              <CardDescription>
                Customize the appearance and behavior of the POS system.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="dark-mode">Dark Mode</Label>
                <Switch
                  id="dark-mode"
                  checked={appSettings.darkMode}
                  onCheckedChange={(checked: boolean) =>
                    handleAppChange("darkMode", checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="compact-mode">Compact Mode</Label>
                <Switch
                  id="compact-mode"
                  checked={appSettings.compactMode}
                  onCheckedChange={(checked: boolean) =>
                    handleAppChange("compactMode", checked)
                  }
                />
              </div>

              <div className="space-y-2 pt-4">
                <Label htmlFor="receipt-footer">Receipt Footer Text</Label>
                <Input
                  id="receipt-footer"
                  value={appSettings.receiptFooter}
                  onChange={(e) =>
                    handleAppChange("receiptFooter", e.target.value)
                  }
                />
              </div>

              <Button
                onClick={saveAppSettings}
                className="mt-6"
                disabled={isLoading}
              >
                {isLoading ? "Saving..." : "Save Application Settings"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data">
          <Card>
            <CardHeader>
              <CardTitle>Data Management</CardTitle>
              <CardDescription>
                Manage your POS data, including backup and reset options.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="mb-2 text-lg font-medium">Export Data</h3>
                <p className="mb-4 text-sm text-muted-foreground">
                  Export all your POS data for backup or migration purposes.
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    const data = {
                      menuItems: localStorage.getItem("menuItems"),
                      orders: localStorage.getItem("orders"),
                      restaurantSettings:
                        localStorage.getItem("restaurantSettings"),
                      appSettings: localStorage.getItem("appSettings"),
                    };

                    const blob = new Blob([JSON.stringify(data, null, 2)], {
                      type: "application/json",
                    });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `restaurant-pos-backup-${
                      new Date().toISOString().split("T")[0]
                    }.json`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);

                    toast({
                      title: "Data Exported",
                      description:
                        "Your POS data has been exported successfully.",
                    });
                  }}
                >
                  Export All Data
                </Button>
              </div>

              <div>
                <h3 className="mb-2 text-lg font-medium">Reset Data</h3>
                <p className="mb-4 text-sm text-muted-foreground">
                  Warning: This will permanently delete all your POS data from
                  browser storage.
                </p>
                <Button
                  variant="destructive"
                  onClick={() => {
                    if (
                      confirm(
                        "Are you sure you want to reset all local data? This action cannot be undone.",
                      )
                    ) {
                      localStorage.removeItem("menuItems");
                      localStorage.removeItem("orders");
                      localStorage.removeItem("restaurantSettings");
                      localStorage.removeItem("appSettings");

                      toast({
                        title: "Data Reset",
                        description:
                          "All local POS data has been reset. Refreshing page...",
                        variant: "destructive",
                      });

                      setTimeout(() => {
                        window.location.reload();
                      }, 2000);
                    }
                  }}
                >
                  Reset Local Data
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
