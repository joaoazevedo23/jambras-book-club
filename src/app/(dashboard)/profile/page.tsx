"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { userService } from "@/services/users.service";
import {
  Loader2,
  Settings,
  Bookmark,
  BookOpen,
  Flame,
  Trophy,
  Hash,
  User,
} from "lucide-react";
import { EditProfileModal } from "@/components/modules/profile/EditProfileModal";

export default function ProfilePage() {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const { data: profile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ["user-profile"],
    queryFn: () => userService.getMe(),
  });

  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ["user-stats"],
    queryFn: () => userService.getUserStats(),
  });

  const getAvatarUrl = (url: string | null) => {
    if (!url) return null;
    if (url.startsWith("http")) return url;
    return `http://localhost:3001${url}`;
  };

  const isLoading = isLoadingProfile || isLoadingStats;

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (!profile || !stats) {
    return (
      <div className="text-center py-20 text-red-400">
        Erro ao carregar os dados do perfil.
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6 relative overflow-hidden">
        <div className="w-24 h-24 sm:w-32 sm:h-32 bg-zinc-800 rounded-full border-4 border-zinc-900 shadow-xl flex items-center justify-center shrink-0 relative overflow-hidden z-10">
          {profile.avatarUrl ? (
            <Image
              src={getAvatarUrl(profile.avatarUrl)!}
              alt={profile.name}
              fill
              unoptimized
              className="object-cover"
            />
          ) : (
            <User className="w-12 h-12 text-zinc-500" />
          )}
        </div>

        <div className="flex-1 text-center sm:text-left z-10 pt-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            {profile.name}
          </h1>
          <p className="text-indigo-400 font-medium mt-1">
            @{profile.username}
          </p>
          <p className="text-zinc-400 mt-4 max-w-lg text-sm leading-relaxed">
            {profile.bio || "Nenhuma biografia informada."}
          </p>
        </div>

        <button
          onClick={() => setIsEditModalOpen(true)}
          className="absolute top-6 right-6 p-2 bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-colors z-10 flex items-center gap-2 text-sm font-medium"
        >
          <Settings className="w-4 h-4" />
          <span className="hidden sm:inline">Editar Perfil</span>
        </button>
      </div>

      <div>
        <h2 className="text-xl font-bold text-white mb-4">
          Estatísticas de Leitura
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-xl flex flex-col items-center justify-center text-center space-y-2">
            <div className="w-10 h-10 bg-indigo-500/10 text-indigo-400 rounded-full flex items-center justify-center mb-1">
              <BookOpen className="w-5 h-5" />
            </div>
            <span className="text-2xl font-bold text-white">
              {stats.totalPagesRead}
            </span>
            <span className="text-xs text-zinc-500 font-medium uppercase tracking-wider">
              Páginas Lidas
            </span>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-xl flex flex-col items-center justify-center text-center space-y-2">
            <div className="w-10 h-10 bg-purple-500/10 text-purple-400 rounded-full flex items-center justify-center mb-1">
              <Bookmark className="w-5 h-5" />
            </div>
            <span className="text-2xl font-bold text-white">
              {stats.totalChaptersRead || 0}
            </span>
            <span className="text-xs text-zinc-500 font-medium uppercase tracking-wider">
              Capítulos Lidos
            </span>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-xl flex flex-col items-center justify-center text-center space-y-2">
            <div className="w-10 h-10 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mb-1">
              <Trophy className="w-5 h-5" />
            </div>
            <span className="text-2xl font-bold text-white">
              {stats.completedBooksCount}
            </span>
            <span className="text-xs text-zinc-500 font-medium uppercase tracking-wider">
              Livros Concluídos
            </span>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-xl flex flex-col items-center justify-center text-center space-y-2">
            <div className="w-10 h-10 bg-amber-500/10 text-amber-400 rounded-full flex items-center justify-center mb-1">
              <Flame className="w-5 h-5" />
            </div>
            <span className="text-2xl font-bold text-white">
              {stats.currentStreak} dias
            </span>
            <span className="text-xs text-zinc-500 font-medium uppercase tracking-wider">
              Sequência Atual
            </span>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-xl flex flex-col items-center justify-center text-center space-y-2">
            <div className="w-10 h-10 bg-rose-500/10 text-rose-400 rounded-full flex items-center justify-center mb-1">
              <Hash className="w-5 h-5" />
            </div>
            <div className="flex flex-wrap justify-center gap-1 mt-1">
              {stats.favoriteGenres.length > 0 ? (
                stats.favoriteGenres.map((genre) => (
                  <span
                    key={genre}
                    className="text-[10px] bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded-full"
                  >
                    {genre}
                  </span>
                ))
              ) : (
                <span className="text-xs text-zinc-500">Nenhum</span>
              )}
            </div>
            <span className="text-xs text-zinc-500 font-medium uppercase tracking-wider mt-2">
              Top Géneros
            </span>
          </div>
        </div>
      </div>

      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        currentProfile={profile}
      />
    </div>
  );
}
