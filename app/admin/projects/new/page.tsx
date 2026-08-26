import ProjectsForm from "@/components/admin/projects/ProjectsForm";
import { prisma } from "@/lib/prisma";

const AddProject = async () => {
  const skills = await prisma.skill.findMany({
    orderBy: {
      name: "asc",
    },

    select: {
      id: true,
      name: true,
    },
  });
  return <ProjectsForm skills={skills} />;
};

export default AddProject;
