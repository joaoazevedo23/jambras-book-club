"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { AxiosError } from "axios";
import { useAuth } from "@/context/AuthContext";
import { authService } from "@/services/auth.service";
import { registerSchema, RegisterFormData } from "@/lib/validations/auth";

export function RegisterForm() {
  const { login } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      const response = await authService.register(data);
      login(response.accessToken, response.refreshToken, response.user);
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        setErrorMessage(
          error.response?.data?.message ||
            "Ocorreu um erro ao criar sua conta.",
        );
      } else {
        setErrorMessage("Ocorreu um erro inesperado.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 space-y-6 bg-zinc-900 rounded-xl shadow-xl border border-zinc-800">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-white">
          Criar Conta no Bookr
        </h1>
        <p className="text-sm text-zinc-400">
          Junte-se à comunidade de leitores
        </p>
      </div>

      {errorMessage && (
        <div className="p-3 text-sm text-red-400 bg-red-950/50 rounded-lg border border-red-900/60">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1">
            Nome Completo
          </label>
          <input
            type="text"
            {...register("name")}
            placeholder="Seu nome"
            className="w-full px-4 py-2.5 bg-zinc-800/60 border border-zinc-700/80 rounded-lg text-zinc-100 placeholder-zinc-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
          />
          {errors.name && (
            <p className="mt-1 text-xs text-red-400">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1">
            Nome de Usuário
          </label>
          <input
            type="text"
            {...register("username")}
            placeholder="seu_username"
            className="w-full px-4 py-2.5 bg-zinc-800/60 border border-zinc-700/80 rounded-lg text-zinc-100 placeholder-zinc-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
          />
          {errors.username && (
            <p className="mt-1 text-xs text-red-400">
              {errors.username.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1">
            E-mail
          </label>
          <input
            type="email"
            {...register("email")}
            placeholder="seu@email.com"
            className="w-full px-4 py-2.5 bg-zinc-800/60 border border-zinc-700/80 rounded-lg text-zinc-100 placeholder-zinc-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
          />
          {errors.email && (
            <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1">
            Senha
          </label>
          <input
            type="password"
            {...register("password")}
            placeholder="••••••••"
            className="w-full px-4 py-2.5 bg-zinc-800/60 border border-zinc-700/80 rounded-lg text-zinc-100 placeholder-zinc-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
          />
          {errors.password && (
            <p className="mt-1 text-xs text-red-400">
              {errors.password.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg shadow-md transition-colors disabled:opacity-50 active:scale-[0.99]"
        >
          {isLoading ? "Criando conta..." : "Cadastrar"}
        </button>
      </form>

      <p className="text-center text-sm text-zinc-400">
        Já possui uma conta?{" "}
        <Link
          href="/login"
          className="font-medium text-indigo-400 hover:text-indigo-300 hover:underline"
        >
          Faça login
        </Link>
      </p>
    </div>
  );
}
