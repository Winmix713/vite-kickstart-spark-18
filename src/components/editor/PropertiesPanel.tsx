import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import tinycolor from "tinycolor2";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Star, Copy, RotateCcw } from "lucide-react";
import { useEditor } from "@/contexts/EditorContext";
import { PropertyGroup } from "./PropertyGroup";
import { PROPERTY_GROUPS, getRelevantGroups, getGroupValues } from "./propertyGroupsConfig";

const styleSchema = z.object({
  // Dinamikusan generált schema az összes property-ből
  ...Object.values(PROPERTY_GROUPS).reduce((acc, group) => {
    group.properties.forEach((prop) => {
      acc[prop.key] = z.string().optional();
    });
    return acc;
  }, {} as Record<string, z.ZodOptional<z.ZodString>>),
});

type StyleFormData = z.infer<typeof styleSchema>;

export const PropertiesPanel = () => {
  const { selectedElement, updateCode } = useEditor();
  const [searchTerm, setSearchTerm] = useState("");
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState("layout");

  const { register, setValue, watch, reset, formState: { errors } } = useForm<StyleFormData>({
    resolver: zodResolver(styleSchema),
  });

  const values = watch();

  // Inicializálás: form értékek beállítása a kiválasztott elem alapján
  useEffect(() => {
    if (!selectedElement) return;

    const allValues: Partial<StyleFormData> = {};
    
    Object.keys(PROPERTY_GROUPS).forEach((groupKey) => {
      const groupValues = getGroupValues(
        selectedElement, 
        groupKey as keyof typeof PROPERTY_GROUPS
      );
      Object.assign(allValues, groupValues);
    });

    reset(allValues);
  }, [selectedElement, reset]);

  // Stílus változtatás kezelése
  const handleStyleChange = (property: string, value: string) => {
    setValue(property as keyof StyleFormData, value);
    
    if (!selectedElement) return;

    // Speciális kezelés színekhez (alpha channel támogatással)
    if (property === "color" || property === "backgroundColor") {
      const color = tinycolor(value);
      if (color.isValid()) {
        (selectedElement.style as any)[property] = color.toRgbString();
      }
    } else {
      (selectedElement.style as any)[property] = value;
    }

    // TODO: updateCode meghívása a kód frissítéséhez
  };

  // Stílusok másolása
  const handleCopyStyles = () => {
    const stylesToCopy = Object.entries(values)
      .filter(([_, value]) => value && value !== "")
      .reduce((acc, [key, value]) => {
        acc[key] = value;
        return acc;
      }, {} as Record<string, string>);

    navigator.clipboard.writeText(JSON.stringify(stylesToCopy, null, 2));
  };

  // Stílusok beillesztése
  const handlePasteStyles = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const styles = JSON.parse(text);
      
      Object.entries(styles).forEach(([key, value]) => {
        handleStyleChange(key, value as string);
      });
    } catch (error) {
      console.error("Failed to paste styles:", error);
    }
  };

  // Alapértelmezett érték visszaállítása
  const handleReset = () => {
    if (!selectedElement) return;
    
    // Összes inline style eltávolítása
    selectedElement.removeAttribute("style");
    
    // Form reset
    const allValues: Partial<StyleFormData> = {};
    Object.keys(PROPERTY_GROUPS).forEach((groupKey) => {
      const groupValues = getGroupValues(
        selectedElement,
        groupKey as keyof typeof PROPERTY_GROUPS
      );
      Object.assign(allValues, groupValues);
    });
    reset(allValues);
  };

  // Kedvenc toggle
  const toggleFavorite = (groupKey: string) => {
    setFavorites((prev) => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(groupKey)) {
        newFavorites.delete(groupKey);
      } else {
        newFavorites.add(groupKey);
      }
      return newFavorites;
    });
  };

  // Releváns csoportok meghatározása a display property alapján
  const relevantGroupKeys = useMemo(() => {
    return getRelevantGroups(values.display);
  }, [values.display]);

  // Szűrt csoportok keresés alapján
  const filteredGroups = useMemo(() => {
    if (!searchTerm) return relevantGroupKeys;

    return relevantGroupKeys.filter((key) => {
      const group = PROPERTY_GROUPS[key as keyof typeof PROPERTY_GROUPS];
      const matchesTitle = group.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesProperty = group.properties.some((prop) =>
        prop.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prop.label?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      return matchesTitle || matchesProperty;
    });
  }, [relevantGroupKeys, searchTerm]);

  // Kedvenc csoportok
  const favoriteGroups = useMemo(() => {
    return Array.from(favorites).filter((key) =>
      relevantGroupKeys.includes(key)
    );
  }, [favorites, relevantGroupKeys]);

  if (!selectedElement) {
    return (
      <div className="w-80 border-l bg-card flex items-center justify-center text-muted-foreground">
        <p className="text-sm text-center px-4">
          Select an element to edit properties
        </p>
      </div>
    );
  }

  const elementTag = selectedElement.tagName.toLowerCase();
  const elementClass = selectedElement.className;

  return (
    <div className="w-80 border-l bg-card flex flex-col">
      {/* Header */}
      <div className="p-4 border-b space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Properties</h2>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={handleCopyStyles}
              title="Copy styles"
            >
              <Copy className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={handlePasteStyles}
              title="Paste styles"
            >
              <Copy className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={handleReset}
              title="Reset styles"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        <div className="p-2 bg-muted rounded text-xs">
          <div className="font-mono">&lt;{elementTag}&gt;</div>
          {elementClass && (
            <div className="text-muted-foreground mt-1">.{elementClass}</div>
          )}
        </div>

        {/* Keresés */}
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search properties..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-8 pl-8 text-xs"
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full grid grid-cols-3 rounded-none border-b">
            <TabsTrigger value="layout">Layout</TabsTrigger>
            <TabsTrigger value="style">Style</TabsTrigger>
            <TabsTrigger value="favorites">
              <Star className="h-3.5 w-3.5 mr-1" />
              Favorites
            </TabsTrigger>
          </TabsList>

          {/* Layout Tab */}
          <TabsContent value="layout" className="p-4 space-y-4">
            {["dimensions", "spacing", "layout", "flexbox", "grid", "overflow"].map(
              (groupKey) => {
                if (!filteredGroups.includes(groupKey)) return null;
                
                const group = PROPERTY_GROUPS[groupKey as keyof typeof PROPERTY_GROUPS];
                
                return (
                  <div key={groupKey}>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-semibold text-muted-foreground">
                        {group.title}
                      </h3>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5"
                        onClick={() => toggleFavorite(groupKey)}
                      >
                        <Star
                          className={`h-3 w-3 ${
                            favorites.has(groupKey)
                              ? "fill-yellow-500 text-yellow-500"
                              : ""
                          }`}
                        />
                      </Button>
                    </div>
                    <PropertyGroup
                      title=""
                      properties={group.properties}
                      register={register}
                      errors={errors}
                      values={values}
                      onChange={handleStyleChange}
                    />
                    <Separator className="mt-4" />
                  </div>
                );
              }
            )}
          </TabsContent>

          {/* Style Tab */}
          <TabsContent value="style" className="p-4 space-y-4">
            {["colors", "typography", "border", "background", "effects", "transform"].map(
              (groupKey) => {
                if (!filteredGroups.includes(groupKey)) return null;
                
                const group = PROPERTY_GROUPS[groupKey as keyof typeof PROPERTY_GROUPS];
                
                return (
                  <div key={groupKey}>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-semibold text-muted-foreground">
                        {group.title}
                      </h3>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5"
                        onClick={() => toggleFavorite(groupKey)}
                      >
                        <Star
                          className={`h-3 w-3 ${
                            favorites.has(groupKey)
                              ? "fill-yellow-500 text-yellow-500"
                              : ""
                          }`}
                        />
                      </Button>
                    </div>
                    <PropertyGroup
                      title=""
                      properties={group.properties}
                      register={register}
                      errors={errors}
                      values={values}
                      onChange={handleStyleChange}
                    />
                    <Separator className="mt-4" />
                  </div>
                );
              }
            )}
          </TabsContent>

          {/* Favorites Tab */}
          <TabsContent value="favorites" className="p-4 space-y-4">
            {favoriteGroups.length === 0 ? (
              <div className="text-center text-muted-foreground text-sm py-8">
                No favorite groups yet. Click the star icon to add favorites.
              </div>
            ) : (
              favoriteGroups.map((groupKey) => {
                const group = PROPERTY_GROUPS[groupKey as keyof typeof PROPERTY_GROUPS];
                
                return (
                  <div key={groupKey}>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-semibold text-muted-foreground">
                        {group.title}
                      </h3>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5"
                        onClick={() => toggleFavorite(groupKey)}
                      >
                        <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                      </Button>
                    </div>
                    <PropertyGroup
                      title=""
                      properties={group.properties}
                      register={register}
                      errors={errors}
                      values={values}
                      onChange={handleStyleChange}
                    />
                    <Separator className="mt-4" />
                  </div>
                );
              })
            )}
          </TabsContent>
        </Tabs>
      </ScrollArea>
    </div>
  );
};
