'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, ShoppingCart, Users, LogOut, MailWarning, X } from 'lucide-react';
import { useState } from 'react';
import { useLogout, useAuthStore, useResendVerification, useMe } from '@/stores/auth';
import { toast } from '@/lib/toast';
import { safeAsync } from '@/helpers/safe-sync';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  useMe()
  const { mutateAsync: logout, isPending } = useLogout();
  const { mutateAsync: resend, isPending: isResending } = useResendVerification();
  const user = useAuthStore((s) => s.user);
  const vendor = useAuthStore((s) => s.vendor);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  const showBanner = user && !user.emailVerified && !bannerDismissed;

  const navItems = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/orders', label: 'Orders', icon: ShoppingCart },
    { href: '/team', label: 'Team', icon: Users },
  ];

  const handleLogout = async () => {
    await logout()
    router.replace('/auth/login')
  }

  const handleResend = async () => {
    if (!user?.email) return
    const [_, error] = await safeAsync(() => resend(user.email))
    if (error) {
      toast.error({ title: 'Failed to resend', description: 'Please try again.' })
      return
    }
    toast.success({ title: 'Verification email sent', description: `Check ${user.email} for the code.` })
  }


  return (
    <div className="flex h-screen bg-background text-foreground">
      <aside className="w-64 border-r border-border bg-sidebar text-sidebar-foreground flex flex-col">
        <div className="p-6 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-sidebar-primary flex items-center justify-center shrink-0">
              <span className="text-sidebar-primary-foreground font-bold text-sm">
                {vendor?.name?.charAt(0)?.toUpperCase() ?? 'V'}
              </span>
            </div>
            <div className="min-w-0">
              <h1 className="text-sm font-bold truncate">{vendor?.name ?? 'Vendor'}</h1>
              <p className="text-xs text-sidebar-foreground/60 truncate">
                {user ? `${user.firstName} ${user.lastName}` : 'Management'}
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-sidebar-border space-y-4">
          <div className="px-4 py-3 rounded-lg bg-sidebar-accent/30">
            <p className="text-xs font-semibold text-sidebar-accent-foreground">Pro Tip</p>
            <p className="text-xs text-sidebar-foreground/60 mt-1">
              Manage all your business operations from one place.
            </p>
          </div>
          <button
            onClick={handleLogout}
            disabled={isPending}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors text-left disabled:opacity-50"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">{isPending ? 'Logging out…' : 'Logout'}</span>
          </button>
        </div>
      </aside>


      <div className="flex-1 flex flex-col overflow-hidden">
        {showBanner && (
          <div className="flex items-center gap-3 px-4 py-3 bg-amber-500/10 border-b border-amber-500/20 text-amber-400 text-sm">
            <MailWarning className="w-4 h-4 shrink-0" />
            <p className="flex-1">
              Your email isn't verified yet.{' '}
              <Link
                href={`/auth/verify-email${user?.email ? `?email=${encodeURIComponent(user.email)}` : ''}`}
                className="font-semibold underline underline-offset-2"
              >
                Verify now
              </Link>
              {' or '}
              <button
                onClick={handleResend}
                disabled={isResending}
                className="font-semibold underline underline-offset-2 disabled:opacity-50 cursor-pointer"
              >
                {isResending ? 'Sending…' : 'resend code'}
              </button>
            </p>
          </div>
        )}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
