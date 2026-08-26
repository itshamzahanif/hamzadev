import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProjectForm from "@/components/admin/projects/ProjectsForm";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

const EditProject = async ({ params }: Props) => {
  const { id: idParam } = await params;
  const id = Number(idParam);
  if (!Number.isInteger(id) || id <= 0) {
    notFound();
  }

  const [project, skills] = await Promise.all([
    prisma.project.findUnique({
      where: {
        id,
      },

      include: {
        technologies: {
          orderBy: {
            sortOrder: "asc",
          },
        },

        features: {
          orderBy: {
            sortOrder: "asc",
          },

          select: {
            content: true,
          },
        },

        highlights: {
          orderBy: {
            sortOrder: "asc",
          },

          select: {
            label: true,
            value: true,
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

  if (!project) {
    notFound();
  }
  return (
    <ProjectForm
      skills={skills}
      project={{
        ...project,
        technologies: project.technologies.map((tech) => tech.name),
      }}
    />
  );
};

export default EditProject;
