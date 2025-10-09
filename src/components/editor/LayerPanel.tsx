import { useEffect, useReducer, useMemo, useCallback, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";
import { useEditor } from "@/contexts/EditorContext";
import { LayerRow } from "./LayerRow";

interface LayerItem {
  id: string;
  name: string;
  type: string;
  selector: string;
  children: LayerItem[];
  visible: boolean;
  expanded: boolean;
}

interface LayerPanelProps {
  previewRef: React.RefObject<HTMLDivElement>;
}

type LayerAction =
  | { type: 'SET_LAYERS'; payload: LayerItem[] }
  | { type: 'TOGGLE_VISIBILITY'; payload: string }
  | { type: 'TOGGLE_EXPANDED'; payload: string };

const updateLayerById = (
  layers: LayerItem[],
  id: string,
  updater: (layer: LayerItem) => Partial<LayerItem>
): LayerItem[] => {
  return layers.map((layer) => {
    if (layer.id === id) {
      return { ...layer, ...updater(layer) };
    }
    if (layer.children.length > 0) {
      return { ...layer, children: updateLayerById(layer.children, id, updater) };
    }
    return layer;
  });
};

const layerReducer = (state: LayerItem[], action: LayerAction): LayerItem[] => {
  switch (action.type) {
    case 'SET_LAYERS':
      return action.payload;
    case 'TOGGLE_VISIBILITY':
      return updateLayerById(state, action.payload, (layer) => ({ visible: !layer.visible }));
    case 'TOGGLE_EXPANDED':
      return updateLayerById(state, action.payload, (layer) => ({ expanded: !layer.expanded }));
    default:
      return state;
  }
};

// WeakMap cache for selector queries
const selectorCache = new WeakMap<HTMLElement, Map<string, HTMLElement>>();

export const LayerPanel = ({ previewRef }: LayerPanelProps) => {
  const { state, setSelectedElement } = useEditor();
  const [layers, dispatch] = useReducer(layerReducer, []);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");

  useEffect(() => {
    // Parse HTML and create layer tree with selectors
    const parser = new DOMParser();
    const doc = parser.parseFromString(state.htmlCode, "text/html");
    
    const buildLayerTree = (element: Element, parentSelector = "", childIndex = 0): LayerItem[] => {
      const items: LayerItem[] = [];
      
      Array.from(element.children).forEach((child, index) => {
        const tagName = String(child.tagName).toLowerCase();
        const classAttr = child.getAttribute('class');
        const idAttr = child.getAttribute('id');
        
        // Build a unique selector for this element
        let selector = parentSelector;
        if (idAttr) {
          selector += `#${String(idAttr)}`;
        } else if (classAttr) {
          const firstClass = String(classAttr).split(" ")[0];
          selector += ` ${tagName}.${firstClass}:nth-of-type(${index + 1})`;
        } else {
          selector += ` ${tagName}:nth-of-type(${index + 1})`;
        }
        
        const className = classAttr ? `.${String(classAttr).split(" ")[0]}` : "";
        const displayName = idAttr ? `${tagName}#${String(idAttr)}` : `${tagName}${className}`;
        
        const layer: LayerItem = {
          id: `${parentSelector}-${index}`,
          name: displayName,
          type: tagName,
          selector: selector.trim(),
          children: buildLayerTree(child, selector, index),
          visible: true,
          expanded: false,
        };
        
        items.push(layer);
      });
      
      return items;
    };
    
    const rootLayers = buildLayerTree(doc.body, "");
    dispatch({ type: 'SET_LAYERS', payload: rootLayers });
    
    // Clear cache when HTML changes
    if (previewRef.current) {
      selectorCache.delete(previewRef.current);
    }
  }, [state.htmlCode, previewRef]);

  const handleLayerClick = useCallback((layer: LayerItem) => {
    if (!previewRef.current) return;
    
    // Use WeakMap cache for selector queries
    let cache = selectorCache.get(previewRef.current);
    if (!cache) {
      cache = new Map();
      selectorCache.set(previewRef.current, cache);
    }
    
    let element = cache.get(layer.selector);
    if (!element) {
      try {
        element = previewRef.current.querySelector(layer.selector) as HTMLElement;
        if (element) {
          cache.set(layer.selector, element);
        }
      } catch (e) {
        console.error("Failed to select element:", e);
        return;
      }
    }
    
    if (element) {
      setSelectedElement(element);
    }
  }, [previewRef, setSelectedElement]);

  const toggleVisibility = useCallback((id: string) => {
    dispatch({ type: 'TOGGLE_VISIBILITY', payload: id });
  }, []);

  const toggleExpanded = useCallback((id: string) => {
    dispatch({ type: 'TOGGLE_EXPANDED', payload: id });
  }, []);

  // Filter and search layers
  const filteredLayers = useMemo(() => {
    const filterLayer = (layer: LayerItem): LayerItem | null => {
      const matchesSearch = searchTerm === "" || 
        layer.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === "all" || layer.type === filterType;
      
      const filteredChildren = layer.children
        .map(child => filterLayer(child))
        .filter((child): child is LayerItem => child !== null);
      
      if (matchesSearch && matchesType) {
        return { ...layer, children: filteredChildren };
      }
      
      if (filteredChildren.length > 0) {
        return { ...layer, children: filteredChildren, expanded: true };
      }
      
      return null;
    };
    
    return layers
      .map(layer => filterLayer(layer))
      .filter((layer): layer is LayerItem => layer !== null);
  }, [layers, searchTerm, filterType]);

  // Get unique tag types for filter
  const tagTypes = useMemo(() => {
    const types = new Set<string>();
    const collectTypes = (items: LayerItem[]) => {
      items.forEach(item => {
        types.add(item.type);
        if (item.children.length > 0) {
          collectTypes(item.children);
        }
      });
    };
    collectTypes(layers);
    return Array.from(types).sort();
  }, [layers]);

  const renderLayers = useCallback((items: LayerItem[], depth = 0): JSX.Element[] => {
    return items.map((layer) => (
      <LayerRow
        key={layer.id}
        layer={layer}
        depth={depth}
        onToggleVisibility={toggleVisibility}
        onToggleExpanded={toggleExpanded}
        onLayerClick={handleLayerClick}
        renderChildren={renderLayers}
      />
    ));
  }, [toggleVisibility, toggleExpanded, handleLayerClick]);

  return (
    <div className="w-64 border-r bg-card flex flex-col">
      <div className="p-4 border-b space-y-3">
        <h2 className="font-semibold">Layers</h2>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search layers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 h-9"
          />
        </div>
        
        {/* Filter by type */}
        {tagTypes.length > 0 && (
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              {tagTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {filteredLayers.length > 0 ? (
            renderLayers(filteredLayers)
          ) : (
            <div className="text-sm text-muted-foreground text-center py-8">
              {searchTerm || filterType !== "all" ? "No matching layers" : "No layers found"}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
