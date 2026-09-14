"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { AxiosError } from "axios";
import { useAuth } from "@/context/AuthContext";
import { authService } from "@/services/auth.service";
import { loginSchema, LoginFormData } from "@/lib/validations/auth";

export function LoginForm() {
  const { login } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      const response = await authService.login(data);
      login(response.accessToken, response.refreshToken, response.user);
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        setErrorMessage(
          error.response?.data?.message ||
            "Falha ao fazer login. Verifique suas credenciais.",
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
        <h1 className="text-3xl font-bold tracking-tight text-white">Bookr</h1>
        <p className="text-sm text-zinc-400">
          Entre na sua conta para continuar
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
            E-mail ou Usuário
          </label>
          <input
            type="text"
            {...register("login")}
            placeholder="seu@email.com ou username"
            className="w-full px-4 py-2.5 bg-zinc-800/60 border border-zinc-700/80 rounded-lg text-zinc-100 placeholder-zinc-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
          />
          {errors.login && (
            <p className="mt-1 text-xs text-red-400">{errors.login.message}</p>
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
          {isLoading ? "Entrando..." : "Entrar"}
        </button>
      </form>

      <p className="text-center text-sm text-zinc-400">
        Ainda não tem uma conta?{" "}
        <Link
          href="/register"
          className="font-medium text-indigo-400 hover:text-indigo-300 hover:underline"
        >
          Cadastre-se
        </Link>
      </p>
    </div>
  );
}
