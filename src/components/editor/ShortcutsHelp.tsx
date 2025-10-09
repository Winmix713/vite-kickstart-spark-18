import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Shortcut {
  keys: string[];
  action: string;
  category: string;
}

const shortcuts: Shortcut[] = [
  { keys: ["Ctrl", "Z"], action: "Undo", category: "Editing" },
  { keys: ["Ctrl", "Y"], action: "Redo", category: "Editing" },
  { keys: ["Ctrl", "Shift", "Z"], action: "Redo (alternative)", category: "Editing" },
  { keys: ["Ctrl", "S"], action: "Save", category: "File" },
  { keys: ["Ctrl", "+"], action: "Zoom in", category: "View" },
  { keys: ["Ctrl", "-"], action: "Zoom out", category: "View" },
  { keys: ["Ctrl", "0"], action: "Reset zoom", category: "View" },
  { keys: ["Delete"], action: "Delete selected element", category: "Editing" },
  { keys: ["Escape"], action: "Deselect element", category: "Editing" },
  { keys: ["Shift", "?"], action: "Show this help", category: "Help" },
];

const groupedShortcuts = shortcuts.reduce((acc, shortcut) => {
  if (!acc[shortcut.category]) {
    acc[shortcut.category] = [];
  }
  acc[shortcut.category].push(shortcut);
  return acc;
}, {} as Record<string, Shortcut[]>);

interface ShortcutsHelpProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ShortcutsHelp = ({ open, onOpenChange }: ShortcutsHelpProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-6">
            {Object.entries(groupedShortcuts).map(([category, categoryShortcuts]) => (
              <div key={category}>
                <h3 className="text-sm font-semibold mb-3 text-muted-foreground">
                  {category}
                </h3>
                <div className="space-y-2">
                  {categoryShortcuts.map((shortcut, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-accent/50 transition-colors"
                    >
                      <span className="text-sm">{shortcut.action}</span>
                      <div className="flex gap-1">
                        {shortcut.keys.map((key, keyIndex) => (
                          <span key={keyIndex} className="flex items-center gap-1">
                            <kbd className="px-2 py-1 text-xs font-semibold bg-muted rounded border border-border">
                              {key}
                            </kbd>
                            {keyIndex < shortcut.keys.length - 1 && (
                              <span className="text-muted-foreground">+</span>
                            )}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
