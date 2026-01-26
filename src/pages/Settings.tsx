import { useState } from 'react';
import { ArrowLeft, Save, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

const Settings = () => {
  const navigate = useNavigate();
  const { profile, updateDisplayName, user } = useAuth();
  const { toast } = useToast();
  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!displayName.trim()) {
      toast({
        title: 'Invalid name',
        description: 'Display name cannot be empty.',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    const { error } = await updateDisplayName(displayName.trim());
    setIsSaving(false);

    if (error) {
      toast({
        title: 'Error saving',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Saved',
        description: 'Your display name has been updated.',
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="font-display text-xl font-semibold text-foreground">
                Settings
              </h1>
              <p className="text-xs text-muted-foreground">Manage your profile</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container max-w-2xl mx-auto px-4 py-8">
        <div className="bg-card rounded-xl border border-border p-6 space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-lg">{profile?.display_name}</h2>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name</Label>
            <p className="text-sm text-muted-foreground">
              This name will be shown to other users (e.g., "Shayan knows this word")
            </p>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Enter your display name"
            />
          </div>

          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Settings;
