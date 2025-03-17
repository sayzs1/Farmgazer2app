'use client';

import { Home, Database, ListTodo } from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';

export function NavigationBar() {
  const pathname = usePathname();

  const navItems = [
    { icon: Home, label: 'Home', href: '/' },
    { icon: Database, label: 'Database', href: '/database' },
    { icon: ListTodo, label: 'Task', href: '/tasklist' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="flex justify-around items-center h-16">
        {navItems.map(({ icon: Icon, label, href }) => {
          const isActive = pathname === href;
          return (
            <motion.div
              key={href}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="flex flex-col items-center space-y-1"
            >
              <Link
                href={href}
                className={`flex flex-col items-center space-y-1 px-4 py-2 ${
                  isActive ? 'text-emerald-700' : 'text-gray-600'
                }`}
              >
                <Icon className="w-6 h-6" />
                <span className="text-xs">{label}</span>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </nav>
  );
}