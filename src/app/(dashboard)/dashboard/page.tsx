"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { bookService } from "@/services/book.service";
import { ShelfStatus } from "@/types/book";
import { AddBookModal } from "@/components/modules/shelf/AddBookModal";
import { BookOpen, Plus, Clock } from "lucide-react";
import { ReadingSessionModal } from "@/components/modules/shelf/ReadingSessionModal";
import { UserBook } from "@/types/book";

const tabs: { label: string; value: ShelfStatus | "ALL" }[] = [
  { label: "Todos", value: "ALL" },
  { label: "Lendo", value: "READING" },
  { label: "Quero Ler", value: "WANT_TO_READ" },
  { label: "Lidos", value: "COMPLETED" },
];

export default function DashboardPage() {
  const [selectedTab, setSelectedTab] = useState<ShelfStatus | "ALL">("ALL");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeSessionBook, setActiveSessionBook] = useState<UserBook | null>(
    null,
  );

  const { data: shelf = [], isLoading } = useQuery({
    queryKey: ["user-shelf", selectedTab],
    queryFn: () =>
      bookService.getUserShelf(selectedTab === "ALL" ? undefined : selectedTab),
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Minha Estante
          </h1>
          <p className="text-zinc-400 text-sm">
            Gerencie suas leituras e acompanhe seu progresso
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-lg font-medium shadow-md transition-all active:scale-[0.98]"
        >
          <Plus className="w-5 h-5" />
          <span>Adicionar Livro</span>
        </button>
      </div>

      <div className="flex space-x-2 border-b border-zinc-800 pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setSelectedTab(tab.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              selectedTab === tab.value
                ? "bg-zinc-800 text-white"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="bg-zinc-900 rounded-xl h-64 animate-pulse"
            />
          ))}
        </div>
      ) : shelf.length === 0 ? (
        <div className="text-center py-16 bg-zinc-900/30 rounded-xl border border-zinc-800/50 space-y-3">
          <BookOpen className="w-12 h-12 text-zinc-600 mx-auto" />
          <h3 className="text-lg font-medium text-zinc-300">
            Sua estante está vazia
          </h3>
          <p className="text-sm text-zinc-500">
            Adicione livros para começar a registrar seu progresso.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {shelf.map((item) => {
            const progress = Math.min(
              100,
              Math.round(
                (item.currentPage / (item.book.totalPages || 1)) * 100,
              ),
            );

            return (
              <div
                key={item.id}
                className="bg-zinc-900 border border-zinc-800/80 rounded-xl overflow-hidden hover:border-zinc-700 transition-all flex flex-col group"
              >
                <div className="aspect-[2/3] bg-zinc-800 relative overflow-hidden">
                  {item.book.coverUrl ? (
                    <Image
                      src={item.book.coverUrl}
                      alt={item.book.title}
                      fill
                      unoptimized
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-600 font-bold text-lg p-2 text-center">
                      {item.book.title}
                    </div>
                  )}
                </div>

                <div className="p-3 flex-1 flex flex-col justify-between space-y-2">
                  <div>
                    <h4 className="font-semibold text-white text-sm line-clamp-1">
                      {item.book.title}
                    </h4>
                    <p className="text-xs text-zinc-400 line-clamp-1">
                      {item.book.author}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] text-zinc-400">
                        <span>{item.currentPage} pág.</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-indigo-500 h-full transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    {item.status === "READING" && (
                      <button
                        onClick={() => setActiveSessionBook(item)}
                        className="w-full py-1.5 mt-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium rounded-md transition-colors flex items-center justify-center space-x-1 border border-zinc-700 hover:border-zinc-600"
                      >
                        <Clock className="w-3 h-3" />
                        <span>Registrar Leitura</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <AddBookModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
      <ReadingSessionModal
        isOpen={!!activeSessionBook}
        onClose={() => setActiveSessionBook(null)}
        userBook={activeSessionBook}
      />
    </div>
  );
}
