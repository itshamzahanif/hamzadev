import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ExperienceForm from "@/components/admin/experience/ExperienceForm";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

const EditExperiencePage = async ({ params }: Props) => {
  const { id: idParam } = await params;

  const id = Number(idParam);

  if (!Number.isInteger(id) || id <= 0) {
    notFound();
  }

  const [experience, skills] = await Promise.all([
    prisma.experience.findUnique({
      where: {
        id,
      },

      include: {
        stack: {
          orderBy: {
            sortOrder: "asc",
          },

          select: {
            skillId: true,
          },
        },

        bullets: {
          orderBy: {
            sortOrder: "asc",
          },

          select: {
            description: true,
          },
        },
      },
    }),

    prisma.skill.findMany({
      orderBy: {
        name: "asc",
      },

      select: {
        id: true,
        name: true,
      },
    }),
  ]);

  if (!experience) {
    notFound();
  }

  return (
    <ExperienceForm
      skills={skills}
      experience={{
        id: experience.id,
        jobTitle: experience.jobTitle,
        jobSummary: experience.jobSummary,
        employer: experience.employer,
        location: experience.location,
        startDate: experience.startDate,
        endDate: experience.endDate,
        isContinued: experience.isContinued,

        skillIds: experience.stack.map((item) => item.skillId),

        bullets: experience.bullets.map((bullet) => ({
          description: bullet.description,
        })),
      }}
    />
  );
};

export default EditExperiencePage;
