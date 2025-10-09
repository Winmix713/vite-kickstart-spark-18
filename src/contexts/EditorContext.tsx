import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from "react";
import debounce from "lodash.debounce";

export interface EditorState {
  htmlCode: string;
  cssCode: string;
  reactCode: string;
}

export interface EditorUIState {
  zoomLevel: number;
}

interface HistoryState {
  past: EditorState[];
  present: EditorState;
  future: EditorState[];
}

interface EditorContextType {
  state: EditorState;
  uiState: EditorUIState;
  selectedElement: HTMLElement | null;
  canUndo: boolean;
  canRedo: boolean;
  isDirty: boolean;
  updateCode: (html: string, css: string, react?: string) => void;
  setSelectedElement: (element: HTMLElement | null) => void;
  setZoomLevel: (level: number) => void;
  undo: () => void;
  redo: () => void;
  resetHistory: (initialState: EditorState) => void;
  markAsSaved: () => void;
}

const EditorContext = createContext<EditorContextType | undefined>(undefined);

export const useEditor = () => {
  const context = useContext(EditorContext);
  if (!context) {
    throw new Error("useEditor must be used within EditorProvider");
  }
  return context;
};

interface EditorProviderProps {
  children: ReactNode;
  initialState: EditorState;
  componentId?: string;
}

const MAX_HISTORY = 50;

export const EditorProvider = ({ children, initialState, componentId }: EditorProviderProps) => {
  const [history, setHistory] = useState<HistoryState>({
    past: [],
    present: initialState,
    future: [],
  });
  const [selectedElement, setSelectedElement] = useState<HTMLElement | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [uiState, setUIState] = useState<EditorUIState>({
    zoomLevel: 100,
  });

  // Auto-save to localStorage with debounce
  useEffect(() => {
    const saveToLocalStorage = debounce(() => {
      if (componentId && isDirty) {
        localStorage.setItem(`editor-backup-${componentId}`, JSON.stringify(history.present));
        console.log("Auto-saved to localStorage");
      }
    }, 3000);

    if (isDirty) {
      saveToLocalStorage();
    }

    return () => {
      saveToLocalStorage.cancel();
    };
  }, [history.present, isDirty, componentId]);

  const updateCode = useCallback((html: string, css: string, react?: string) => {
    setHistory((prev) => {
      let newPast = [...prev.past, prev.present];
      
      // Limit history to MAX_HISTORY entries
      if (newPast.length > MAX_HISTORY) {
        newPast = newPast.slice(-MAX_HISTORY);
      }
      
      return {
        past: newPast,
        present: {
          htmlCode: html,
          cssCode: css,
          reactCode: react || prev.present.reactCode,
        },
        future: [],
      };
    });
    setIsDirty(true);
  }, []);

  const undo = useCallback(() => {
    setHistory((prev) => {
      if (prev.past.length === 0) return prev;
      
      const newPast = [...prev.past];
      const newPresent = newPast.pop()!;
      
      return {
        past: newPast,
        present: newPresent,
        future: [prev.present, ...prev.future],
      };
    });
  }, []);

  const redo = useCallback(() => {
    setHistory((prev) => {
      if (prev.future.length === 0) return prev;
      
      const newFuture = [...prev.future];
      const newPresent = newFuture.shift()!;
      
      return {
        past: [...prev.past, prev.present],
        present: newPresent,
        future: newFuture,
      };
    });
  }, []);

  const resetHistory = useCallback((newState: EditorState) => {
    setHistory({
      past: [],
      present: newState,
      future: [],
    });
    setIsDirty(false);
  }, []);

  const markAsSaved = useCallback(() => {
    setIsDirty(false);
  }, []);

  const setZoomLevel = useCallback((level: number) => {
    setUIState((prev) => ({ ...prev, zoomLevel: Math.min(Math.max(level, 25), 200) }));
  }, []);

  const value: EditorContextType = {
    state: history.present,
    uiState,
    selectedElement,
    canUndo: history.past.length > 0,
    canRedo: history.future.length > 0,
    isDirty,
    updateCode,
    setSelectedElement,
    setZoomLevel,
    undo,
    redo,
    resetHistory,
    markAsSaved,
  };

  return <EditorContext.Provider value={value}>{children}</EditorContext.Provider>;
};
