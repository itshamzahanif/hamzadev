import { prisma } from "@/lib/prisma";

export async function experienceSeed() {
  await prisma.experience.deleteMany();
  for (const experience of experiences) {
    await prisma.experience.create({
      data: {
        jobTitle: experience.jobTitle,
        jobSummary: experience.jobSummary,
        employer: experience.employer,
        location: experience.location,
        startDate: experience.startDate,
        endDate: experience.endDate,
        isContinued: experience.isContinued,
        stack: {
          create: experience.stack.map((skillId, i) => ({
            skillId,
            sortOrder: i + 1,
          })),
        },
        bullets: {
          create: experience.bullets.map((bullet, i) => ({
            description: bullet,
            sortOrder: i + 1,
          })),
        },
      },
      include: {
        stack: {
          include: { skill: true },
          orderBy: { sortOrder: "asc" },
        },
      },
    });
  }
}

const experiences = [
  {
    jobTitle: "Freelance Full Stack Developer & Consultant",
    jobSummary:
      "Delivered custom CMS and e-commerce solutions for global clients, spanning the MERN stack and Laravel with a focus on tailored dashboards and fast APIs.",
    employer: "Self-Employed",
    location: "Remote",
    startDate: 2024,
    endDate: null,
    isContinued: true,
    stack: [19, 20, 21, 22, 23, 24],
    bullets: [
      "Delivered custom CMS and e-commerce solutions for international clients",
      "Built tailored admin dashboards and automated inventory workflows",
      "Integrated fast REST APIs for catalog, cart, and checkout flows",
      "Consulted on architecture and deployment for MERN and Laravel projects",
    ],
  },
  {
    jobTitle: "Full-Stack Developer",
    jobSummary:
      "Building commercial web applications end to end — from REST API design to AWS deployment — and mentoring junior developers on frontend standards.",
    employer: "Codx Softwares",
    location: "Remote",
    startDate: 2025,
    endDate: 2026,
    isContinued: false,
    stack: [23, 24, 25, 26, 27],
    bullets: [
      "Built and shipped commercial web apps across the MERN and Laravel stacks",
      "Designed REST APIs consumed by decoupled React frontends",
      "Deployed applications on AWS EC2 with S3-backed asset storage",
      "Mentored junior developers on React, TypeScript, and frontend standards",
    ],
  },
  {
    jobTitle: "Frontend Web Developer",
    jobSummary:
      "Building and enhancing core in-house web products using Laravel.",
    employer: "4Dots Training & Advisory Ltd",
    location: "Remote",
    startDate: 2023,
    endDate: 2024,
    isContinued: false,
    stack: [28, 29, 30, 31, 32],
    bullets: [
      "Maintained and developed client-facing UI layouts for core company products using Laravel Blade",
      "Integrated frontend Blade templates seamlessly with backend controllers, routes, and data models",
      "Optimized UI components for cross-browser compatibility and responsive desktop/mobile views",
      "Collaborated closely with backend developers to streamline feature rollouts and UI bugs",
    ],
  },
];
