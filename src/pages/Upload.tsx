import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { toast } from "sonner";
import { Header } from "@/components/Header";

export default function Upload() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [previewCode, setPreviewCode] = useState("");
  const [technology, setTechnology] = useState<"html" | "react" | "tailwind" | "vue" | "svelte">("html");

  if (!user) {
    navigate('/auth');
    return null;
  }

  const addTag = () => {
    if (tagInput.trim() && tags.length < 5 && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      code_html: formData.get('code_html') as string,
      code_react: formData.get('code_react') as string,
      code_css: formData.get('code_css') as string,
      technology,
      tags,
      user_id: user.id,
    };

    try {
      const { error } = await (supabase as any)
        .from('components')
        .insert([data]);

      if (error) throw error;

      toast.success('Component uploaded successfully!');
      navigate('/');
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload component');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-8">
        <Card className="glass-card max-w-4xl mx-auto border-white/10">
          <CardHeader>
            <CardTitle className="text-gradient text-2xl">Upload Component</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="Neon Button"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="A beautiful neon button with hover effects..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="technology">Technology *</Label>
                <Select 
                  value={technology} 
                  onValueChange={(value: "html" | "react" | "tailwind" | "vue" | "svelte") => setTechnology(value)} 
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select technology" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="html">HTML/CSS</SelectItem>
                    <SelectItem value="react">React</SelectItem>
                    <SelectItem value="tailwind">Tailwind</SelectItem>
                    <SelectItem value="vue">Vue</SelectItem>
                    <SelectItem value="svelte">Svelte</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="code_html">HTML Code</Label>
                  <Textarea
                    id="code_html"
                    name="code_html"
                    placeholder="<button>Click me</button>"
                    rows={8}
                    className="font-mono text-sm"
                    onChange={(e) => setPreviewCode(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="code_css">CSS Code</Label>
                  <Textarea
                    id="code_css"
                    name="code_css"
                    placeholder=".button { ... }"
                    rows={8}
                    className="font-mono text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="code_react">React/Framework Code</Label>
                <Textarea
                  id="code_react"
                  name="code_react"
                  placeholder="export default function Button() { ... }"
                  rows={6}
                  className="font-mono text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags (max 5)</Label>
                <div className="flex gap-2">
                  <Input
                    id="tags"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    placeholder="button, animation, neon"
                    disabled={tags.length >= 5}
                  />
                  <Button type="button" onClick={addTag} variant="outline" disabled={tags.length >= 5}>
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="gap-1">
                      {tag}
                      <X
                        className="w-3 h-3 cursor-pointer"
                        onClick={() => removeTag(tag)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>

              {previewCode && (
                <div className="space-y-2">
                  <Label>Preview</Label>
                  <div className="glass-card p-6 border border-white/10 min-h-[200px] flex items-center justify-center">
                    <div dangerouslySetInnerHTML={{ __html: previewCode }} />
                  </div>
                </div>
              )}

              <Button
                type="submit"
                className="w-full hover-glow"
                disabled={isLoading}
              >
                {isLoading ? "Uploading..." : "Upload Component"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
