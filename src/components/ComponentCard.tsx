import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Heart } from "lucide-react";
import { toast } from "sonner";

interface ComponentCardProps {
  id: string;
  title: string;
  description: string | null;
  code_html: string | null;
  technology: string;
  tags: string[];
  likes_count: number;
}

export const ComponentCard = ({
  id,
  title,
  description,
  code_html,
  technology,
  tags,
  likes_count,
}: ComponentCardProps) => {
  const [showCode, setShowCode] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code_html || "");
    toast.success("Code copied to clipboard!");
  };

  return (
    <Link to={`/component/${id}`}>
      <div className="glass-card rounded-2xl p-6 hover-glow group cursor-pointer">
        {/* Preview Area */}
        <div className="relative bg-muted/30 rounded-xl p-8 mb-4 min-h-[200px] flex items-center justify-center overflow-hidden">
          {code_html && <div dangerouslySetInnerHTML={{ __html: code_html }} />}
          <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              size="sm"
              variant="secondary"
              className="bg-background/80 backdrop-blur-sm"
              onClick={(e) => {
                e.preventDefault();
                setShowCode(!showCode);
              }}
            >
              {showCode ? "Preview" : "Code"}
            </Button>
          </div>
        </div>

        {/* Code Block */}
        {showCode && (
          <div className="mb-4 relative">
            <pre className="bg-background/80 backdrop-blur-sm rounded-lg p-4 overflow-x-auto text-xs">
              <code className="text-primary">{code_html}</code>
            </pre>
            <Button
              size="sm"
              variant="ghost"
              className="absolute top-2 right-2"
              onClick={(e) => {
                e.preventDefault();
                handleCopy();
              }}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Info Section */}
        <div className="space-y-3">
          <div>
            <h3 className="text-xl font-bold mb-1">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
              {technology}
            </Badge>
            {tags.map((tag) => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-border">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Heart className="h-4 w-4" />
              <span>{likes_count}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};
