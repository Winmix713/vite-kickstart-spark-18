import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { EditorCanvas, EditorCanvasRef } from "@/components/editor/EditorCanvas";
import { LayerPanel } from "@/components/editor/LayerPanel";
import { PropertiesPanel } from "@/components/editor/PropertiesPanel";
import { EditorToolbar } from "@/components/editor/EditorToolbar";
import { EditorProvider, useEditor } from "@/contexts/EditorContext";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { ErrorBoundary } from "@/components/editor/ErrorBoundary";

interface Component {
  id: string;
  title: string;
  code_html: string;
  code_css: string;
  code_react: string;
  user_id: string;
}

function EditorContent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [component, setComponent] = useState<Component | null>(null);
  const [loading, setLoading] = useState(true);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const canvasRef = useRef<EditorCanvasRef>(null);
  const { state, resetHistory, isDirty, markAsSaved } = useEditor();
  
  // Enable keyboard shortcuts
  useKeyboardShortcuts(() => setShowShortcuts(true));

  useEffect(() => {
    const fetchComponent = async () => {
      if (!id) return;

      const { data, error } = await (supabase as any)
        .from("components")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !data) {
        toast.error("Failed to load component");
        navigate("/");
        return;
      }

      if (data.user_id !== user?.id) {
        toast.error("You don't have permission to edit this component");
        navigate(`/component/${id}`);
        return;
      }

      setComponent(data);
      resetHistory({
        htmlCode: data.code_html || "",
        cssCode: data.code_css || "",
        reactCode: data.code_react || "",
      });
      setLoading(false);
    };

    if (user) {
      fetchComponent();
    }
  }, [id, user, navigate]);

  const handleSave = async () => {
    if (!component) return;

    const { error } = await (supabase as any)
      .from("components")
      .update({
        code_html: state.htmlCode,
        code_css: state.cssCode,
        code_react: state.reactCode,
      })
      .eq("id", component.id);

    if (error) {
      toast.error("Failed to save changes");
    } else {
      toast.success("Component saved successfully!");
      markAsSaved();
      // Clear localStorage backup after successful save
      if (id) {
        localStorage.removeItem(`editor-backup-${id}`);
      }
    }
  };

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "You have unsaved changes. Are you sure you want to leave?";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      <EditorToolbar
        onSave={handleSave}
        onBack={() => navigate(`/component/${id}`)}
        componentTitle={component?.title || ""}
        showShortcuts={showShortcuts}
        setShowShortcuts={setShowShortcuts}
      />
      
      <div className="flex-1 flex overflow-hidden">
        <LayerPanel 
          previewRef={canvasRef.current?.previewRef || { current: null }}
        />
        
        <div className="flex-1 flex items-center justify-center p-4 bg-muted/20">
          <EditorCanvas ref={canvasRef} />
        </div>
        
        <PropertiesPanel />
      </div>
    </div>
  );
}

export default function Editor() {
  const { id } = useParams();
  const [initialState, setInitialState] = useState<{
    htmlCode: string;
    cssCode: string;
    reactCode: string;
  } | null>(null);

  // Load initial state before providing context
  useEffect(() => {
    const loadComponent = async () => {
      if (!id) return;
      
      const { data } = await (supabase as any)
        .from("components")
        .select("*")
        .eq("id", id)
        .single();

      if (data) {
        // Check for localStorage backup
        const backup = localStorage.getItem(`editor-backup-${id}`);
        if (backup) {
          try {
            const backupData = JSON.parse(backup);
            const shouldRestore = window.confirm(
              "Unsaved changes detected from a previous session. Would you like to restore them?"
            );
            
            if (shouldRestore) {
              setInitialState(backupData);
              toast.info("Restored unsaved changes");
              return;
            } else {
              localStorage.removeItem(`editor-backup-${id}`);
            }
          } catch (error) {
            console.error("Failed to parse backup:", error);
            localStorage.removeItem(`editor-backup-${id}`);
          }
        }

        setInitialState({
          htmlCode: data.code_html || "",
          cssCode: data.code_css || "",
          reactCode: data.code_react || "",
        });
      }
    };

    loadComponent();
  }, [id]);

  if (!initialState) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <EditorProvider initialState={initialState} componentId={id}>
        <EditorContent />
      </EditorProvider>
    </ErrorBoundary>
  );
}
