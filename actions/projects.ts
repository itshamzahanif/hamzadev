"use server";

import { getSession } from "@/lib/authSession";
import { prisma } from "@/lib/prisma";
import { projectSchema } from "@/schemas/schemas";
import { revalidatePath } from "next/cache";
import { codeToHtml } from "shiki";
import slugify from "react-slugify";
import { z } from "zod";

type ProjectFormData = z.infer<typeof projectSchema>;

export async function getHomepageProjects() {
  try {
    const projects = await prisma.project.findMany({
      include: { technologies: true, features: true, highlights: true },
    });

    const projectsWithCode = await Promise.all(
      projects.map(async (project) => {
        let highlightedCode = null;

        if (project.previewCode) {
          highlightedCode = await codeToHtml(project.previewCode, {
            lang: project.codeLanguage ?? "text",
            theme: "vitesse-dark",
          });
        }

        return {
          ...project,
          highlightedCode,
        };
      }),
    );

    return { success: true, projectsWithCode };
  } catch (err) {
    console.error("Fetching projects err", err);
    return { success: false, error: "Fetching projects error" };
  }
}

export async function getAdminProjects() {
  try {
    const session = await getSession();
    if (!session?.user) {
      return { success: false, error: "Unauthorised" };
    }
    const projects = await prisma.project.findMany({
      include: { technologies: true, features: true, highlights: true },
    });

    return { success: true, projects };
  } catch (err) {
    console.error("Error fetching projects", err);
    return { success: false, error: "Error fetching projects" };
  }
}

export async function deleteProjects(id: number) {
  const session = await getSession();
  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }

  if (!Number.isInteger(id) || id <= 0) {
    return {
      success: false as const,
      error: "Invalid experience",
    };
  }

  try {
    const projects = await prisma.project.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
      },
    });

    if (!projects) {
      return {
        success: false as const,
        error: "Project not found",
      };
    }

    await prisma.project.delete({
      where: {
        id,
      },
    });

    revalidatePath("/");
    revalidatePath("/admin/projects");

    return {
      success: true as const,
    };
  } catch (error) {
    console.error("deleteExperience error:", error);

    return {
      success: false as const,
      error: "Failed to delete experience",
    };
  }
}

interface SortExpProp {
  id: number;
  sortOrder: number;
}

export async function sortProjects(sortedData: SortExpProp[]) {
  const session = await getSession();
  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await prisma.$transaction(
      sortedData.map((data) =>
        prisma.project.update({
          where: {
            id: data.id,
          },
          data: {
            sortOrder: data.sortOrder,
          },
        }),
      ),
    );

    revalidatePath("/");

    return {
      success: true,
      message: "Projects sorted successfully",
    };
  } catch (err) {
    console.error("Error sorting projects", err);

    return {
      success: false,
      error: "Error sorting projects",
    };
  }
}

async function generateUniqueSlug(title: string) {
  const baseSlug = slugify(title);
  let slug = baseSlug;
  let counter = 2;

  while (await prisma.project.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}

export async function addProject(data: ProjectFormData) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return { success: false, error: "Unauthorised" };
    }

    const result = projectSchema.safeParse(data);
    if (!result.success) {
      return { success: false, error: "Validation error" };
    }

    const slug = await generateUniqueSlug(result.data.title);

    const createProject = await prisma.project.create({
      data: {
        title: result.data.title,
        slug,
        tagline: result.data.tagline,
        description: result.data.description,
        codePreviewName: result.data.codePreviewName,
        codeLanguage: result.data.codeLanguage,
        previewCode: result.data.previewCode,
        liveUrl: result.data.liveUrl,
        repoUrl: result.data.repoUrl || null,
        clientProject: result.data.clientProject || false,
        technologies: {
          create: result.data.technologies.map((techName, index) => ({
            name: techName,
            sortOrder: index,
          })),
        },
        features: {
          create: result.data.features.map((feature, index) => ({
            content: feature.content,
            sortOrder: index,
          })),
        },
        highlights: {
          create: result.data.highlights.map((highlight, index) => ({
            label: highlight.label,
            value: highlight.value,
            sortOrder: index,
          })),
        },
      },
    });

    return {
      success: true,
      message: "Project added successfully",
      project: createProject,
    };
  } catch (err) {
    console.log("Error adding project", err);
    return { success: false, error: "Error adding project" };
  }
}

export async function updateProject(id: number, data: ProjectFormData) {
  try {
    const session = await getSession();

    if (!session?.user) {
      return {
        success: false,
        error: "Unauthorised",
      };
    }

    const result = projectSchema.safeParse(data);

    if (!result.success) {
      return {
        success: false,
        error: "Validation error",
      };
    }

    const existingProject = await prisma.project.findUnique({
      where: {
        id,
      },
    });

    if (!existingProject) {
      return {
        success: false,
        error: "Project not found",
      };
    }

    const updatedProject = await prisma.$transaction(async (tx) => {
      // Update the main project
      const project = await tx.project.update({
        where: {
          id,
        },
        data: {
          title: result.data.title,
          tagline: result.data.tagline,
          description: result.data.description,
          codePreviewName: result.data.codePreviewName || null,
          codeLanguage: result.data.codeLanguage || null,
          previewCode: result.data.previewCode || null,
          liveUrl: result.data.liveUrl || null,
          repoUrl: result.data.repoUrl || null,
          clientProject: result.data.clientProject,
        },
      });

      // Replace technologies
      await tx.projectTechnology.deleteMany({
        where: {
          projectId: id,
        },
      });

      await tx.projectTechnology.createMany({
        data: result.data.technologies.map((techName, index) => ({
          name: techName,
          projectId: id,
          sortOrder: index,
        })),
      });

      // Replace features
      await tx.projectFeature.deleteMany({
        where: {
          projectId: id,
        },
      });

      await tx.projectFeature.createMany({
        data: result.data.features.map((feature, index) => ({
          content: feature.content,
          projectId: id,
          sortOrder: index,
        })),
      });

      // Replace highlights
      await tx.projectHighlight.deleteMany({
        where: {
          projectId: id,
        },
      });

      await tx.projectHighlight.createMany({
        data: result.data.highlights.map((highlight, index) => ({
          label: highlight.label,
          value: highlight.value,
          projectId: id,
          sortOrder: index,
        })),
      });

      return project;
    });

    return {
      success: true,
      message: "Project updated successfully",
      project: updatedProject,
    };
  } catch (err) {
    console.error("Error updating project", err);

    return {
      success: false,
      error: "Error updating project",
    };
  }
}
