'use client';

import { usePathname, useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';

export const Header = () => {
  const pathname = usePathname();
  const router = useRouter();
  
  const getTitle = () => {
    switch (pathname) {
      case '/':
        return 'Overview';
      case '/database':
        return 'Database';
      case '/tasks':
        return 'Tasks';
      case '/settings':
        return 'Settings';
      default:
        return pathname.startsWith('/detection/') ? 'Detail Page' : 'Overview';
    }
  };

  const showBackButton = pathname.startsWith('/detection/');

  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="h-20 flex items-center justify-center relative">
          {showBackButton && (
            <button 
              onClick={() => router.back()}
              className="absolute left-0 p-2 text-black"
              aria-label="Go back"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}
          <h1 className="text-xl font-semibold">{getTitle()}</h1>
        </div>
      </div>
    </header>
  );
};