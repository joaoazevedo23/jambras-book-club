"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Heart, MessageSquare, Send, User, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { FeedActivity } from "@/types/activities";
import { activityService } from "@/services/activities.service";
import { useAuth } from "@/context/AuthContext";

interface ActivityCardProps {
  activity: FeedActivity;
}

export function ActivityCard({ activity }: ActivityCardProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");

  const isMyActivity = user?.id === activity.user.id;

  const timeAgo = formatDistanceToNow(new Date(activity.createdAt), {
    addSuffix: true,
    locale: ptBR,
  });

  const toggleLikeMutation = useMutation({
    mutationFn: async () => {
      if (activity.isLikedByMe) {
        await activityService.unlikeActivity(activity.id);
      } else {
        await activityService.likeActivity(activity.id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["social-feed"] });
    },
  });

  const addCommentMutation = useMutation({
    mutationFn: (content: string) =>
      activityService.addComment(activity.id, content),
    onSuccess: () => {
      setCommentText("");
      queryClient.invalidateQueries({ queryKey: ["social-feed"] });
    },
  });

  const deleteActivityMutation = useMutation({
    mutationFn: () => activityService.deleteActivity(activity.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["social-feed"] });
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: string) => activityService.removeComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["social-feed"] });
    },
  });

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    addCommentMutation.mutate(commentText);
  };

  const handleDeleteActivity = () => {
    if (
      window.confirm(
        "Tem a certeza que deseja apagar esta publicação? Esta ação é irreversível.",
      )
    ) {
      deleteActivityMutation.mutate();
    }
  };

  const handleDeleteComment = (commentId: string) => {
    if (window.confirm("Tem a certeza que deseja apagar este comentário?")) {
      deleteCommentMutation.mutate(commentId);
    }
  };

  const renderActivityContent = () => {
    if (activity.type === "READING_SESSION" && activity.readingSession) {
      const session = activity.readingSession;
      const book = session.userBook.book;
      const progressText =
        session.mode === "PAGES"
          ? `página ${session.endPage}`
          : `capítulo ${session.endChapter}`;

      return (
        <div className="mt-3 p-3 bg-zinc-800/40 rounded-xl border border-zinc-800/80 flex gap-4 items-start">
          <div className="w-16 h-24 bg-zinc-800 rounded shadow-sm overflow-hidden shrink-0 relative">
            {book.coverUrl ? (
              <Image
                src={book.coverUrl}
                alt={book.title}
                fill
                unoptimized
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[10px] text-zinc-500 text-center">
                Sem Capa
              </div>
            )}
          </div>
          <div className="flex-1 space-y-2">
            <div>
              <h4 className="font-medium text-zinc-200 text-sm">
                {book.title}
              </h4>
              <p className="text-xs text-zinc-400">{book.author}</p>
            </div>

            <div className="flex items-center flex-wrap gap-2 text-sm text-zinc-300">
              <span className="bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded text-xs font-medium">
                Avançou até {progressText}
              </span>
              {session.rating && (
                <span className="text-amber-400 text-xs font-medium bg-zinc-800/80 px-2 py-0.5 rounded">
                  ★ {session.rating}/10
                </span>
              )}
            </div>

            {session.notes && (
              <p className="text-sm text-zinc-400 italic border-l-2 border-zinc-700 pl-3">
                &quot;{session.notes}&quot;
              </p>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="mt-3 p-4 bg-zinc-800/40 rounded-xl border border-zinc-800/80 text-sm text-zinc-400">
        Detalhes da atividade não disponíveis.
      </div>
    );
  };

  const activityTitle =
    activity.type === "READING_SESSION"
      ? "registou uma nova sessão de leitura."
      : "fez uma nova atualização.";

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden transition-all hover:border-zinc-700 relative group">
      {isMyActivity && (
        <button
          onClick={handleDeleteActivity}
          disabled={deleteActivityMutation.isPending}
          className="absolute top-4 right-4 p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 rounded-md transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-50"
          title="Apagar publicação"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}

      <div className="p-4 sm:p-5">
        <div className="flex items-center justify-between mb-2 pr-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center overflow-hidden shrink-0 relative">
              {activity.user.avatarUrl ? (
                <Image
                  src={activity.user.avatarUrl}
                  alt={activity.user.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <User className="w-5 h-5 text-zinc-500" />
              )}
            </div>
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="font-semibold text-zinc-100 text-sm">
                  {activity.user.name}
                </span>
                <span className="text-xs text-zinc-400">
                  @{activity.user.username}
                </span>
              </div>
              <p className="text-xs text-zinc-500">{activityTitle}</p>
            </div>
          </div>
          <span className="text-[10px] text-zinc-500 font-medium">
            {timeAgo}
          </span>
        </div>

        {renderActivityContent()}

        <div className="mt-4 flex items-center gap-4 pt-4 border-t border-zinc-800/80">
          <button
            onClick={() => toggleLikeMutation.mutate()}
            disabled={toggleLikeMutation.isPending}
            className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
              activity.isLikedByMe
                ? "text-rose-500 hover:text-rose-600"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Heart
              className={`w-4 h-4 ${activity.isLikedByMe ? "fill-current" : ""}`}
            />
            <span>{activity._count.likes}</span>
          </button>

          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-1.5 text-sm font-medium text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <MessageSquare className="w-4 h-4" />
            <span>{activity._count.comments}</span>
          </button>
        </div>
      </div>

      {showComments && (
        <div className="bg-zinc-800/30 border-t border-zinc-800 p-4 sm:p-5 space-y-4">
          {activity.comments.length > 0 ? (
            <div className="space-y-3">
              {activity.comments.map((comment) => (
                <div key={comment.id} className="flex gap-3 group/comment">
                  <div className="w-8 h-8 bg-zinc-800 rounded-full flex items-center justify-center shrink-0 relative overflow-hidden">
                    {comment.user.avatarUrl ? (
                      <Image
                        src={comment.user.avatarUrl}
                        alt={comment.user.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <User className="w-4 h-4 text-zinc-500" />
                    )}
                  </div>
                  <div className="flex-1 bg-zinc-800/60 rounded-xl p-3 text-sm relative">
                    <div className="flex items-baseline justify-between mb-1 pr-6">
                      <span className="font-semibold text-zinc-200">
                        {comment.user.name}
                      </span>
                      <span className="text-[10px] text-zinc-500">
                        {formatDistanceToNow(new Date(comment.createdAt), {
                          locale: ptBR,
                        })}
                      </span>
                    </div>
                    <p className="text-zinc-300">{comment.content}</p>

                    {user?.id === comment.user.id && (
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        disabled={deleteCommentMutation.isPending}
                        className="absolute top-2 right-2 p-1 text-zinc-500 hover:text-red-400 opacity-0 group-hover/comment:opacity-100 transition-opacity"
                        title="Apagar comentário"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-xs text-zinc-500 py-2">
              Nenhum comentário ainda. Seja o primeiro!
            </p>
          )}

          <form
            onSubmit={handleCommentSubmit}
            className="flex gap-2 relative mt-4"
          >
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Adicione um comentário..."
              className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 pr-12 transition-all"
            />
            <button
              type="submit"
              disabled={!commentText.trim() || addCommentMutation.isPending}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-indigo-400 hover:text-indigo-300 disabled:opacity-50 disabled:hover:text-indigo-400 transition-colors rounded-md"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
