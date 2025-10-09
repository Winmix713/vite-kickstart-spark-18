import { useState, useEffect } from "react";
import { ComponentCard } from "../components/ComponentCard";
import { FilterBar } from "../components/FilterBar";
import { Header } from "../components/Header";
import { supabase } from "@/integrations/supabase/client";
import { mockComponents } from "@/data/mockComponents";

interface Component {
  id: string;
  title: string;
  description: string | null;
  code_html: string | null;
  technology: string;
  tags: string[];
  likes_count: number;
}

const Index = () => {
  const [components, setComponents] = useState<Component[]>([]);
  const [filteredComponents, setFilteredComponents] = useState<Component[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchComponents = async () => {
      const { data } = await (supabase as any)
        .from('components')
        .select('*')
        .order('created_at', { ascending: false });

      if (data && data.length > 0) {
        setComponents(data);
        setFilteredComponents(data);
      } else {
        // Ha nincs adat az adatbázisban, használjuk a mock adatokat
        const mockData = mockComponents.map(mock => ({
          id: mock.id,
          title: mock.title,
          description: mock.description,
          code_html: mock.code,
          technology: mock.tags[0].toLowerCase(),
          tags: mock.tags.map(t => t.toLowerCase()),
          likes_count: mock.likes
        }));
        setComponents(mockData);
        setFilteredComponents(mockData);
      }
      setLoading(false);
    };

    fetchComponents();
  }, []);

  useEffect(() => {
    let filtered = components;

    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (comp) =>
          comp.technology === selectedCategory ||
          comp.tags.includes(selectedCategory)
      );
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (comp) =>
          comp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          comp.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          comp.tags.some((tag) =>
            tag.toLowerCase().includes(searchQuery.toLowerCase())
          )
      );
    }

    setFilteredComponents(filtered);
  }, [selectedCategory, searchQuery, components]);

  const categories = Array.from(
    new Set(components.flatMap((comp) => [comp.technology, ...comp.tags]))
  );

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/95">
        {/* Hero Section */}
        <div className="container mx-auto px-4 py-12">
          <div className="text-center mb-12 animate-fade-in">
            <div className="inline-block mb-4">
              <span className="floating-badge px-6 py-2 rounded-full text-sm font-medium">
                ✨ Discover Beautiful UI Components
              </span>
            </div>
            <h1 className="text-gradient text-6xl font-bold mb-6">
              ComponentHub
            </h1>
            <p className="text-muted-foreground text-xl max-w-2xl mx-auto">
              A community UI component collection where developers share their
              creations
            </p>
          </div>

          <FilterBar
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />

          {/* Components Grid */}
          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading components...</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
                {filteredComponents.map((component) => (
                  <ComponentCard key={component.id} {...component} />
                ))}
              </div>

              {filteredComponents.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground text-lg">
                    {components.length === 0
                      ? "No components uploaded yet. Be the first to upload!"
                      : "No components found matching your search"}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Index;
