"use client";

import { ArrowLeft, Loader2, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { projectSchema } from "@/schemas/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import TechMultiSelect from "./TechMultiSelect";
import slugify from "react-slugify";
import { addProject, updateProject } from "@/actions/projects";

type FormValues = z.infer<typeof projectSchema>;

type Skill = {
  id: number;
  name: string;
};

type Project = {
  description: string;
  id: number;
  title: string;
  slug: string;
  tagline: string;
  codePreviewName: string | null;
  previewCode: string | null;
  codeLanguage: string | null;
  liveUrl: string | null;
  repoUrl: string | null;
  clientProject: boolean;
  accent: string | null;
  icon: string | null;
  technologies: string[];
  features: { content: string }[];
  highlights: { label: string; value: string }[];
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
};

const ProjectsForm = ({
  skills,
  project,
}: {
  skills: Skill[];
  project?: Project;
}) => {
  const router = useRouter();
  const isEdit = Boolean(project?.id);

  const [serverError, setServerError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      slug: project?.slug || "",
      title: project?.title || "",
      tagline: project?.tagline || "",
      description: project?.description || "",
      codePreviewName: project?.codePreviewName || "",
      previewCode: project?.previewCode || "",
      codeLanguage: project?.codeLanguage || "",
      liveUrl: project?.liveUrl || "",
      repoUrl: project?.repoUrl || "",
      clientProject: project?.clientProject || false,
      technologies: project?.technologies || [],
      features: project?.features?.length
        ? project?.features
        : [{ content: "" }],
      highlights: project?.highlights?.length
        ? project?.highlights
        : [
            {
              label: "",
              value: "",
            },
          ],
    },
  });

  const {
    fields: featureFields,
    append,
    remove,
  } = useFieldArray({
    control,
    name: "features",
  });

  const {
    fields: highlightFields,
    append: appendHighlight,
    remove: removeHighlight,
  } = useFieldArray({
    control,
    name: "highlights",
  });

  const isClientProject = useWatch({
    control,
    name: "clientProject",
  });

  const selectedTechnologies = useWatch({
    control,
    name: "technologies",
  });

  useEffect(() => {
    if (isClientProject) {
      setValue("repoUrl", "", {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
  }, [isClientProject, setValue]);

  const onSubmit = async (data: FormValues) => {
    setServerError("");
    setIsSubmitting(true);

    try {
      const result = isEdit
        ? await updateProject(project!.id, data)
        : await addProject(data);

      if (!result.success) {
        setServerError(
          result.error ||
            (isEdit
              ? "Error updating the project"
              : "Error adding the project"),
        );
        return;
      }

      router.push("/admin/projects");
      router.refresh();
    } catch (error) {
      console.error(error);

      setServerError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Link
          href="/admin/projects"
          className="mt-0.5 rounded-lg border border-slate-800 p-2 text-slate-400 transition hover:bg-slate-900 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>

        <div>
          <h1 className="text-xl font-semibold text-white">
            {isEdit ? "Edit Project" : "Add Project"}
          </h1>

          <p className="mt-1 text-sm text-slate-400">
            {isEdit ? "Update this project." : "Add a new completed project."}
          </p>
        </div>
      </div>

      {/* Server error */}
      {serverError && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {serverError}
        </div>
      )}

      {/* Project Information */}
      <section className="rounded-xl border border-slate-800 bg-slate-900/70 px-1 lg:px-4 py-5">
        <div className="border-b border-slate-800 px-5 py-4">
          <h2 className="text-sm font-semibold text-white">
            Project Information
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Basic information about this project.
          </p>
        </div>

        <div className="grid gap-5 grid-col-1 lg:grid-cols-2 p-5 lg:p-6">
          {/* Project title */}
          <div>
            <label
              htmlFor="projectTitle"
              className="mb-1.5 block text-sm font-medium text-slate-300"
            >
              Project Title
            </label>

            <input
              {...register("title", {
                onChange: (e) => {
                  if (!isEdit) {
                    setValue("slug", slugify(e.target.value));
                  }
                },
              })}
              id="projectTitle"
              type="text"
              placeholder="Full Stack Project"
              className={`w-full rounded-lg border border-slate-700 px-3 py-2.5 text-sm text-slate-400 outline-none transition focus:border-slate-800 focus:ring-1 focus:ring-gray-900 placeholder:text-slate-600 ${
                errors.title
                  ? "border-red-500/70"
                  : "border-slate-700 focus:border-slate-500"
              }`}
            />

            {errors?.title && (
              <p className="mt-1.5 text-xs text-red-400">
                {errors?.title?.message}
              </p>
            )}
          </div>

          {/* Slug */}
          <div>
            <label
              htmlFor="slug"
              className="mb-1.5 block text-sm font-medium text-slate-300"
            >
              Slug
            </label>

            <input
              {...register("slug")}
              id="slug"
              type="text"
              placeholder="Project slug"
              className={`w-full rounded-lg border border-slate-700 px-3 py-2.5 text-sm text-slate-400 outline-none transition focus:border-slate-800 focus:ring-1 focus:ring-gray-900 placeholder:text-slate-600 ${
                errors.slug
                  ? "border-red-500/70"
                  : "border-slate-700 focus:border-slate-500"
              }`}
            />

            {errors.slug && (
              <p className="mt-1.5 text-xs text-red-400">
                {errors.slug.message}
              </p>
            )}
          </div>
        </div>
        <div className="px-5 lg:px-6">
          {/* Tagline */}
          <div>
            <label
              htmlFor="tagline"
              className="mb-1.5 block text-sm font-medium text-slate-300"
            >
              Tagline
            </label>

            <input
              {...register("tagline")}
              id="tagline"
              type="text"
              placeholder="Project tagline"
              className={`w-full rounded-lg border border-slate-700 px-3 py-2.5 text-sm text-slate-400 outline-none transition focus:border-slate-800 focus:ring-1 focus:ring-gray-900 placeholder:text-slate-600 ${
                errors.tagline
                  ? "border-red-500/70"
                  : "border-slate-700 focus:border-slate-500"
              }`}
            />

            {errors.tagline && (
              <p className="mt-1.5 text-xs text-red-400">
                {errors.tagline.message}
              </p>
            )}
          </div>
        </div>
        <div className="grid gap-5 p-5 lg:p-6">
          {/* client Project */}
          <div className="md:col-span-2 w-max">
            <label className="flex cursor-pointer items-center gap-3">
              <input
                {...register("clientProject")}
                type="checkbox"
                className="h-4 w-4 rounded border-slate-700 bg-slate-950 accent-white"
              />

              <span className="text-sm text-slate-300">
                Is this client project?
              </span>
            </label>
          </div>

          {/* live Url */}
          <div>
            <label
              htmlFor="liveUrl"
              className="mb-1.5 block text-sm font-medium text-slate-300"
            >
              Live Url
            </label>

            <input
              {...register("liveUrl")}
              id="liveUrl"
              type="text"
              placeholder="https://xyz.com"
              className={`w-full rounded-lg border border-slate-700 px-3 py-2.5 text-sm text-slate-400 outline-none transition focus:border-slate-800 focus:ring-1 focus:ring-gray-900 placeholder:text-slate-600 ${
                errors.liveUrl
                  ? "border-red-500/70"
                  : "border-slate-700 focus:border-slate-500"
              }`}
            />

            {errors.liveUrl && (
              <p className="mt-1.5 text-xs text-red-400">
                {errors.liveUrl.message}
              </p>
            )}
          </div>

          {/* repoUrl */}
          <div>
            <label
              htmlFor="repoUrl"
              className="mb-1.5 block text-sm font-medium text-slate-300"
            >
              Repo Url
            </label>

            <input
              {...register("repoUrl")}
              id="repoUrl"
              type="text"
              readOnly={isClientProject}
              placeholder={
                isClientProject ? "Client Project" : "https://github.com/xyz"
              }
              className={`w-full rounded-lg border border-slate-700 px-3 py-2.5 text-sm text-slate-400 outline-none transition focus:border-slate-800 focus:ring-1 focus:ring-gray-900 placeholder:text-slate-600 ${
                errors.repoUrl
                  ? "border-red-500/70"
                  : "border-slate-700 focus:border-slate-500"
              }`}
            />

            {errors.repoUrl && (
              <p className="mt-1.5 text-xs text-red-400">
                {errors.repoUrl.message}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Description */}
      <section className="rounded-xl border border-slate-800 bg-slate-900/70 px-1 lg:px-4 py-5">
        <div className="border-b border-slate-800 px-5 py-4">
          <h2 className="text-sm font-semibold text-white">
            Project Description
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Give a short description of this project.
          </p>
        </div>

        <div className=" p-5 lg:p-6">
          <textarea
            {...register("description")}
            rows={5}
            placeholder="Briefly describe your project..."
            id="desc"
            className={`w-full rounded-lg border border-slate-700 px-3 py-2.5 text-sm text-slate-400 outline-none transition focus:border-slate-800 focus:ring-1 focus:ring-gray-900 placeholder:text-slate-600 ${
              errors.description
                ? "border-red-500/70"
                : "border-slate-700 focus:border-slate-500"
            }`}
          />

          {errors.description && (
            <p className="mt-1.5 text-xs text-red-400">
              {errors.description.message}
            </p>
          )}
        </div>
      </section>

      {/* Preview Code */}
      <section className="rounded-xl border border-slate-800 bg-slate-900/70 px-1 lg:px-4 py-5">
        <div className="border-b border-slate-800 px-5 py-4">
          <h2 className="text-sm font-semibold text-white">Preview Code</h2>

          <p className="mt-1 text-xs text-slate-500">
            Preview code related to this project.
          </p>
        </div>

        <div className="grid gap-5 grid-cols-1 lg:grid-cols-2 p-5 lg:p-6">
          {/* Preview Code name */}
          <div>
            <label
              htmlFor="previewCodeName"
              className="mb-1.5 block text-sm font-medium text-slate-300"
            >
              Preview Code Name
            </label>

            <input
              {...register("codePreviewName")}
              id="previewCodeName"
              type="text"
              placeholder="Full Stack Project"
              className={`w-full rounded-lg border border-slate-700 px-3 py-2.5 text-sm text-slate-400 outline-none transition focus:border-slate-800 focus:ring-1 focus:ring-gray-900 placeholder:text-slate-600 ${
                errors.codePreviewName
                  ? "border-red-500/70"
                  : "border-slate-700 focus:border-slate-500"
              }`}
            />

            {errors?.codePreviewName && (
              <p className="mt-1.5 text-xs text-red-400">
                {errors?.codePreviewName?.message}
              </p>
            )}
          </div>

          {/* Preview Code Language */}
          <div>
            <label
              htmlFor="codeLanguage"
              className="mb-1.5 block text-sm font-medium text-slate-300"
            >
              Preview Code Language
            </label>

            <select
              {...register("codeLanguage")}
              id="codeLanguage"
              className={`w-full rounded-lg border border-slate-700 px-3 py-2.5 text-xs text-slate-400 outline-none transition focus:border-slate-800 focus:ring-1 focus:ring-gray-900 placeholder:text-slate-600 ${
                errors.codeLanguage
                  ? "border-red-500/70"
                  : "border-slate-700 focus:border-slate-500"
              }`}
            >
              <option value="">Select Language</option>
              <option value="javascript">JavaScript</option>
              <option value="php">PHP</option>
              <option value="python">Python</option>
            </select>

            {errors.codeLanguage && (
              <p className="mt-1.5 text-xs text-red-400">
                {errors.codeLanguage.message}
              </p>
            )}
          </div>
        </div>
        <div className=" p-5 lg:p-6">
          <label
            htmlFor="previewCode"
            className="mb-1.5 block text-sm font-medium text-slate-300"
          >
            Preview Code
          </label>
          <textarea
            {...register("previewCode")}
            rows={5}
            placeholder="Your preview code snippet..."
            id="previewCode"
            className={`w-full rounded-lg border border-slate-700 px-3 py-2.5 text-sm text-slate-400 outline-none transition focus:border-slate-800 focus:ring-1 focus:ring-gray-900 placeholder:text-slate-600 ${
              errors.previewCode
                ? "border-red-500/70"
                : "border-slate-700 focus:border-slate-500"
            }`}
          />

          {errors.previewCode && (
            <p className="mt-1.5 text-xs text-red-400">
              {errors.previewCode.message}
            </p>
          )}
        </div>
      </section>

      {/* Technologies */}
      <section className="rounded-xl border border-slate-800 bg-slate-900/70 px-1 lg:px-4 py-5">
        <div className="border-b border-slate-800 px-5 py-4">
          <h2 className="text-sm font-semibold text-white">
            Technologies Used
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Select the technologies and tools used in this project.
          </p>
        </div>

        <div className=" p-5 lg:p-6">
          <Controller
            name="technologies"
            control={control}
            render={({ field }) => (
              <TechMultiSelect
                techs={skills}
                value={field.value}
                onChange={field.onChange}
                error={errors.technologies?.message}
              />
            )}
          />

          {selectedTechnologies?.length > 0 && (
            <p className="mt-2 text-xs text-slate-600">
              {selectedTechnologies.length}{" "}
              {selectedTechnologies.length === 1
                ? "technology"
                : "technologies"}{" "}
              selected
            </p>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="rounded-xl border border-slate-800 bg-slate-900/70 px-1 lg:px-4 py-5">
        <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
          <div>
            <h2 className="text-sm font-semibold text-white">
              Project Features
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Add projects features.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              append({
                content: "",
              })
            }
            className="relative inline-flex cursor-pointer items-center gap-2 overflow-hidden rounded-xl border border-brand-600 px-2.5 py-1.5 text-sm font-medium text-brand-400 shadow-glow transition-transform hover:scale-[1.03] hover:bg-brand-600 hover:text-white"
          >
            <Plus className="h-3.5 w-3.5" />
            Add
          </button>
        </div>

        <div className="space-y-3 p-5 lg:p-6">
          {featureFields.map((field, index) => (
            <div key={field.id} className="flex items-start gap-2">
              <div className="min-w-0 flex-1">
                <input
                  {...register(`features.${index}.content`)}
                  type="text"
                  placeholder="Describe a project feature..."
                  className={`w-full rounded-lg border border-slate-700 px-3 py-2.5 text-sm text-slate-400 outline-none transition focus:border-slate-800 focus:ring-1 focus:ring-gray-900 placeholder:text-slate-600 ${
                    errors.features?.[index]?.content
                      ? "border-red-500/70"
                      : "border-slate-700 focus:border-slate-500"
                  }`}
                />

                {errors.features?.[index]?.content && (
                  <p className="mt-1 text-xs text-red-400">
                    {errors.features[index]?.content?.message}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() => remove(index)}
                disabled={featureFields.length === 1}
                className="mt-1.5 cursor-pointer rounded-md p-2 text-slate-500 transition hover:bg-slate-900 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-30"
                title="Remove responsibility"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}

          {featureFields.length === 0 && (
            <div className="rounded-lg border border-dashed border-slate-800 py-8 text-center">
              <p className="text-sm text-slate-500">No features added.</p>

              <button
                type="button"
                onClick={() =>
                  append({
                    content: "",
                  })
                }
                className="mt-2 cursor-pointer text-sm text-slate-300 hover:text-white hover:underline"
              >
                Add one
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Highlights */}
      <section className="rounded-xl border border-slate-800 bg-slate-900/70 px-1 lg:px-4 py-5">
        <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
          <div>
            <h2 className="text-sm font-semibold text-white">
              Project Highlights
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Add projects highlights.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              appendHighlight({
                label: "",
                value: "",
              })
            }
            className="relative inline-flex cursor-pointer items-center gap-2 overflow-hidden rounded-xl border border-brand-600 px-2.5 py-1.5 text-sm font-medium text-brand-400 shadow-glow transition-transform hover:scale-[1.03] hover:bg-brand-600 hover:text-white"
          >
            <Plus className="h-3.5 w-3.5" />
            Add
          </button>
        </div>

        <div className="space-y-3 p-5 lg:p-6">
          {highlightFields.map((field, index) => (
            <div key={field.id} className="flex items-start gap-3">
              <div className="flex-1">
                <input
                  {...register(`highlights.${index}.label`)}
                  placeholder="Label"
                  className={`w-full rounded-lg border border-slate-700 px-3 py-2.5 text-sm text-slate-400 outline-none transition focus:border-slate-800 focus:ring-1 focus:ring-gray-900 placeholder:text-slate-600 ${
                    errors.highlights?.[index]?.label
                      ? "border-red-500/70"
                      : "border-slate-700 focus:border-slate-500"
                  }`}
                />

                {errors.highlights?.[index]?.label && (
                  <p className="mt-1 text-xs text-red-400">
                    {errors.highlights[index].label.message}
                  </p>
                )}
              </div>

              <div className="flex-1">
                <input
                  {...register(`highlights.${index}.value`)}
                  placeholder="Value"
                  className={`w-full rounded-lg border border-slate-700 px-3 py-2.5 text-sm text-slate-400 outline-none transition focus:border-slate-800 focus:ring-1 focus:ring-gray-900 placeholder:text-slate-600 ${
                    errors.highlights?.[index]?.value
                      ? "border-red-500/70"
                      : "border-slate-700 focus:border-slate-500"
                  }`}
                />

                {errors.highlights?.[index]?.value && (
                  <p className="mt-1 text-xs text-red-400">
                    {errors.highlights[index].value.message}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() => removeHighlight(index)}
                disabled={highlightFields.length === 1}
                className="mt-1.5 cursor-pointer rounded-md p-2 text-slate-500 transition hover:bg-slate-900 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-30"
                title="Remove highlight"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}

          {highlightFields.length === 0 && (
            <div className="rounded-lg border border-dashed border-slate-800 py-8 text-center">
              <p className="text-sm text-slate-500">No highlights added.</p>

              <button
                type="button"
                onClick={() =>
                  appendHighlight({
                    label: "",
                    value: "",
                  })
                }
                className="mt-2 cursor-pointer text-sm text-slate-300 hover:text-white hover:underline"
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
          href="/admin/projects"
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
              : "Save Project"}
        </button>
      </div>
    </form>
  );
};

export default ProjectsForm;
