"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  GripVertical,
  Loader2,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { createExperience, updateExperience } from "@/actions/experience";

import SkillMultiSelect from "./SkillMultiSelect";
import { experienceFormSchema } from "@/schemas/schemas";

type FormValues = z.infer<typeof experienceFormSchema>;

type Skill = {
  id: number;
  name: string;
};

type ExperienceData = {
  id?: number;
  jobTitle: string;
  jobSummary: string;
  employer: string;
  location: string;
  startDate: number;
  endDate: number | null;
  isContinued: boolean;
  skillIds: number[];
  bullets: {
    description: string;
  }[];
};

type Props = {
  skills: Skill[];
  experience?: ExperienceData;
};

export default function ExperienceForm({ skills, experience }: Props) {
  const router = useRouter();

  const isEdit = Boolean(experience?.id);

  const [serverError, setServerError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(experienceFormSchema),
    defaultValues: {
      jobTitle: experience?.jobTitle ?? "",
      employer: experience?.employer ?? "",
      location: experience?.location ?? "",
      startDate: experience?.startDate ?? new Date().getFullYear(),
      endDate: experience?.endDate ?? null,
      isContinued: experience?.isContinued ?? false,
      jobSummary: experience?.jobSummary ?? "",
      skillIds: experience?.skillIds ?? [],
      bullets: experience?.bullets?.length
        ? experience.bullets
        : [{ description: "" }],
    },
  });

  const {
    fields: bulletFields,
    append,
    remove,
  } = useFieldArray({
    control,
    name: "bullets",
  });

  const isContinued = useWatch({
    control,
    name: "isContinued",
  });

  const selectedSkillIds = useWatch({
    control,
    name: "skillIds",
  });

  useEffect(() => {
    if (isContinued) {
      setValue("endDate", null);
    }
  }, [isContinued, setValue]);

  async function onSubmit(data: FormValues) {
    setServerError("");
    setIsSubmitting(true);

    try {
      const result = isEdit
        ? await updateExperience(experience!.id!, data)
        : await createExperience(data);

      if (!result.success) {
        setServerError(result.error);
        return;
      }

      router.push("/admin/experience");
      router.refresh();
    } catch (error) {
      console.error(error);

      setServerError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Link
          href="/admin/experience"
          className="mt-0.5 rounded-lg border border-slate-800 p-2 text-slate-400 transition hover:bg-slate-900 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>

        <div>
          <h1 className="text-xl font-semibold text-white">
            {isEdit ? "Edit Experience" : "Add Experience"}
          </h1>

          <p className="mt-1 text-sm text-slate-400">
            {isEdit
              ? "Update this position in your professional history."
              : "Add a new position to your professional history."}
          </p>
        </div>
      </div>

      {/* Server error */}
      {serverError && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {serverError}
        </div>
      )}

      {/* Position Information */}
      <section className="rounded-xl border border-slate-800 bg-slate-900/70 px-1 lg:px-4 py-5">
        <div className="border-b border-slate-800 px-5 py-4">
          <h2 className="text-sm font-semibold text-white">
            Position Information
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Basic information about this position.
          </p>
        </div>

        <div className="grid gap-5 p-5 lg:p-6">
          {/* Job title */}
          <div>
            <label
              htmlFor="jobTitle"
              className="mb-1.5 block text-sm font-medium text-slate-300"
            >
              Job Title
            </label>

            <input
              {...register("jobTitle")}
              id="jobTitle"
              type="text"
              placeholder="Full Stack Developer"
              className={`w-full rounded-lg border border-slate-700 px-3 py-2.5 text-sm text-slate-400 outline-none transition focus:border-slate-800 focus:ring-1 focus:ring-gray-900 placeholder:text-slate-600 ${
                errors.jobTitle
                  ? "border-red-500/70"
                  : "border-slate-700 focus:border-slate-500"
              }`}
            />

            {errors.jobTitle && (
              <p className="mt-1.5 text-xs text-red-400">
                {errors.jobTitle.message}
              </p>
            )}
          </div>

          {/* Employer */}
          <div>
            <label
              htmlFor="employer"
              className="mb-1.5 block text-sm font-medium text-slate-300"
            >
              Employer
            </label>

            <input
              {...register("employer")}
              id="employer"
              type="text"
              placeholder="Company Name"
              className={`w-full rounded-lg border border-slate-700 px-3 py-2.5 text-sm text-slate-400 outline-none transition focus:border-slate-800 focus:ring-1 focus:ring-gray-900 placeholder:text-slate-600 ${
                errors.employer
                  ? "border-red-500/70"
                  : "border-slate-700 focus:border-slate-500"
              }`}
            />

            {errors.employer && (
              <p className="mt-1.5 text-xs text-red-400">
                {errors.employer.message}
              </p>
            )}
          </div>

          {/* Location */}
          <div>
            <label
              htmlFor="location"
              className="mb-1.5 block text-sm font-medium text-slate-300"
            >
              Location
            </label>

            <input
              {...register("location")}
              id="location"
              type="text"
              placeholder="Lahore, Pakistan"
              className={`w-full rounded-lg border border-slate-700 px-3 py-2.5 text-sm text-slate-400 outline-none transition focus:border-slate-800 focus:ring-1 focus:ring-gray-900 placeholder:text-slate-600 ${
                errors.location
                  ? "border-red-500/70"
                  : "border-slate-700 focus:border-slate-500"
              }`}
            />

            {errors.location && (
              <p className="mt-1.5 text-xs text-red-400">
                {errors.location.message}
              </p>
            )}
          </div>

          {/* Start year */}
          <div>
            <label
              htmlFor="startDate"
              className="mb-1.5 block text-sm font-medium text-slate-300"
            >
              Start Year
            </label>

            <input
              {...register("startDate", {
                valueAsNumber: true,
              })}
              id="startDate"
              type="number"
              min={1900}
              max={2100}
              className={`w-full rounded-lg border border-slate-700 px-3 py-2.5 text-sm text-slate-400 outline-none transition focus:border-slate-800 focus:ring-1 focus:ring-gray-900 placeholder:text-slate-600 ${
                errors.startDate
                  ? "border-red-500/70"
                  : "border-slate-700 focus:border-slate-500"
              }`}
            />

            {errors.startDate && (
              <p className="mt-1.5 text-xs text-red-400">
                {errors.startDate.message}
              </p>
            )}
          </div>

          {/* Current position */}
          <div className="md:col-span-2">
            <label className="flex cursor-pointer items-center gap-3">
              <input
                {...register("isContinued")}
                type="checkbox"
                className="h-4 w-4 rounded border-slate-700 bg-slate-950 accent-white"
              />

              <span className="text-sm text-slate-300">
                Currently working here
              </span>
            </label>
          </div>

          {/* End year */}
          <div>
            <label
              htmlFor="endDate"
              className="mb-1.5 block text-sm font-medium text-slate-300"
            >
              End Year
            </label>

            <input
              {...register("endDate", {
                setValueAs: (value) => {
                  if (value === "" || value == null) {
                    return null;
                  }

                  return Number(value);
                },
              })}
              id="endDate"
              type="number"
              min={1900}
              max={2100}
              readOnly={isContinued}
              placeholder={isContinued ? "Present" : "2026"}
              className={`w-full rounded-lg border border-slate-700 px-3 py-2.5 text-sm text-slate-400 outline-none transition focus:border-slate-800 focus:ring-1 focus:ring-gray-900 placeholder:text-slate-600 ${
                errors.endDate
                  ? "border-red-500/70"
                  : "border-slate-700 focus:border-slate-500"
              }`}
            />

            {errors.endDate && (
              <p className="mt-1.5 text-xs text-red-400">
                {errors.endDate.message}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Summary */}
      <section className="rounded-xl border border-slate-800 bg-slate-900/70 px-1 lg:px-4 py-5">
        <div className="border-b border-slate-800 px-5 py-4">
          <h2 className="text-sm font-semibold text-white">Job Summary</h2>

          <p className="mt-1 text-xs text-slate-500">
            Give a short overview of your role.
          </p>
        </div>

        <div className=" p-5 lg:p-6">
          <textarea
            {...register("jobSummary")}
            rows={5}
            placeholder="Briefly describe your role, responsibilities, and the type of work you performed..."
            className={`w-full rounded-lg border border-slate-700 px-3 py-2.5 text-sm text-slate-400 outline-none transition focus:border-slate-800 focus:ring-1 focus:ring-gray-900 placeholder:text-slate-600 ${
              errors.jobSummary
                ? "border-red-500/70"
                : "border-slate-700 focus:border-slate-500"
            }`}
          />

          {errors.jobSummary && (
            <p className="mt-1.5 text-xs text-red-400">
              {errors.jobSummary.message}
            </p>
          )}
        </div>
      </section>

      {/* Stack */}
      <section className="rounded-xl border border-slate-800 bg-slate-900/70 px-1 lg:px-4 py-5">
        <div className="border-b border-slate-800 px-5 py-4">
          <h2 className="text-sm font-semibold text-white">Tech Stack</h2>

          <p className="mt-1 text-xs text-slate-500">
            Select the technologies and tools used in this role.
          </p>
        </div>

        <div className=" p-5 lg:p-6">
          <Controller
            name="skillIds"
            control={control}
            render={({ field }) => (
              <SkillMultiSelect
                skills={skills}
                value={field.value}
                onChange={field.onChange}
                error={errors.skillIds?.message}
              />
            )}
          />

          {selectedSkillIds.length > 0 && (
            <p className="mt-2 text-xs text-slate-600">
              {selectedSkillIds.length}{" "}
              {selectedSkillIds.length === 1 ? "skill" : "skills"} selected
            </p>
          )}
        </div>
      </section>

      {/* Responsibilities */}
      <section className="rounded-xl border border-slate-800 bg-slate-900/70 px-1 lg:px-4 py-5">
        <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
          <div>
            <h2 className="text-sm font-semibold text-white">
              Responsibilities
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Add the main responsibilities or achievements.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              append({
                description: "",
              })
            }
            className="relative inline-flex cursor-pointer items-center gap-2 overflow-hidden rounded-xl border border-brand-600 px-2.5 py-1.5 text-sm font-medium text-brand-400 shadow-glow transition-transform hover:scale-[1.03] hover:bg-brand-600 hover:text-white"
          >
            <Plus className="h-3.5 w-3.5" />
            Add
          </button>
        </div>

        <div className="space-y-3 p-5 lg:p-6">
          {bulletFields.map((field, index) => (
            <div key={field.id} className="flex items-start gap-2">
              {/* Future drag handle */}
              {/* <button
                type="button"
                disabled
                title="Drag to reorder"
                className="mt-2.5 shrink-0 cursor-grab text-slate-700"
              >
                <GripVertical className="h-4 w-4" />
              </button> */}

              <div className="min-w-0 flex-1">
                <input
                  {...register(`bullets.${index}.description`)}
                  type="text"
                  placeholder="Describe a responsibility or achievement..."
                  className={`w-full rounded-lg border border-slate-700 px-3 py-2.5 text-sm text-slate-400 outline-none transition focus:border-slate-800 focus:ring-1 focus:ring-gray-900 placeholder:text-slate-600 ${
                    errors.bullets?.[index]?.description
                      ? "border-red-500/70"
                      : "border-slate-700 focus:border-slate-500"
                  }`}
                />

                {errors.bullets?.[index]?.description && (
                  <p className="mt-1 text-xs text-red-400">
                    {errors.bullets[index]?.description?.message}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() => remove(index)}
                disabled={bulletFields.length === 1}
                className="mt-1.5 cursor-pointer rounded-md p-2 text-slate-500 transition hover:bg-slate-900 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-30"
                title="Remove responsibility"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}

          {bulletFields.length === 0 && (
            <div className="rounded-lg border border-dashed border-slate-800 py-8 text-center">
              <p className="text-sm text-slate-500">
                No responsibilities added.
              </p>

              <button
                type="button"
                onClick={() =>
                  append({
                    description: "",
                  })
                }
                className="mt-2 text-sm text-slate-300 hover:text-white hover:underline"
              >
                Add one
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <div className="flex items-center justify-end gap-3 border-t border-slate-800 pt-5">
        <Link
          href="/admin/experience"
          className="relative inline-flex cursor-pointer items-center gap-2 overflow-hidden rounded-xl border border-brand-600 px-4 py-2.5 text-sm font-medium text-brand-400 shadow-glow transition-transform hover:scale-[1.03] hover:bg-brand-600 hover:text-white"
        >
          Cancel
        </Link>

        <button
          type="submit"
          disabled={isSubmitting}
          className="relative inline-flex cursor-pointer items-center gap-2 overflow-hidden rounded-xl bg-linear-to-r from-brand-500 to-brand-600 px-5 py-3 text-sm font-semibold text-white shadow-glow transition-transform hover:scale-[1.03] active:scale-95 disabled:cursor-not-allowed disabled:opacity-80"
        >
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}

          {isSubmitting
            ? "Saving..."
            : isEdit
              ? "Save Changes"
              : "Save Experience"}
        </button>
      </div>
    </form>
  );
}
