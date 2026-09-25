"use client";

import React, { useState, useEffect } from "react";
import { useForm, useWatch, Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { X, Loader2, BookOpen } from "lucide-react";
import { bookService } from "@/services/book.service";
import {
  readingSessionSchema,
  ReadingSessionFormData,
} from "@/lib/validations/session";
import { UserBook } from "@/types/book";

interface ReadingSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  userBook: UserBook | null;
}

export function ReadingSessionModal({
  isOpen,
  onClose,
  userBook,
}: ReadingSessionModalProps) {
  const queryClient = useQueryClient();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleClose = () => {
    setErrorMessage(null);
    onClose();
  };

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ReadingSessionFormData>({
    resolver: zodResolver(
      readingSessionSchema,
    ) as unknown as Resolver<ReadingSessionFormData>,
    defaultValues: { mode: "PAGES" },
  });

  const currentMode = useWatch({ control, name: "mode" }) || "PAGES";

  useEffect(() => {
    if (userBook && isOpen) {
      reset({
        mode: "PAGES",
        startPage: userBook.currentPage,
        endPage: userBook.currentPage,
        rating: undefined,
        notes: "",
      });
    }
  }, [userBook, isOpen, reset]);

  const mutation = useMutation({
    mutationFn: (data: ReadingSessionFormData) =>
      bookService.createReadingSession(userBook!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-shelf"] });
      handleClose();
    },
    onError: (error: unknown) => {
      if (error instanceof AxiosError) {
        setErrorMessage(
          error.response?.data?.message ||
            "Erro ao registrar sessão de leitura.",
        );
      } else {
        setErrorMessage("Ocorreu um erro inesperado ao registrar a sessão.");
      }
    },
  });

  if (!isOpen || !userBook) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 w-full max-w-md rounded-2xl shadow-2xl flex flex-col">
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-indigo-600/20 text-indigo-400 flex items-center justify-center rounded-lg">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                Registrar Leitura
              </h2>
              <p className="text-xs text-zinc-400 line-clamp-1">
                {userBook.book.title}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMessage && (
          <div className="mx-5 mt-5 p-3 text-sm text-red-400 bg-red-950/50 rounded-lg border border-red-900/60">
            {errorMessage}
          </div>
        )}

        <form
          onSubmit={handleSubmit((data) => {
            setErrorMessage(null);
            mutation.mutate(data);
          })}
          className="p-5 space-y-4"
        >
          <div className="flex bg-zinc-800/50 p-1 rounded-lg border border-zinc-800">
            {(["PAGES", "CHAPTERS"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setValue("mode", mode)}
                className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${
                  currentMode === mode
                    ? "bg-zinc-700 text-white shadow-sm"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                {mode === "PAGES" ? "Páginas" : "Capítulos"}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {currentMode === "PAGES" ? (
              <>
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">
                    Pág. Inicial
                  </label>
                  <input
                    type="number"
                    {...register("startPage")}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 focus:ring-1 focus:ring-indigo-500 outline-none text-sm"
                  />
                  {errors.startPage && (
                    <p className="mt-1 text-[10px] text-red-400">
                      {errors.startPage.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">
                    Pág. Final
                  </label>
                  <input
                    type="number"
                    {...register("endPage")}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 focus:ring-1 focus:ring-indigo-500 outline-none text-sm"
                  />
                  {errors.endPage && (
                    <p className="mt-1 text-[10px] text-red-400">
                      {errors.endPage.message}
                    </p>
                  )}
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">
                    Cap. Inicial
                  </label>
                  <input
                    type="number"
                    {...register("startChapter")}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 focus:ring-1 focus:ring-indigo-500 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">
                    Cap. Final
                  </label>
                  <input
                    type="number"
                    {...register("endChapter")}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 focus:ring-1 focus:ring-indigo-500 outline-none text-sm"
                  />
                  {errors.endChapter && (
                    <p className="mt-1 text-[10px] text-red-400">
                      {errors.endChapter.message}
                    </p>
                  )}
                </div>
              </>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">
              Avaliação da Sessão (1-10)
            </label>
            <input
              type="number"
              min="1"
              max="10"
              {...register("rating")}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 focus:ring-1 focus:ring-indigo-500 outline-none text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">
              Anotações (opcional)
            </label>
            <textarea
              {...register("notes")}
              rows={3}
              placeholder="O que achou dessa parte da leitura?"
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 focus:ring-1 focus:ring-indigo-500 outline-none text-sm resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg shadow-md transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            {mutation.isPending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <span>Salvar Sessão</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
