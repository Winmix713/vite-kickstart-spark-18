import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { ComponentCard } from "@/components/ComponentCard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Github } from "lucide-react";

interface Profile {
  username: string;
  display_name: string;
  avatar_url: string;
  bio: string;
  github_url: string;
  created_at: string;
}

interface Component {
  id: string;
  title: string;
  description: string;
  code_html: string;
  technology: string;
  tags: string[];
  likes_count: number;
}

export default function Profile() {
  const { username } = useParams();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [components, setComponents] = useState<Component[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!username) return;

    const fetchProfile = async () => {
      const { data: profileData } = await (supabase as any)
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single();

      if (profileData) {
        setProfile(profileData);

        const { data: componentsData } = await (supabase as any)
          .from('components')
          .select('*')
          .eq('user_id', profileData.id)
          .order('created_at', { ascending: false });

        setComponents(componentsData || []);
      }

      setLoading(false);
    };

    fetchProfile();
  }, [username]);

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

  if (!profile) {
    return (
      <>
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Profile not found</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-8">
        <Card className="glass-card border-white/10 p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-6">
            <Avatar className="w-24 h-24">
              <AvatarImage src={profile.avatar_url} />
              <AvatarFallback className="text-2xl">
                {profile.display_name?.[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <h1 className="text-gradient text-3xl font-bold mb-2">
                {profile.display_name}
              </h1>
              <p className="text-muted-foreground mb-4">@{profile.username}</p>
              {profile.bio && (
                <p className="text-foreground/80 mb-4">{profile.bio}</p>
              )}
              {profile.github_url && (
                <a
                  href={profile.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Github className="w-4 h-4" />
                  GitHub Profile
                </a>
              )}
            </div>
          </div>
        </Card>

        <Tabs defaultValue="components" className="w-full">
          <TabsList>
            <TabsTrigger value="components">
              Components ({components.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="components" className="mt-6">
            {components.length === 0 ? (
              <div className="text-center text-muted-foreground py-12">
                No components uploaded yet
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {components.map((component) => (
                  <ComponentCard
                    key={component.id}
                    {...component}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
