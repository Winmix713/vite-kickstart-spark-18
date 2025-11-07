import { useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import DOMPurify from "dompurify";
import postcss from "postcss";
import safeParser from "postcss-safe-parser";
import { useEditor } from "@/contexts/EditorContext";

interface EditorCanvasProps {
  // Props removed - now using context
}

export interface EditorCanvasRef {
  previewRef: React.RefObject<HTMLDivElement>;
}

export const EditorCanvas = forwardRef<EditorCanvasRef, EditorCanvasProps>((_props, ref) => {
  const previewRef = useRef<HTMLDivElement>(null);
  const { state, uiState, selectedElement, setSelectedElement } = useEditor();
  const { htmlCode, cssCode } = state;
  const { zoomLevel } = uiState;

  useImperativeHandle(ref, () => ({
    previewRef,
  }));

  useEffect(() => {
    if (!previewRef.current) return;

    // Inject HTML and CSS into preview
    const styleElement = previewRef.current.querySelector("style");
    if (styleElement) {
      styleElement.textContent = cssCode;
    }

    // Handle element selection
    const handleClick = (e: MouseEvent) => {
      e.stopPropagation();
      const target = e.target as HTMLElement;
      
      // Remove previous highlight
      const prevSelected = preview.querySelector(".editor-selected");
      if (prevSelected) {
        prevSelected.classList.remove("editor-selected");
      }

      // Highlight selected element
      if (target !== previewRef.current) {
        target.classList.add("editor-selected");
        setSelectedElement(target);
      }
    };

    // Handle hover effects
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target !== previewRef.current && !target.classList.contains("editor-selected")) {
        target.classList.add("editor-hover");
      }
    };

    const handleMouseOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      target.classList.remove("editor-hover");
    };

    const preview = previewRef.current;
    preview.addEventListener("click", handleClick);
    preview.addEventListener("mouseover", handleMouseOver);
    preview.addEventListener("mouseout", handleMouseOut);

    return () => {
      preview.removeEventListener("click", handleClick);
      preview.removeEventListener("mouseover", handleMouseOver);
      preview.removeEventListener("mouseout", handleMouseOut);
    };
  }, [cssCode, selectedElement, setSelectedElement]);

  // Validate and sanitize CSS
  const validateCSS = (css: string): string => {
    try {
      const result = postcss().process(css, { parser: safeParser, from: undefined });
      return result.css;
    } catch (error) {
      console.error("Invalid CSS:", error);
      return "";
    }
  };

  // Sanitize HTML with strict rules
  const sanitizedHTML = DOMPurify.sanitize(htmlCode, {
    ALLOWED_TAGS: ['div', 'span', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'button', 'a', 'img', 'ul', 'ol', 'li', 'section', 'article', 'header', 'footer', 'nav', 'main', 'aside', 'strong', 'em', 'small', 'label', 'input', 'textarea', 'select', 'option'],
    ALLOWED_ATTR: ['class', 'id', 'href', 'src', 'alt', 'title', 'aria-label', 'role', 'type', 'placeholder', 'value'],
    FORBID_ATTR: ['onerror', 'onclick', 'onload', 'onmouseover', 'onfocus', 'onblur'],
    FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'form'],
  });
  
  const sanitizedCSS = validateCSS(DOMPurify.sanitize(cssCode));

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-auto">
      <style>
        {`
          .editor-selected {
            outline: 2px solid hsl(var(--primary)) !important;
            outline-offset: 2px;
          }
          .editor-hover {
            outline: 1px dashed hsl(var(--primary)) !important;
            outline-offset: 2px;
            transition: outline 0.2s ease;
          }
        `}
      </style>
      <div 
        className="bg-card rounded-lg shadow-lg p-8 min-h-[600px] origin-top-left transition-transform"
        style={{ 
          transform: `scale(${zoomLevel / 100})`,
          width: `${100 / (zoomLevel / 100)}%`
        }}
      >
        <div
          ref={previewRef}
          className="w-full h-full"
          dangerouslySetInnerHTML={{
            __html: `<style>${sanitizedCSS}</style>${sanitizedHTML}`,
          }}
        />
      </div>
      <div className="absolute top-2 right-2 bg-background/90 backdrop-blur-sm rounded px-3 py-1 text-xs text-muted-foreground">
        Preview Mode · {zoomLevel}%
      </div>
    </div>
  );
});
