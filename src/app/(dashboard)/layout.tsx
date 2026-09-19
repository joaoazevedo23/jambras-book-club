"use client";

import React from "react";
import Link from "next/link";
import { ProtectedRoute } from "@/components/common/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import { BookOpen, Trophy, Users, LogOut } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout } = useAuth();

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
              className="flex items-center space-x-3 px-4 py-3 rounded-lg bg-zinc-800/80 text-white font-medium"
            >
              <BookOpen className="w-5 h-5 text-indigo-400" />
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
            <div className="flex items-center space-x-3 overflow-hidden">
              <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-white shrink-0">
                {user?.name?.[0]?.toUpperCase() || "U"}
              </div>
              <div className="truncate">
                <p className="text-sm font-medium text-white truncate">
                  {user?.name}
                </p>
                <p className="text-xs text-zinc-400 truncate">
                  @{user?.username}
                </p>
              </div>
            </div>
            <button
              onClick={logout}
              title="Sair"
              className="p-2 text-zinc-400 hover:text-red-400 hover:bg-zinc-800 rounded-lg transition-colors"
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
            className="flex flex-col items-center text-indigo-400 text-xs"
          >
            <BookOpen className="w-6 h-6" />
            <span>Estante</span>
          </Link>
          <Link
            href="/feed"
            className="flex flex-col items-center text-zinc-400 text-xs"
          >
            <Users className="w-6 h-6" />
            <span>Feed</span>
          </Link>
          <Link
            href="/competitions"
            className="flex flex-col items-center text-zinc-400 text-xs"
          >
            <Trophy className="w-6 h-6" />
            <span>Desafios</span>
          </Link>
        </nav>
      </div>
    </ProtectedRoute>
  );
}
