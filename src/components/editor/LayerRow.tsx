import { memo } from "react";
import { ChevronRight, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LayerItem {
  id: string;
  name: string;
  type: string;
  selector: string;
  children: LayerItem[];
  visible: boolean;
  expanded: boolean;
}

interface LayerRowProps {
  layer: LayerItem;
  depth: number;
  onToggleVisibility: (id: string) => void;
  onToggleExpanded: (id: string) => void;
  onLayerClick: (layer: LayerItem) => void;
  renderChildren: (items: LayerItem[], depth: number) => JSX.Element[];
}

export const LayerRow = memo<LayerRowProps>(({ 
  layer, 
  depth, 
  onToggleVisibility, 
  onToggleExpanded, 
  onLayerClick,
  renderChildren 
}) => {
  return (
    <div>
      <div
        className="flex items-center gap-1 p-2 hover:bg-accent rounded-md cursor-pointer transition-colors"
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
      >
        {layer.children.length > 0 && (
          <Button
            variant="ghost"
            size="icon"
            className="h-4 w-4 p-0"
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpanded(layer.id);
            }}
          >
            <ChevronRight
              className={`h-3 w-3 transition-transform ${
                layer.expanded ? "rotate-90" : ""
              }`}
            />
          </Button>
        )}
        
        <Button
          variant="ghost"
          size="icon"
          className="h-4 w-4 p-0"
          onClick={(e) => {
            e.stopPropagation();
            onToggleVisibility(layer.id);
          }}
        >
          {layer.visible ? (
            <Eye className="h-3 w-3" />
          ) : (
            <EyeOff className="h-3 w-3 opacity-50" />
          )}
        </Button>
        
        <span
          className="flex-1 text-sm truncate"
          onClick={() => onLayerClick(layer)}
        >
          {layer.name}
        </span>
      </div>
      
      {layer.expanded && layer.children.length > 0 && (
        <div>{renderChildren(layer.children, depth + 1)}</div>
      )}
    </div>
  );
});

LayerRow.displayName = "LayerRow";
