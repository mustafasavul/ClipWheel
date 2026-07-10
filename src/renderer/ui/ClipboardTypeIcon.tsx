import { Braces, Command, File, Image, Link, Star, Type } from 'lucide-react';
import type { ClipboardItemType } from '../../shared/types';

export function ClipboardTypeIcon({ type, size = 20 }: { type: ClipboardItemType; size?: number }) {
  switch (type) {
    case 'code': return <Braces size={size} />;
    case 'url': return <Link size={size} />;
    case 'image': return <Image size={size} />;
    case 'file_reference': return <File size={size} />;
    case 'command': return <Command size={size} />;
    case 'rich_text': return <Star size={size} />;
    default: return <Type size={size} />;
  }
}
