import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ArrowLeft, Save, Undo, Redo, ZoomIn, ZoomOut, HelpCircle } from "lucide-react";
import { useEditor } from "@/contexts/EditorContext";
import { ShortcutsHelp } from "./ShortcutsHelp";

interface EditorToolbarProps {
  onSave: () => void;
  onBack: () => void;
  componentTitle: string;
  showShortcuts: boolean;
  setShowShortcuts: (show: boolean) => void;
}

export const EditorToolbar = ({ onSave, onBack, componentTitle, showShortcuts, setShowShortcuts }: EditorToolbarProps) => {
  const { canUndo, canRedo, undo, redo, uiState, setZoomLevel } = useEditor();
  const { zoomLevel } = uiState;

  const zoomLevels = [25, 50, 75, 100, 150, 200];

  const handleZoomIn = () => {
    setZoomLevel(Math.min(zoomLevel + 25, 200));
  };

  const handleZoomOut = () => {
    setZoomLevel(Math.max(zoomLevel - 25, 25));
  };

  return (
    <>
      <div className="h-14 border-b bg-card flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={onBack} title="Back">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-lg font-semibold">{componentTitle}</h1>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            title="Undo (Ctrl+Z)"
            onClick={undo}
            disabled={!canUndo}
          >
            <Undo className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            title="Redo (Ctrl+Shift+Z)"
            onClick={redo}
            disabled={!canRedo}
          >
            <Redo className="h-4 w-4" />
          </Button>
          
          <div className="w-px h-6 bg-border mx-2" />
          
          <Button 
            variant="ghost" 
            size="icon" 
            title="Zoom Out (Ctrl+-)"
            onClick={handleZoomOut}
            disabled={zoomLevel <= 25}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 px-2 text-xs font-mono" title="Zoom Level">
                {zoomLevel}%
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center">
              {zoomLevels.map((level) => (
                <DropdownMenuItem
                  key={level}
                  onClick={() => setZoomLevel(level)}
                  className={zoomLevel === level ? "bg-accent" : ""}
                >
                  {level}%
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button 
            variant="ghost" 
            size="icon" 
            title="Zoom In (Ctrl++)"
            onClick={handleZoomIn}
            disabled={zoomLevel >= 200}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          
          <div className="w-px h-6 bg-border mx-2" />
          
          <Button 
            variant="ghost" 
            size="icon" 
            title="Keyboard Shortcuts (Shift+?)"
            onClick={() => setShowShortcuts(true)}
          >
            <HelpCircle className="h-4 w-4" />
          </Button>
        </div>

        <Button onClick={onSave} className="gap-2">
          <Save className="h-4 w-4" />
          Save
        </Button>
      </div>
      
      <ShortcutsHelp open={showShortcuts} onOpenChange={setShowShortcuts} />
    </>
  );
};
