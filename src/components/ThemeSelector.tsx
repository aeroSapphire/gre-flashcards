import { useTheme } from '@/contexts/ThemeContext';
import { Check } from 'lucide-react';

export function ThemeSelector() {
  const { theme, setTheme, themes } = useTheme();

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
      {themes.map((t) => (
        <button
          key={t.id}
          onClick={() => setTheme(t.id)}
          className={`relative p-4 rounded-xl border-2 transition-all duration-200 ${
            theme.id === t.id
              ? 'border-primary ring-2 ring-primary/20'
              : 'border-border hover:border-primary/50'
          }`}
          style={{
            background: `hsl(${t.colors.background})`,
          }}
        >
          {/* Theme preview orbs */}
          <div className="flex justify-center gap-1 mb-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: t.colors.orb1 }}
            />
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: t.colors.orb2 }}
            />
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: t.colors.orb3 }}
            />
          </div>

          {/* Theme name */}
          <p
            className="text-sm font-medium text-center"
            style={{ color: `hsl(${t.colors.foreground})` }}
          >
            {t.name}
          </p>

          {/* Selected indicator */}
          {theme.id === t.id && (
            <div className="absolute top-2 right-2">
              <Check className="w-4 h-4 text-primary" />
            </div>
          )}
        </button>
      ))}
    </div>
  );
}
