import { prisma } from "@/lib/prisma";
import ExperienceTable from "@/components/admin/experience/ExperienceTable";

const ExperiencePage = async () => {
  const experiences = await prisma.experience.findMany({
    orderBy: {
      sortOrder: "asc",
    },

    include: {
      stack: {
        orderBy: {
          sortOrder: "asc",
        },

        include: {
          skill: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });

  return <ExperienceTable experiences={experiences} />;
};

export default ExperiencePage;
