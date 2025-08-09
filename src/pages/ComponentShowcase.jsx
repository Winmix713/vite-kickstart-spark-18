import React, { useState, useMemo, Suspense } from "react";
import { Search, Grid, List, Home, AlertCircle, Loader } from "lucide-react";
import { Link } from "react-router-dom";

// Dinamikus komponens importálás
const loadComponents = async () => {
  try {
    // Vite glob import - runtime-ban betölti a komponenseket
    const componentModules = import.meta.glob([
      "/src/components/**/*.jsx",
      "/src/components/**/*.tsx", 
      "/src/widgets/**/*.jsx",
      "/src/widgets/**/*.tsx"
    ]);

    const loadedComponents = await Promise.allSettled(
      Object.entries(componentModules).map(async ([path, moduleLoader]) => {
        try {
          const module = await moduleLoader();
          const fileName = path.split("/").pop()?.replace(/\.(jsx|tsx)$/, "") || "Unknown";
          
          return {
            id: path,
            name: fileName,
            path: path,
            Component: module.default || module[fileName],
            category: path.includes('/widgets/') ? 'Widget' : 'Component'
          };
        } catch (error) {
          console.warn(`Failed to load component from ${path}:`, error);
          return null;
        }
      })
    );

    return loadedComponents
      .filter(result => result.status === 'fulfilled' && result.value && result.value.Component)
      .map(result => result.value);
  } catch (error) {
    console.error("Error loading components:", error);
    return [];
  }
};

// Hibakezelő komponens wrapper
const ComponentWrapper = ({ Component, name }) => {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div className="flex items-center justify-center p-8 text-red-500 bg-red-50 rounded-lg border border-red-200">
        <AlertCircle className="w-5 h-5 mr-2" />
        <span>Hiba történt a {name} komponens betöltésekor</span>
      </div>
    );
  }

  try {
    return (
      <Suspense fallback={
        <div className="flex items-center justify-center p-8">
          <Loader className="w-5 h-5 animate-spin mr-2" />
          <span>Betöltés...</span>
        </div>
      }>
        <Component />
      </Suspense>
    );
  } catch (error) {
    console.error(`Error rendering ${name}:`, error);
    setHasError(true);
    return null;
  }
};

export default function ComponentShowcase() {
  const [components, setComponents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [viewMode, setViewMode] = useState("grid");

  // Komponensek betöltése
  React.useEffect(() => {
    const loadComponentsList = async () => {
      setLoading(true);
      try {
        const loadedComponents = await loadComponents();
        setComponents(loadedComponents);
      } catch (error) {
        console.error("Failed to load components:", error);
      } finally {
        setLoading(false);
      }
    };

    loadComponentsList();
  }, []);

  // Szűrt komponensek
  const filteredComponents = useMemo(() => {
    return components.filter(component => {
      const matchesSearch = component.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           component.path.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "all" || 
                             component.category.toLowerCase() === selectedCategory.toLowerCase();
      
      return matchesSearch && matchesCategory;
    });
  }, [components, searchTerm, selectedCategory]);

  const categories = ["all", ...new Set(components.map(c => c.category))];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
          <p className="text-gray-600">Komponensek betöltése...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link to="/" className="flex items-center text-gray-600 hover:text-gray-900">
                <Home className="w-5 h-5 mr-2" />
                <span>Főoldal</span>
              </Link>
              <div className="text-gray-300">|</div>
              <h1 className="text-xl font-semibold text-gray-900">
                📦 Component Showcase
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                {filteredComponents.length} / {components.length} komponens
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Toolbar */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
            {/* Keresés */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Keresés komponensek között..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-center space-x-4">
              {/* Kategória szűrő */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === "all" ? "Minden kategória" : category}
                  </option>
                ))}
              </select>

              {/* Nézet váltó */}
              <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`px-3 py-2 text-sm ${viewMode === "grid" 
                    ? "bg-blue-500 text-white" 
                    : "bg-white text-gray-700 hover:bg-gray-50"}`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`px-3 py-2 text-sm ${viewMode === "list" 
                    ? "bg-blue-500 text-white" 
                    : "bg-white text-gray-700 hover:bg-gray-50"}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredComponents.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="w-12 h-12 mx-auto" />
            </div>
            <p className="text-gray-600 text-lg">
              {searchTerm || selectedCategory !== "all" 
                ? "Nincs megfelelő komponens a szűrési feltételeknek."
                : "Nincsenek betöltött komponensek."}
            </p>
            {(searchTerm || selectedCategory !== "all") && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("all");
                }}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Szűrők törlése
              </button>
            )}
          </div>
        ) : (
          <div className={
            viewMode === "grid" 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              : "space-y-4"
          }>
            {filteredComponents.map((component) => (
              <div
                key={component.id}
                className={`bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow ${
                  viewMode === "list" ? "flex" : ""
                }`}
              >
                {/* Header */}
                <div className={`p-4 border-b border-gray-100 ${
                  viewMode === "list" ? "w-1/3 border-r border-b-0" : ""
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {component.name}
                    </h3>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {component.category}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 truncate" title={component.path}>
                    {component.path}
                  </p>
                </div>

                {/* Component preview */}
                <div className={`p-4 ${viewMode === "list" ? "flex-1" : ""}`}>
                  <div className="bg-gray-50 rounded-lg p-4 min-h-[120px] flex items-center justify-center">
                    <ComponentWrapper 
                      Component={component.Component} 
                      name={component.name}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
