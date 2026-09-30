"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ProtectedRoute } from "@/components/common/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import {
  BookOpen,
  Trophy,
  Users,
  LogOut,
  User as UserIcon,
} from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout } = useAuth();

  const getAvatarUrl = (url: string | null | undefined) => {
    if (!url) return null;
    if (url.startsWith("http")) return url;
    return `http://localhost:3001${url}`;
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col md:flex-row">
        <aside className="hidden md:flex md:w-64 border-r border-zinc-800 flex-col p-6 space-y-8 bg-zinc-900/50">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-8 h-8 text-indigo-500" />
            <span className="text-2xl font-bold tracking-tight text-white">
              Bookr
            </span>
          </div>

          <nav className="flex-1 space-y-2">
            <Link
              href="/dashboard"
              className="flex items-center space-x-3 px-4 py-3 rounded-lg text-zinc-400 hover:bg-zinc-800/40 hover:text-white transition-colors"
            >
              <BookOpen className="w-5 h-5" />
              <span>Minha Estante</span>
            </Link>
            <Link
              href="/feed"
              className="flex items-center space-x-3 px-4 py-3 rounded-lg text-zinc-400 hover:bg-zinc-800/40 hover:text-white transition-colors"
            >
              <Users className="w-5 h-5" />
              <span>Feed Social</span>
            </Link>
            <Link
              href="/competitions"
              className="flex items-center space-x-3 px-4 py-3 rounded-lg text-zinc-400 hover:bg-zinc-800/40 hover:text-white transition-colors"
            >
              <Trophy className="w-5 h-5" />
              <span>Competições</span>
            </Link>
          </nav>

          <div className="border-t border-zinc-800 pt-4 flex items-center justify-between">
            <Link
              href="/profile"
              className="flex items-center space-x-3 overflow-hidden flex-1 hover:bg-zinc-800/50 p-2 -ml-2 rounded-lg transition-colors cursor-pointer"
            >
              <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-white shrink-0 relative overflow-hidden">
                {user?.avatarUrl ? (
                  <Image
                    src={getAvatarUrl(user.avatarUrl)!}
                    alt={user.name || "Avatar"}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                ) : (
                  user?.name?.[0]?.toUpperCase() || "U"
                )}
              </div>
              <div className="truncate">
                <p className="text-sm font-medium text-white truncate">
                  {user?.name}
                </p>
                <p className="text-xs text-zinc-400 truncate">
                  @{user?.username}
                </p>
              </div>
            </Link>
            <button
              onClick={logout}
              title="Sair"
              className="p-2 text-zinc-400 hover:text-red-400 hover:bg-zinc-800 rounded-lg transition-colors ml-2 shrink-0"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </aside>

        <main className="flex-1 p-4 md:p-8 pb-20 md:pb-8 overflow-y-auto">
          {children}
        </main>

        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-zinc-900 border-t border-zinc-800 flex justify-around p-3 z-50">
          <Link
            href="/dashboard"
            className="flex flex-col items-center text-zinc-400 hover:text-indigo-400 transition-colors text-xs"
          >
            <BookOpen className="w-6 h-6" />
            <span>Estante</span>
          </Link>
          <Link
            href="/feed"
            className="flex flex-col items-center text-zinc-400 hover:text-indigo-400 transition-colors text-xs"
          >
            <Users className="w-6 h-6" />
            <span>Feed</span>
          </Link>
          <Link
            href="/competitions"
            className="flex flex-col items-center text-zinc-400 hover:text-indigo-400 transition-colors text-xs"
          >
            <Trophy className="w-6 h-6" />
            <span>Desafios</span>
          </Link>
          <Link
            href="/profile"
            className="flex flex-col items-center text-zinc-400 hover:text-indigo-400 transition-colors text-xs"
          >
            <UserIcon className="w-6 h-6" />
            <span>Perfil</span>
          </Link>
        </nav>
      </div>
    </ProtectedRoute>
  );
}
