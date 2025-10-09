import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Header } from "@/components/Header";
import { Heart, Copy, Eye, Calendar, User, Edit } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Component {
  id: string;
  title: string;
  description: string;
  code_html: string;
  code_react: string;
  code_css: string;
  technology: string;
  tags: string[];
  likes_count: number;
  views_count: number;
  created_at: string;
  user_id: string;
  profiles: {
    username: string;
    display_name: string;
    avatar_url: string;
  };
}

export default function ComponentDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [component, setComponent] = useState<Component | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchComponent = async () => {
      const { data, error } = await (supabase as any)
        .from('components')
        .select(`
          *,
          profiles (username, display_name, avatar_url)
        `)
        .eq('id', id)
        .single();

      if (error || !data) {
        toast.error('Component not found');
        navigate('/');
        return;
      }

      setComponent(data);

      // Increment view count
      await (supabase as any)
        .from('components')
        .update({ views_count: (data.views_count || 0) + 1 })
        .eq('id', id);

      // Check if liked
      if (user) {
        const { data: likeData } = await (supabase as any)
          .from('likes')
          .select('id')
          .eq('component_id', id)
          .eq('user_id', user.id)
          .single();

        setIsLiked(!!likeData);
      }

      setLoading(false);
    };

    fetchComponent();
  }, [id, user, navigate]);

  const handleLike = async () => {
    if (!user) {
      toast.error('Please sign in to like components');
      navigate('/auth');
      return;
    }

    if (!component) return;

    try {
      if (isLiked) {
        await (supabase as any)
          .from('likes')
          .delete()
          .eq('component_id', component.id)
          .eq('user_id', user.id);

        setIsLiked(false);
        setComponent({
          ...component,
          likes_count: component.likes_count - 1
        });
      } else {
        await (supabase as any)
          .from('likes')
          .insert([{ component_id: component.id, user_id: user.id }]);

        setIsLiked(true);
        setComponent({
          ...component,
          likes_count: component.likes_count + 1
        });
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${type} code copied!`);
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading...</div>
        </div>
      </>
    );
  }

  if (!component) return null;

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <h1 className="text-gradient text-3xl font-bold mb-2">{component.title}</h1>
              <p className="text-muted-foreground">{component.description}</p>
            </div>

            <div className="flex gap-2">
              {user && component.user_id === user.id && (
                <Button
                  onClick={() => navigate(`/component/${component.id}/edit`)}
                  variant="outline"
                  className="hover-glow"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              )}
              <Button
                onClick={handleLike}
                variant={isLiked ? "default" : "outline"}
                className="hover-glow"
              >
                <Heart className={`w-4 h-4 mr-2 ${isLiked ? 'fill-current' : ''}`} />
                {component.likes_count}
              </Button>
            </div>
          </div>

          <Card className="glass-card border-white/10 p-6">
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
              <Link 
                to={`/profile/${component.profiles.username}`}
                className="flex items-center gap-2 hover:text-foreground transition-colors"
              >
                <Avatar className="w-6 h-6">
                  <AvatarImage src={component.profiles.avatar_url} />
                  <AvatarFallback className="text-xs">
                    {component.profiles.display_name?.[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span>{component.profiles.display_name}</span>
              </Link>
              <div className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                {component.views_count} views
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {new Date(component.created_at).toLocaleDateString()}
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              <Badge variant="secondary">{component.technology}</Badge>
              {component.tags.map(tag => (
                <Badge key={tag} variant="outline">{tag}</Badge>
              ))}
            </div>

            <div className="glass-card p-8 border border-white/10 min-h-[300px] flex items-center justify-center mb-6">
              {component.code_html && (
                <div dangerouslySetInnerHTML={{ __html: component.code_html }} />
              )}
            </div>

            <Tabs defaultValue="html" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="html">HTML</TabsTrigger>
                <TabsTrigger value="css">CSS</TabsTrigger>
                <TabsTrigger value="react">React</TabsTrigger>
              </TabsList>

              <TabsContent value="html" className="relative">
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute top-2 right-2 z-10"
                  onClick={() => copyToClipboard(component.code_html || '', 'HTML')}
                >
                  <Copy className="w-4 h-4" />
                </Button>
                <pre className="glass-card p-4 rounded-lg overflow-x-auto border border-white/10">
                  <code className="text-sm">{component.code_html || 'No HTML code provided'}</code>
                </pre>
              </TabsContent>

              <TabsContent value="css" className="relative">
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute top-2 right-2 z-10"
                  onClick={() => copyToClipboard(component.code_css || '', 'CSS')}
                >
                  <Copy className="w-4 h-4" />
                </Button>
                <pre className="glass-card p-4 rounded-lg overflow-x-auto border border-white/10">
                  <code className="text-sm">{component.code_css || 'No CSS code provided'}</code>
                </pre>
              </TabsContent>

              <TabsContent value="react" className="relative">
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute top-2 right-2 z-10"
                  onClick={() => copyToClipboard(component.code_react || '', 'React')}
                >
                  <Copy className="w-4 h-4" />
                </Button>
                <pre className="glass-card p-4 rounded-lg overflow-x-auto border border-white/10">
                  <code className="text-sm">{component.code_react || 'No React code provided'}</code>
                </pre>
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </div>
    </>
  );
}
