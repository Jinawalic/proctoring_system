const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

// Manually load .env if process.env.DATABASE_URL is not set
if (!process.env.DATABASE_URL) {
  const envPath = path.resolve(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, 'utf8');
    const envMatch = envFile.match(/^DATABASE_URL=["']?(.+?)["']?$/m);
    if (envMatch) {
      process.env.DATABASE_URL = envMatch[1];
      console.log("Loaded DATABASE_URL from .env");
    }
  }
}

const prisma = new PrismaClient();

const studentsData = [
  { name: "Adeniyi Ola", matric: "2021/001" },
  { name: "Balogun Samuel", matric: "2021/002" },
  { name: "Chinedu Emeka", matric: "2021/003" },
  { name: "Dada Olayinka", matric: "2021/004" },
  { name: "Eze Kenneth", matric: "2021/005" },
  { name: "Fatima Bello", matric: "2021/006" },
  { name: "Garba Musa", matric: "2021/007" },
  { name: "Hassan Ali", matric: "2021/008" },
  { name: "Ibrahim Sule", matric: "2021/009" },
  { name: "Jimoh Tunde", matric: "2021/010" },
  { name: "Kazeem Lateef", matric: "2021/011" },
  { name: "Lawal Ahmed", matric: "2021/012" },
  { name: "Musa Danjuma", matric: "2021/013" },
  { name: "Nwosu Ike", matric: "2021/014" },
  { name: "Ojo Segun", matric: "2021/015" },
  { name: "Popoola Gbenga", matric: "2021/016" },
  { name: "Quadri Bashir", matric: "2021/017" },
  { name: "Raji Ismail", matric: "2021/018" },
  { name: "Salami Sikiru", matric: "2021/019" },
  { name: "Tijani Yusuf", matric: "2021/020" },
  { name: "Abiodun Tunde", matric: "2021/021" },
  { name: "Bello Rasheed", matric: "2021/022" },
  { name: "Coker David", matric: "2021/023" },
  { name: "Durojaiye Femi", matric: "2021/024" },
  { name: "Ekanem Glory", matric: "2021/025" },
  { name: "Fashola Hakeem", matric: "2021/026" },
  { name: "Gbadamosi Ibrahim", matric: "2021/027" },
  { name: "Hamed Jide", matric: "2021/028" },
  { name: "Isiaka Kunle", matric: "2021/029" },
  { name: "Jegede Lola", matric: "2021/030" },
  { name: "Kolade Mike", matric: "2021/031" },
  { name: "Lambo Nike", matric: "2021/032" },
  { name: "Makanjuola Ola", matric: "2021/033" },
  { name: "Nduka Prince", matric: "2021/034" },
  { name: "Olowo Queen", matric: "2021/035" },
  { name: "Pitan Rose", matric: "2021/036" },
  { name: "Raheem Sodiq", matric: "2021/037" },
  { name: "Shittu Toyin", matric: "2021/038" },
  { name: "Taiwo Usman", matric: "2021/039" },
  { name: "Uche Victor", matric: "2021/040" },
  { name: "Unknown Student", matric: "student@example.com" }, // Should be skipped
];

async function main() {
  console.log("Starting student import...");
  let added = 0;
  let skipped = 0;

  for (const s of studentsData) {
    // Check if matric is actually an email
    if (s.matric.includes("@")) {
      console.log(`Skipping ${s.name} - Invalid Matric (looks like email): ${s.matric}`);
      skipped++;
      continue;
    }

    const email = `${s.name.toLowerCase().replace(/\s+/g, '.')}@school.com`;
    
    try {
      await prisma.student.upsert({
        where: { matricNumber: s.matric },
        update: {},
        create: {
          name: s.name,
          matricNumber: s.matric,
          email: email,
          password: "12345678", // Default password
        }
      });
      added++;
    } catch (error) {
      console.error(`Error adding ${s.name}:`, error.message);
    }
  }

  console.log(`\nImport completed!`);
  console.log(`Added/Updated: ${added}`);
  console.log(`Skipped: ${skipped}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
