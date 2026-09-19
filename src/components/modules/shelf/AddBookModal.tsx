"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { bookService } from "@/services/book.service";
import { ExternalBook, ShelfStatus } from "@/types/book";
import { Search, X, Loader2, Plus, Check } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface AddBookModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddBookModal({ isOpen, onClose }: AddBookModalProps) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [addingBookId, setAddingBookId] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] =
    useState<ShelfStatus>("WANT_TO_READ");
  const [addedBooks, setAddedBooks] = useState<Record<string, boolean>>({});

  const queryClient = useQueryClient();

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 500);
    return () => clearTimeout(timer);
  }, [query]);

  const { data: results = [], isLoading: isSearching } = useQuery({
    queryKey: ["external-books-search", debouncedQuery],
    queryFn: () => bookService.searchExternal(debouncedQuery),
    enabled: debouncedQuery.trim().length > 0,
    staleTime: 1000 * 60 * 5,
  });

  const handleAddBook = async (book: ExternalBook) => {
    try {
      setAddingBookId(book.googleBooksId);

      const localBook = await bookService.importFromGoogle(book.googleBooksId);

      await bookService.updateShelf(localBook.id, {
        status: selectedStatus,
        currentPage: 0,
      });

      setAddedBooks((prev) => ({ ...prev, [book.googleBooksId]: true }));
      queryClient.invalidateQueries({ queryKey: ["user-shelf"] });
    } catch (error) {
      console.error("Erro ao adicionar livro à estante:", error);
    } finally {
      setAddingBookId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Adicionar Livro</h2>
            <p className="text-xs text-zinc-400">
              Busque no catálogo do Google Books
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 border-b border-zinc-800 space-y-4">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Digite o título, autor ou ISBN..."
              className="w-full pl-11 pr-4 py-3 bg-zinc-800/70 border border-zinc-700/80 rounded-xl text-zinc-100 placeholder-zinc-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm transition-all"
            />
          </div>

          <div className="flex items-center space-x-2 text-xs">
            <span className="text-zinc-400 font-medium">Adicionar como:</span>
            {(
              [
                { label: "Quero Ler", value: "WANT_TO_READ" },
                { label: "Lendo", value: "READING" },
                { label: "Lido", value: "COMPLETED" },
              ] as const
            ).map((item) => (
              <button
                key={item.value}
                onClick={() => setSelectedStatus(item.value)}
                className={`px-3 py-1.5 rounded-lg border transition-all ${
                  selectedStatus === item.value
                    ? "bg-indigo-600/20 border-indigo-500 text-indigo-300 font-medium"
                    : "border-zinc-800 text-zinc-400 hover:bg-zinc-800/50"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {isSearching ? (
            <div className="flex flex-col items-center justify-center py-12 text-zinc-400 space-y-2">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
              <span className="text-sm">Buscando obras...</span>
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-12 text-zinc-500 text-sm">
              {debouncedQuery
                ? "Nenhum resultado encontrado."
                : "Digite um termo para pesquisar."}
            </div>
          ) : (
            results.map((book) => {
              const isAdded = addedBooks[book.googleBooksId];
              const isLoadingThis = addingBookId === book.googleBooksId;

              return (
                <div
                  key={book.googleBooksId}
                  className="p-3 bg-zinc-800/40 border border-zinc-800 rounded-xl flex items-center justify-between gap-4 hover:border-zinc-700 transition-all"
                >
                  <div className="flex items-center space-x-3 overflow-hidden">
                    <div className="w-12 h-16 bg-zinc-800 rounded-lg overflow-hidden shrink-0 relative">
                      {book.coverUrl ? (
                        <Image
                          src={book.coverUrl}
                          alt={book.title}
                          width={48}
                          height={64}
                          className="w-full h-full object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] text-zinc-500 text-center p-1">
                          Sem Capa
                        </div>
                      )}
                    </div>
                    <div className="truncate">
                      <h4 className="font-medium text-zinc-100 text-sm truncate">
                        {book.title}
                      </h4>
                      <p className="text-xs text-zinc-400 truncate">
                        {book.author}
                      </p>
                      {book.pageCount && (
                        <span className="text-[10px] text-zinc-500">
                          {book.pageCount} páginas
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleAddBook(book)}
                    disabled={isAdded || isLoadingThis}
                    className={`px-3 py-2 rounded-lg text-xs font-medium flex items-center space-x-1.5 shrink-0 transition-all ${
                      isAdded
                        ? "bg-emerald-950/60 border border-emerald-800 text-emerald-400"
                        : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm disabled:opacity-50"
                    }`}
                  >
                    {isLoadingThis ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : isAdded ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Adicionado</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        <span>Adicionar</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
