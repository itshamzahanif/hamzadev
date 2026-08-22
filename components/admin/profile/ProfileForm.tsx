"use client";

import {
  profilePersonalInfoFields,
  profileSocialFields,
} from "@/data/constants";
import { useState } from "react";
import { FieldValues, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ProfileSchema } from "@/schemas/schemas";
import { updateProfile } from "@/actions/profile";
import { toast } from "react-toastify";
import { ProfileType } from "@/types/types";

type ProfileFormData = z.infer<typeof ProfileSchema>;

const ProfileForm = ({ profile }: { profile: ProfileType | null }) => {
  const [isSaving, setIsSaving] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(ProfileSchema),
    defaultValues: {
      name: profile?.name || "",
      firstName: profile?.firstName || "",
      professionalTitle: profile?.professionalTitle || "",
      tagline: profile?.tagline || "",
      location: profile?.location || "",
      email: profile?.email || "",
      github: profile?.github || "",
      linkedin: profile?.linkedin || "",
      resumeLink: profile?.resumeLink || "",
    },
  });

  const onSubmit = async (data: FieldValues) => {
    setIsSaving(true);
    const update = await updateProfile({
      name: data.name,
      firstName: data.firstName,
      professionalTitle: data.professionalTitle,
      tagline: data.tagline,
      location: data.location,
      email: data.email,
      github: data.github,
      linkedin: data.linkedin,
      resumeLink: data.resumeLink,
    });

    setIsSaving(false);

    if (update.success) {
      toast.success("Profile updated successfully");
    } else {
      toast.error("Error updating profile");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Personal Information */}
      <section className="rounded-xl border border-slate-800 bg-slate-900/70 p-1 lg:p-5">
        <div className="border-b border-slate-800 px-5 py-4">
          <h2 className="text-sm font-semibold text-white">
            Personal Information
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Your basic professional information.
          </p>
        </div>

        <div className="grid gap-5 p-5 lg:p-6">
          {/* Name */}
          {profilePersonalInfoFields.map((field, i) => {
            return (
              <div key={i}>
                <label
                  htmlFor={field.name}
                  className="mb-2 block text-sm font-medium text-white"
                >
                  {field.label}
                </label>

                <input
                  {...register(field.name)}
                  type="text"
                  placeholder={field.placeholder}
                  className="w-full rounded-lg border border-slate-700 px-3 py-2.5 text-sm text-slate-400 outline-none transition focus:border-slate-800 focus:ring-1 focus:ring-gray-900 placeholder:text-slate-600"
                />
                {errors?.[field.name] && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors?.[field.name]?.message}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Social & Links */}
      <section className="rounded-xl border border-slate-800 bg-slate-900/70 p-1 lg:p-5">
        <div className="border-b border-slate-800 px-5 py-4">
          <h2 className="text-sm font-semibold text-white">Social & Links</h2>

          <p className="mt-1 text-xs text-slate-500">
            Links to your professional profiles and resume.
          </p>
        </div>

        <div className="space-y-5 p-5 lg:p-6">
          {profileSocialFields.map((field, i) => (
            <div key={i}>
              <label
                htmlFor={field.name}
                className="mb-2 block text-sm font-medium text-white"
              >
                {field.label}
              </label>

              <input
                {...register(field.name)}
                placeholder={field.placeholder}
                className="w-full rounded-lg border border-slate-700 px-3 py-2.5 text-sm text-slate-400 outline-none transition focus:border-slate-800 focus:ring-1 focus:ring-gray-900 placeholder:text-slate-600"
              />
              {errors?.[field.name] && (
                <p className="text-red-500 text-xs mt-1">
                  {errors?.[field.name]?.message}
                </p>
              )}
            </div>
          ))}
        </div>
        {/* Actions */}
        <div className="flex justify-end gap-3 mt-5">
          {/* <button
          type="button"
          className="relative cursor-pointer inline-flex items-center gap-2 overflow-hidden rounded-xl border border-brand-600 px-4 py-2.5 text-sm font-medium text-brand-400 hover:bg-brand-600 hover:text-white shadow-glow transition-transform hover:scale-[1.03]"
        >
          Cancel
        </button> */}

          <button
            type="submit"
            disabled={isSaving}
            className="relative cursor-pointer inline-flex items-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 px-5 py-3 text-sm font-semibold text-white shadow-glow transition-transform hover:scale-[1.03] active:scale-95 disabled:cursor-not-allowed disabled:opacity-80"
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </section>
    </form>
  );
};

export default ProfileForm;
