import { useEffect } from "react";
import { useEditor } from "@/contexts/EditorContext";

export const useKeyboardShortcuts = (onShowShortcuts?: () => void) => {
  const { undo, redo, canUndo, canRedo, uiState, setZoomLevel, setSelectedElement } = useEditor();
  const { zoomLevel } = uiState;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Undo: Ctrl+Z / Cmd+Z
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey && canUndo) {
        e.preventDefault();
        undo();
      }

      // Redo: Ctrl+Y / Cmd+Shift+Z / Ctrl+Shift+Z
      if (
        ((e.ctrlKey || e.metaKey) && e.key === "y") ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "z")
      ) {
        if (canRedo) {
          e.preventDefault();
          redo();
        }
      }

      // Zoom in: Ctrl/Cmd + =
      if ((e.ctrlKey || e.metaKey) && (e.key === "=" || e.key === "+")) {
        e.preventDefault();
        setZoomLevel(Math.min(zoomLevel + 25, 200));
      }

      // Zoom out: Ctrl/Cmd + -
      if ((e.ctrlKey || e.metaKey) && e.key === "-") {
        e.preventDefault();
        setZoomLevel(Math.max(zoomLevel - 25, 25));
      }

      // Reset zoom: Ctrl/Cmd + 0
      if ((e.ctrlKey || e.metaKey) && e.key === "0") {
        e.preventDefault();
        setZoomLevel(100);
      }

      // Deselect element: Escape
      if (e.key === "Escape") {
        e.preventDefault();
        setSelectedElement(null);
      }

      // Show shortcuts: Shift + ?
      if (e.shiftKey && e.key === "?") {
        e.preventDefault();
        onShowShortcuts?.();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo, canUndo, canRedo, zoomLevel, setZoomLevel, setSelectedElement, onShowShortcuts]);
};
