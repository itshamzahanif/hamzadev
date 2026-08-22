import { prisma } from "@/lib/prisma";
import { adminSeed } from "./seeders/adminSeed";
import { projectSeed } from "./seeders/projectSeed";
import { skillSeed } from "./seeders/skillSeed";
import { profileSeed } from "./seeders/profileSeed";
import { experienceSeed } from "./seeders/experienceSeed";

async function main() {
  // await adminSeed();
  // await skillSeed();
  // await projectSeed();
  // await profileSeed();
  // await experienceSeed();
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
