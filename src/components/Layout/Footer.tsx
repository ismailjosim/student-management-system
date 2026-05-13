import { GraduationCap } from 'lucide-react';
import { APP_NAME } from '@/lib/constants';

export function Footer() {
  return (
    <footer className="border-t bg-background mt-auto">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 flex flex-col items-center gap-3 text-center">
        <GraduationCap className="w-8 h-8 text-primary/20" />
        <div>
          <p className="font-bold text-sm">{APP_NAME} Systems</p>
          <p className="text-xs text-muted-foreground">Empowering mentors since 2024</p>
        </div>
        <p className="text-xs text-muted-foreground/50">
          Copyright © {new Date().getFullYear()} — All rights reserved
        </p>
      </div>
    </footer>
  );
}
