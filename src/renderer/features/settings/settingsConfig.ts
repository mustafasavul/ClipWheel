import { Clipboard, Command, Palette, Settings, Shield, Trash2, Wand2 } from 'lucide-react';

export const settingsTabs = [
  { id: 'general', labelKey: 'general', icon: Settings },
  { id: 'wheelAppearance', labelKey: 'wheelAppearance', icon: Palette },
  { id: 'clipboard', labelKey: 'clipboard', icon: Clipboard },
  { id: 'privacy', labelKey: 'privacy', icon: Shield },
  { id: 'cleanup', labelKey: 'cleanup', icon: Trash2 },
  { id: 'shortcuts', labelKey: 'shortcuts', icon: Command },
  { id: 'advanced', labelKey: 'advanced', icon: Wand2 },
] as const;

export type SettingsTabId = (typeof settingsTabs)[number]['id'];
