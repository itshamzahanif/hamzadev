import { getAdminProjects } from "@/actions/projects";
import ProjectsTable from "@/components/admin/projects/ProjectsTable";

const Projects = async () => {
  const projects = await getAdminProjects();
  console.log("page:projects", projects);
  return <ProjectsTable projects={projects.projects || []} />;
};

export default Projects;
