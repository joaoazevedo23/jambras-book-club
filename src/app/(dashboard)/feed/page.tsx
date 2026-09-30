"use client";

import React from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { activityService } from "@/services/activities.service";
import { Loader2, User } from "lucide-react";
import { ActivityCard } from "@/components/modules/feed/ActivityCard";

export default function FeedPage() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } =
    useInfiniteQuery({
      queryKey: ["social-feed"],
      queryFn: ({ pageParam = 1 }) => activityService.getFeed(pageParam, 10),
      initialPageParam: 1,
      getNextPageParam: (lastPage) => {
        if (lastPage.meta.page < lastPage.meta.totalPages) {
          return lastPage.meta.page + 1;
        }
        return undefined;
      },
    });

  if (status === "pending") {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="text-center py-20 text-red-400">
        Ocorreu um erro ao carregar o feed. Tente novamente mais tarde.
      </div>
    );
  }

  const activities = data.pages.flatMap((page) => page.data);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="border-b border-zinc-800 pb-4">
        <h1 className="text-3xl font-bold tracking-tight text-white">Feed</h1>
        <p className="text-sm text-zinc-400">
          Acompanhe as leituras e atividades dos seus amigos.
        </p>
      </div>

      {activities.length === 0 ? (
        <div className="text-center py-16 bg-zinc-900/30 rounded-xl border border-zinc-800/50 space-y-3">
          <User className="w-12 h-12 text-zinc-600 mx-auto" />
          <h3 className="text-lg font-medium text-zinc-300">
            Sem atividades recentes
          </h3>
          <p className="text-sm text-zinc-500">
            Adicione amigos ou registe as suas leituras para ver as atualizações
            aqui.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {activities.map((activity) => (
            <ActivityCard key={activity.id} activity={activity} />
          ))}

          {hasNextPage && (
            <button
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-medium rounded-xl transition-colors disabled:opacity-50 flex justify-center"
            >
              {isFetchingNextPage ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                "Carregar mais atividades"
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
