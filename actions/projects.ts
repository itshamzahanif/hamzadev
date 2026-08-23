"use server";

import { getSession } from "@/lib/authSession";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { codeToHtml } from "shiki";

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
