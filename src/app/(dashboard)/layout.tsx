'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { NavigationDrawer } from '@/components/navigation/navigation-drawer';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);

  React.useEffect(() => {
    // Basic password prompt like in the original app
    const pass = sessionStorage.getItem('admin_pass');
    if (pass === 'xdxdxd123') {
      setIsAuthenticated(true);
    } else {
      const input = prompt('Hasło:');
      if (input === 'xdxdxd123') {
        sessionStorage.setItem('admin_pass', 'xdxdxd123');
        setIsAuthenticated(true);
      } else {
        alert('Błędne hasło');
        router.push('/');
      }
    }
  }, [router]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-bg-base flex items-center justify-center">
        <div className="text-primary headline-small animate-pulse">AUTORYZACJA...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <NavigationDrawer />
      <div className="flex-1 lg:pl-72">
        {children}
      </div>
    </div>
  );
}
