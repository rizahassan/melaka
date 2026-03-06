'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth';

function MelakaLogo() {
  return (
    <Link href="/" className="flex items-center gap-2">
      <Image
        src="/icons/melaka.png"
        alt="Melaka"
        width={28}
        height={28}
        className="rounded"
      />
      <span className="text-gradient-logo text-xl font-bold tracking-tight">
        Melaka
      </span>
    </Link>
  );
}

const navLinks = [
  { href: '/dashboard', label: 'Dashboard', auth: true },
  { href: '/translations', label: 'Translations', auth: true },
  { href: '/analytics', label: 'Analytics', auth: true },
  { href: '/pricing', label: 'Pricing', auth: false },
];

export function Header() {
  const { user, loading, signOut } = useAuth();
  const pathname = usePathname();

  // Filter nav links based on auth state
  const visibleLinks = navLinks.filter((link) => !link.auth || user);

  return (
    <header className="border-b border-[rgba(255,255,255,0.06)]">
      <div className="max-w-7xl mx-auto flex items-center justify-between h-16 px-6">
        {/* Left: Logo + Nav */}
        <div className="flex items-center gap-8">
          <MelakaLogo />
          <nav className="hidden md:flex items-center gap-1">
            {visibleLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 rounded-xl text-base transition-colors ${
                    isActive
                      ? 'bg-[rgba(255,255,255,0.08)] text-white'
                      : 'text-[#8090b8] hover:text-white'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right: Auth */}
        <div className="flex items-center gap-3">
          {loading ? (
            <div className="w-8 h-8 rounded-full bg-white/5 animate-pulse" />
          ) : user ? (
            <div className="flex items-center gap-3">
              <Link
                href="/settings"
                className="text-[#8090b8] hover:text-white text-base transition-colors px-3 py-1.5"
              >
                Settings
              </Link>
              <div className="flex items-center gap-2">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="w-8 h-8 rounded-full ring-1 ring-white/10"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-b from-[#1a3a8a] to-[#2a4faa] flex items-center justify-center text-white text-sm font-medium">
                    {(user.displayName || user.email || 'U')[0].toUpperCase()}
                  </div>
                )}
                <button
                  onClick={() => signOut()}
                  className="text-sm text-[#5a6a8a] hover:text-white transition-colors"
                >
                  Sign out
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="text-[#8090b8] hover:text-white text-base transition-colors px-3 py-1.5"
              >
                Sign In
              </Link>
              <Link
                href="/login"
                className="px-4 py-2 bg-gradient-to-b from-[#1a3a8a] to-[#2a4faa] text-white rounded-xl text-base shadow-[0_10px_15px_rgba(26,58,138,0.2),0_4px_6px_rgba(26,58,138,0.2)] hover:shadow-[0_10px_20px_rgba(26,58,138,0.35)] transition-shadow"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
