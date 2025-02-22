'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Database, ListTodo, Settings } from 'lucide-react';

export default function NavigationBar() {
  const pathname = usePathname();

  const navItems = [
    {
      label: 'Home',
      href: '/',
      icon: Home
    },
    {
      label: 'Database',
      href: '/database',
      icon: Database
    },
    {
      label: 'Tasks',
      href: '/tasks',
      icon: ListTodo
    },
    {
      label: 'Settings',
      href: '/settings',
      icon: Settings
    }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-around h-16">
          {navItems.map(({ label, href, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex flex-col items-center space-y-1 ${
                  isActive ? 'text-blue-600' : 'text-gray-600'
                }`}
              >
                <Icon className="w-6 h-6" />
                <span className="text-xs font-medium">{label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
} 