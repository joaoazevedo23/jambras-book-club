"use client";

import React, { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X, Loader2, Camera, User as UserIcon } from "lucide-react";
import Image from "next/image";
import { userService } from "@/services/users.service";
import { User } from "@/types/user";
import {
  updateProfileSchema,
  UpdateProfileFormData,
  changePasswordSchema,
  ChangePasswordFormData,
} from "@/lib/validations/profile";
import { AxiosError } from "axios";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProfile: User;
}

export function EditProfileModal({
  isOpen,
  onClose,
  currentProfile,
}: EditProfileModalProps) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"DATA" | "PASSWORD">("DATA");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getAvatarUrl = (url: string | null) => {
    if (!url) return null;
    if (url.startsWith("http")) return url;
    return `http://localhost:3001${url}`;
  };

  const profileForm = useForm<UpdateProfileFormData>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: currentProfile.name,
      username: currentProfile.username,
      bio: currentProfile.bio || "",
    },
  });

  const passwordForm = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
  });

  const handleClose = () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    onClose();
  };

  const handleTabChange = (tab: "DATA" | "PASSWORD") => {
    setActiveTab(tab);
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const updateProfileMutation = useMutation({
    mutationFn: (data: UpdateProfileFormData) =>
      userService.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      setSuccessMessage("Perfil atualizado com sucesso!");
      setTimeout(handleClose, 1500);
    },
    onError: (error: unknown) => {
      if (error instanceof AxiosError) {
        setErrorMessage(
          error.response?.data?.message || "Erro ao atualizar perfil.",
        );
      }
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: (data: ChangePasswordFormData) =>
      userService.changePassword(data),
    onSuccess: () => {
      setSuccessMessage("Palavra-passe alterada com sucesso!");
      passwordForm.reset();
      setTimeout(handleClose, 1500);
    },
    onError: (error: unknown) => {
      if (error instanceof AxiosError) {
        setErrorMessage(
          error.response?.data?.message || "Erro ao alterar palavra-passe.",
        );
      }
    },
  });

  const avatarMutation = useMutation({
    mutationFn: (file: File) => userService.updateAvatar(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      queryClient.invalidateQueries({ queryKey: ["social-feed"] });
      setSuccessMessage("Foto de perfil atualizada!");
    },
    onError: () => {
      setErrorMessage("Erro ao enviar imagem. Verifique se tem menos de 2MB.");
    },
  });

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setErrorMessage(null);
      setSuccessMessage(null);
      avatarMutation.mutate(file);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 w-full max-w-md rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">
            Configurações de Perfil
          </h2>
          <button
            onClick={handleClose}
            className="text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex border-b border-zinc-800">
          <button
            onClick={() => handleTabChange("DATA")}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === "DATA"
                ? "text-indigo-400 border-b-2 border-indigo-500 bg-zinc-800/20"
                : "text-zinc-400 hover:text-zinc-300 bg-zinc-900"
            }`}
          >
            Dados Pessoais
          </button>
          <button
            onClick={() => handleTabChange("PASSWORD")}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === "PASSWORD"
                ? "text-indigo-400 border-b-2 border-indigo-500 bg-zinc-800/20"
                : "text-zinc-400 hover:text-zinc-300 bg-zinc-900"
            }`}
          >
            Palavra-passe
          </button>
        </div>

        <div className="px-5 pt-4">
          {errorMessage && (
            <div className="p-3 text-sm text-red-400 bg-red-950/50 rounded-lg border border-red-900/60 mb-2">
              {errorMessage}
            </div>
          )}
          {successMessage && (
            <div className="p-3 text-sm text-emerald-400 bg-emerald-950/50 rounded-lg border border-emerald-900/60 mb-2">
              {successMessage}
            </div>
          )}
        </div>

        <div className="p-5 overflow-y-auto max-h-[60vh]">
          {activeTab === "DATA" ? (
            <div className="space-y-6">
              <div className="flex flex-col items-center space-y-3">
                <div className="w-20 h-20 bg-zinc-800 rounded-full relative overflow-hidden group border border-zinc-700">
                  {currentProfile.avatarUrl ? (
                    <Image
                      src={getAvatarUrl(currentProfile.avatarUrl)!}
                      alt="Avatar"
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <UserIcon className="w-8 h-8 text-zinc-500" />
                    </div>
                  )}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    {avatarMutation.isPending ? (
                      <Loader2 className="w-5 h-5 text-white animate-spin" />
                    ) : (
                      <Camera className="w-6 h-6 text-white" />
                    )}
                  </div>
                </div>
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleAvatarChange}
                />
                <span className="text-xs text-zinc-500">
                  Clique na foto para alterar (Máx 2MB)
                </span>
              </div>

              <form
                id="profile-form"
                onSubmit={profileForm.handleSubmit((d) =>
                  updateProfileMutation.mutate(d),
                )}
                className="space-y-4"
              >
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">
                    Nome
                  </label>
                  <input
                    type="text"
                    {...profileForm.register("name")}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 focus:ring-1 focus:ring-indigo-500 outline-none text-sm"
                  />
                  {profileForm.formState.errors.name && (
                    <p className="mt-1 text-[10px] text-red-400">
                      {profileForm.formState.errors.name.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">
                    Nome de Utilizador
                  </label>
                  <input
                    type="text"
                    {...profileForm.register("username")}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 focus:ring-1 focus:ring-indigo-500 outline-none text-sm"
                  />
                  {profileForm.formState.errors.username && (
                    <p className="mt-1 text-[10px] text-red-400">
                      {profileForm.formState.errors.username.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1">
                    Biografia
                  </label>
                  <textarea
                    {...profileForm.register("bio")}
                    rows={3}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 focus:ring-1 focus:ring-indigo-500 outline-none text-sm resize-none"
                  />
                  {profileForm.formState.errors.bio && (
                    <p className="mt-1 text-[10px] text-red-400">
                      {profileForm.formState.errors.bio.message}
                    </p>
                  )}
                </div>
              </form>
            </div>
          ) : (
            <form
              id="password-form"
              onSubmit={passwordForm.handleSubmit((d) =>
                changePasswordMutation.mutate(d),
              )}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">
                  Palavra-passe Atual
                </label>
                <input
                  type="password"
                  {...passwordForm.register("oldPassword")}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 focus:ring-1 focus:ring-indigo-500 outline-none text-sm"
                />
                {passwordForm.formState.errors.oldPassword && (
                  <p className="mt-1 text-[10px] text-red-400">
                    {passwordForm.formState.errors.oldPassword.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">
                  Nova Palavra-passe
                </label>
                <input
                  type="password"
                  {...passwordForm.register("newPassword")}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 focus:ring-1 focus:ring-indigo-500 outline-none text-sm"
                />
                {passwordForm.formState.errors.newPassword && (
                  <p className="mt-1 text-[10px] text-red-400">
                    {passwordForm.formState.errors.newPassword.message}
                  </p>
                )}
              </div>
            </form>
          )}
        </div>

        <div className="p-5 border-t border-zinc-800 flex justify-end">
          <button
            type="submit"
            form={activeTab === "DATA" ? "profile-form" : "password-form"}
            disabled={
              updateProfileMutation.isPending ||
              changePasswordMutation.isPending
            }
            className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg shadow-md transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            {updateProfileMutation.isPending ||
            changePasswordMutation.isPending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <span>Guardar Alterações</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
