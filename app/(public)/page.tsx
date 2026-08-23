import { getExperienceData } from "@/actions/experience";
import { getHomepageProjects } from "@/actions/projects";
import { getHomepageSkills } from "@/actions/skill";
import { getProfileData } from "@/actions/profile";
import Architecture from "@/components/main/Architecture";
import Contact from "@/components/main/Contact";
import Experience from "@/components/main/Experience";
import Footer from "@/components/main/Footer";
import Hero from "@/components/main/Hero";
import Navbar from "@/components/main/Navbar";
import Projects from "@/components/main/Projects";
import Skills from "@/components/main/Skills";

const Home = async () => {
  const [skillsResp, projectsResp, profile, experiences] = await Promise.all([
    getHomepageSkills(),
    getHomepageProjects(),
    getProfileData(),
    getExperienceData(),
  ]);

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <Navbar />
      <main>
        <Hero profile={profile} />
        <Skills data={skillsResp.skills ?? []} />
        <Projects data={projectsResp.projectsWithCode ?? []} />
        <Architecture />
        <Experience experiences={experiences.experiences || []} />
        <Contact profile={profile} />
      </main>
      <Footer profile={profile} />
    </div>
  );
};

export default Home;
