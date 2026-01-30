import { useState, useEffect } from 'react';
import { ArrowLeft, Save, User, Brain, Palette } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { ThemeSelector } from '@/components/ThemeSelector';
import {
  isSentencePracticeEnabled,
  setSentencePracticeEnabled,
} from '@/services/sentenceEvaluator';

const Settings = () => {
  const navigate = useNavigate();
  const { profile, updateDisplayName, user, updateSentencePracticeConfig } = useAuth();
  const { toast } = useToast();
  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [isSaving, setIsSaving] = useState(false);

  // Sentence practice settings
  const [practiceEnabled, setPracticeEnabled] = useState(profile?.sentence_practice_enabled || false);

  useEffect(() => {
    if (profile) {
      setPracticeEnabled(profile.sentence_practice_enabled);
    }
  }, [profile]);

  const handlePracticeToggle = async (enabled: boolean) => {
    setPracticeEnabled(enabled);
    const { error } = await updateSentencePracticeConfig(enabled);

    if (error) {
      setPracticeEnabled(!enabled); // Rollback
      toast({
        title: 'Error saving setting',
        description: error.message,
        variant: 'destructive',
      });
      return;
    }

    setSentencePracticeEnabled(enabled); // Still keep in localStorage for immediate sync
    toast({
      title: enabled ? 'Sentence Practice Enabled' : 'Sentence Practice Disabled',
      description: enabled
        ? 'You can now practice using words in sentences during SRS review.'
        : 'Sentence practice has been turned off.',
    });
  };

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
    <div className="min-h-screen">
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

      <main className="container max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* Profile Settings */}
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

        {/* Sentence Practice Settings */}
        <div className="bg-card rounded-xl border border-border p-6 space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <Brain className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h2 className="font-semibold text-lg">AI Sentence Practice</h2>
              <p className="text-sm text-muted-foreground">
                Practice using words in sentences with AI feedback
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="practice-toggle">Enable Sentence Practice</Label>
              <p className="text-sm text-muted-foreground">
                After reviewing a card in SRS, you can optionally practice using the word in a sentence.
                An AI will evaluate if your sentence demonstrates correct understanding of the word.
              </p>
            </div>
            <Switch
              id="practice-toggle"
              checked={practiceEnabled}
              onCheckedChange={handlePracticeToggle}
            />
          </div>
        </div>

        {/* Theme Settings */}
        <div className="bg-card rounded-xl border border-border p-6 space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
              <Palette className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-lg">Theme</h2>
              <p className="text-sm text-muted-foreground">
                Customize the look and feel of your app
              </p>
            </div>
          </div>

          <ThemeSelector />
        </div>
      </main>
    </div>
  );
};

export default Settings;
