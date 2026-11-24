'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon, Trees, Sparkles, Check, Palette, ChevronDown } from 'lucide-react';

export const THEME_OPTIONS = [
  {
    id: 'light',
    name: 'Classic Light',
    desc: 'Crisp Indigo & Slate',
    icon: Sun,
    colors: ['#FFFFFF', '#F8FAFC', '#4F46E5', '#0F172A'],
    badge: 'Light'
  },
  {
    id: 'dark',
    name: 'Midnight Dark',
    desc: 'Deep Zinc & Violet',
    icon: Moon,
    colors: ['#09090B', '#18181B', '#7C3AED', '#FAFAFA'],
    badge: 'Dark'
  },
  {
    id: 'emerald',
    name: 'Emerald Royale',
    desc: 'Forest Green & Sun Gold',
    icon: Trees,
    colors: ['#0C3B2E', '#6D9773', '#FFBA00', '#BB8A52'],
    badge: 'Forest Gold'
  },
  {
    id: 'iris',
    name: 'Royal Iris',
    desc: 'Electric Violet & Coral',
    icon: Sparkles,
    colors: ['#752FFF', '#FE3A3A', '#FFBB31', '#000000'],
    badge: 'Electric'
  },
];

interface ThemeSelectorProps {
  compact?: boolean;
  align?: 'left' | 'right';
}

export default function ThemeSelector({ compact = false, align = 'right' }: ThemeSelectorProps) {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  if (!mounted) {
    return (
      <div className="w-9 h-9 rounded-lg border border-border bg-card animate-pulse" />
    );
  }

  const currentTheme = THEME_OPTIONS.find((t) => t.id === theme) || THEME_OPTIONS[1];
  const CurrentIcon = currentTheme.icon;

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-2 rounded-lg border border-border bg-card hover:bg-card-hover text-foreground transition-all duration-200 shadow-sm cursor-pointer"
        title={`Change Theme (Current: ${currentTheme.name})`}
        aria-label="Select Theme"
      >
        <div className="relative flex items-center justify-center">
          <CurrentIcon className="w-4 h-4 text-primary" />
        </div>
        {!compact && (
          <span className="text-xs font-bold truncate max-w-[100px]">
            {currentTheme.name}
          </span>
        )}
        <div className="flex items-center -space-x-1 ml-0.5">
          {currentTheme.colors.slice(0, 3).map((c, i) => (
            <span
              key={i}
              className="w-2.5 h-2.5 rounded-full border border-background shadow-xs shrink-0"
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
        <ChevronDown className={`w-3 h-3 text-text-muted transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div
          className={`absolute ${align === 'right' ? 'right-0' : 'left-0'} bottom-full mb-2 md:bottom-auto md:top-full md:mt-2 w-72 rounded-xl border border-border bg-card/95 backdrop-blur-xl p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150`}
        >
          <div className="px-2.5 py-1.5 border-b border-border mb-1.5 flex items-center justify-between">
            <span className="text-[0.7rem] font-extrabold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-primary" /> Theme & Palette
            </span>
            <span className="text-[0.65rem] font-semibold text-primary">
              {currentTheme.name}
            </span>
          </div>

          <div className="space-y-1">
            {THEME_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              const isSelected = theme === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => {
                    setTheme(opt.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-primary/10 border border-primary/30 text-primary font-bold shadow-xs'
                      : 'hover:bg-card-hover border border-transparent text-foreground'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`p-1.5 rounded-md ${
                        isSelected ? 'bg-primary text-white' : 'bg-background text-text-muted border border-border'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold truncate flex items-center gap-1.5">
                        <span>{opt.name}</span>
                        {opt.badge && (
                          <span className="text-[0.6rem] font-semibold px-1 py-0.2 rounded bg-background border border-border text-text-muted">
                            {opt.badge}
                          </span>
                        )}
                      </div>
                      <div className="text-[0.65rem] text-text-muted truncate">
                        {opt.desc}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex items-center -space-x-1">
                      {opt.colors.map((c, i) => (
                        <span
                          key={i}
                          className="w-3 h-3 rounded-full border border-card shadow-xs shrink-0"
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-primary shrink-0" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

