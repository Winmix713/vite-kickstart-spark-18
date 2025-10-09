import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface FilterBarProps {
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const FilterBar = ({
  categories,
  selectedCategory,
  onCategoryChange,
  searchQuery,
  onSearchChange,
}: FilterBarProps) => {
  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search components..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 glass-card border-white/10"
        />
      </div>

      {/* Categories */}
      <div className="flex flex-wrap gap-3">
        <Badge
          variant={selectedCategory === "all" ? "default" : "outline"}
          className={`cursor-pointer transition-all ${
            selectedCategory === "all"
              ? "bg-primary text-primary-foreground"
              : "hover:bg-primary/10"
          }`}
          onClick={() => onCategoryChange("all")}
        >
          All
        </Badge>
        {categories.map((category) => (
          <Badge
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            className={`cursor-pointer transition-all ${
              selectedCategory === category
                ? "bg-primary text-primary-foreground"
                : "hover:bg-primary/10"
            }`}
            onClick={() => onCategoryChange(category)}
          >
            {category}
          </Badge>
        ))}
      </div>
    </div>
  );
};
