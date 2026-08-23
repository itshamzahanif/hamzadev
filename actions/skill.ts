"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/authSession";
import { Skill } from "@/types/types";
import { revalidatePath } from "next/cache";
import { SkillDialogServerSchema } from "@/schemas/schemas";

export async function getHomepageSkills() {
  try {
    const skills = await prisma.skill.findMany();
    return { success: true, skills };
  } catch (err) {
    console.error("Error fetching skills", err);
    return { success: false, error: "Error fetching skills" };
  }
}

export async function getSkills() {
  try {
    const session = await getSession();
    if (!session?.user) {
      return { success: false, message: "Unauthorised" };
    }
    const skills = await prisma.skill.findMany({
      orderBy: [
        {
          category: "asc",
        },
        {
          name: "asc",
        },
      ],
    });
    return { success: true, skills };
  } catch (err) {
    console.error("Error fetching skills", err);
    return { success: false, message: "Error fetching skills" };
  }
}

export async function updateSkill(skill: Skill) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return { success: false, message: "Unauthorised" };
    }

    const result = SkillDialogServerSchema.safeParse({
      name: skill.name,
      category: skill.category,
      tag: skill.tag,
    });

    if (!result.success) {
      return { success: false, message: "Validation error" };
    }

    const updateSkill = await prisma.skill.update({
      where: {
        id: skill.id,
      },
      data: {
        name: result.data.name,
        category: result.data.category,
        tag: result.data.tag,
      },
    });

    revalidatePath("/");
    revalidatePath("/admin/skill");

    return { success: true, skill: updateSkill };
  } catch (err) {
    console.error("Error updating skills", err);
    return { success: false, message: "Error updating skills" };
  }
}

export async function deleteSkill(skillId: number) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return { success: false, message: "Unauthorised" };
    }

    await prisma.skill.delete({
      where: {
        id: skillId,
      },
    });

    revalidatePath("/");
    revalidatePath("/admin/skill");

    return { success: true, message: "Skill deleted successfully" };
  } catch (err) {
    console.error("Error deleting skills", err);
    return { success: false, message: "Error deleting skills" };
  }
}

export async function createSkill(skill: Skill) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return { success: false, message: "Unauthorised" };
    }

    const result = SkillDialogServerSchema.safeParse({
      name: skill.name,
      category: skill.category,
      tag: skill.tag,
    });

    if (!result.success) {
      return { success: false, message: "Validation error" };
    }

    console.log("tag:", result.data.tag);
    console.log("category:", result.data.category);

    const createdSkill = await prisma.skill.create({
      data: {
        name: result.data.name,
        category: result.data.category,
        tag: result.data.tag,
      },
    });

    revalidatePath("/");
    revalidatePath("/admin/skill");

    return { success: true, skill: createdSkill };
  } catch (err) {
    console.error("Error updating skills", err);
    return { success: false, message: "Error updating skills" };
  }
}
