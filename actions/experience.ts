"use server";

import { prisma } from "@/lib/prisma";
import { experienceSchema } from "@/schemas/schemas";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export type ExperienceFormData = z.infer<typeof experienceSchema>;

export async function getExperienceData() {
  try {
    const rawExperiences = await prisma.experience.findMany({
      orderBy: { sortOrder: "asc" },
      include: {
        stack: {
          orderBy: { sortOrder: "asc" },
          select: {
            skill: true,
          },
        },
        bullets: {
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    const experiences = rawExperiences.map((exp) => ({
      ...exp,
      stack: exp.stack.map((item) => item.skill),
    }));

    return { success: true, experiences };
  } catch (err) {
    console.error("Error getting experience data", err);
    return {
      success: false,
      error: "Error getting experience data",
    };
  }
}

function validateExperienceData(data: ExperienceFormData) {
  const result = experienceSchema.safeParse(data);

  if (!result.success) {
    return {
      success: false as const,
      error: result.error.issues[0]?.message ?? "Invalid data",
    };
  }

  if (
    !result.data.isContinued &&
    result.data.endDate !== null &&
    result.data.endDate < result.data.startDate
  ) {
    return {
      success: false as const,
      error: "End year cannot be before start year",
    };
  }

  if (result.data.isContinued && result.data.endDate !== null) {
    return {
      success: false as const,
      error: "End year must be empty for a current position",
    };
  }

  return {
    success: true as const,
    data: result.data,
  };
}

export async function createExperience(data: ExperienceFormData) {
  const validation = validateExperienceData(data);

  if (!validation.success) {
    return validation;
  }

  try {
    const latestExperience = await prisma.experience.findFirst({
      orderBy: {
        sortOrder: "desc",
      },
      select: {
        sortOrder: true,
      },
    });

    const sortOrder = (latestExperience?.sortOrder ?? -1) + 1;

    await prisma.experience.create({
      data: {
        jobTitle: validation.data.jobTitle,
        jobSummary: validation.data.jobSummary,
        employer: validation.data.employer,
        location: validation.data.location,
        startDate: validation.data.startDate,
        endDate: validation.data.isContinued ? null : validation.data.endDate,
        isContinued: validation.data.isContinued,
        sortOrder,

        stack: {
          create: validation.data.skillIds.map((skillId, index) => ({
            skillId,
            sortOrder: index,
          })),
        },

        bullets: {
          create: validation.data.bullets.map((bullet, index) => ({
            description: bullet.description,
            sortOrder: index,
          })),
        },
      },
    });

    revalidatePath("/admin/experience");

    return {
      success: true as const,
    };
  } catch (error) {
    console.error("createExperience error:", error);

    return {
      success: false as const,
      error: "Failed to create experience",
    };
  }
}

export async function updateExperience(id: number, data: ExperienceFormData) {
  const validation = validateExperienceData(data);

  if (!validation.success) {
    return validation;
  }

  try {
    const existingExperience = await prisma.experience.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
      },
    });

    if (!existingExperience) {
      return {
        success: false as const,
        error: "Experience not found",
      };
    }

    await prisma.$transaction(async (tx) => {
      await tx.experience.update({
        where: {
          id,
        },
        data: {
          jobTitle: validation.data.jobTitle,
          jobSummary: validation.data.jobSummary,
          employer: validation.data.employer,
          location: validation.data.location,
          startDate: validation.data.startDate,
          endDate: validation.data.isContinued ? null : validation.data.endDate,
          isContinued: validation.data.isContinued,
        },
      });

      await tx.experienceSkill.deleteMany({
        where: {
          experienceId: id,
        },
      });

      if (validation.data.skillIds.length > 0) {
        await tx.experienceSkill.createMany({
          data: validation.data.skillIds.map((skillId, index) => ({
            experienceId: id,
            skillId,
            sortOrder: index,
          })),
        });
      }

      await tx.experienceBullet.deleteMany({
        where: {
          experienceId: id,
        },
      });

      if (validation.data.bullets.length > 0) {
        await tx.experienceBullet.createMany({
          data: validation.data.bullets.map((bullet, index) => ({
            experienceId: id,
            description: bullet.description,
            sortOrder: index,
          })),
        });
      }
    });

    revalidatePath("/admin/experience");
    revalidatePath(`/admin/experience/${id}/edit`);

    return {
      success: true as const,
    };
  } catch (error) {
    console.error("updateExperience error:", error);

    return {
      success: false as const,
      error: "Failed to update experience",
    };
  }
}

export async function deleteExperience(id: number) {
  if (!Number.isInteger(id) || id <= 0) {
    return {
      success: false as const,
      error: "Invalid experience",
    };
  }

  try {
    const experience = await prisma.experience.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
      },
    });

    if (!experience) {
      return {
        success: false as const,
        error: "Experience not found",
      };
    }

    await prisma.experience.delete({
      where: {
        id,
      },
    });

    revalidatePath("/admin/experience");

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

export async function sortExperience(sortedData: SortExpProp[]) {
  try {
    await prisma.$transaction(
      sortedData.map((data) =>
        prisma.experience.update({
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
      message: "Experience sorted successfully",
    };
  } catch (err) {
    console.error("Error sorting experience", err);

    return {
      success: false,
      error: "Error sorting experience",
    };
  }
}
