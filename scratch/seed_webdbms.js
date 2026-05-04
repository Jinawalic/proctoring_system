const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

// Load .env if DATABASE_URL is not set
if (!process.env.DATABASE_URL) {
  const envPath = path.resolve(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, 'utf8');
    const envMatch = envFile.match(/^DATABASE_URL=[\"']?(.+?)[\"']?$/m);
    if (envMatch) {
      process.env.DATABASE_URL = envMatch[1];
      console.log('Loaded DATABASE_URL from .env');
    }
  }
}

const prisma = new PrismaClient();

// correctOption is 0-indexed: A=0, B=1, C=2, D=3
const questions = [
  {
    text: "Which of the following is NOT a valid PHP data type?",
    options: ["Boolean", "Float", "Double (PHP uses Float)", "Tuple"],
    correctOption: 3, // D
  },
  {
    text: "A web server usually listens for HTTP requests on which port?",
    options: ["21", "443", "80", "3306"],
    correctOption: 2, // C
  },
  {
    text: "Which DBMS type stores data as objects rather than records in tables?",
    options: ["RDBMS", "Hierarchical", "Object-Oriented", "Network"],
    correctOption: 2, // C
  },
  {
    text: "In PHP, how do you indicate a single-line comment?",
    options: ["*", "//", "/* */", "**"],
    correctOption: 1, // B
  },
  {
    text: 'Which of the following is a "network of networks"?',
    options: ["WWW", "The Internet", "Intranet", "LAN"],
    correctOption: 1, // B
  },
  {
    text: 'The "Codasyl approach" to databases is based on which model?',
    options: ["Relational", "Hierarchical", "Network", "Object"],
    correctOption: 2, // C
  },
  {
    text: "Which software stack is primarily designed for macOS?",
    options: ["XAMPP", "WAMP", "MAMP", "LAMP"],
    correctOption: 2, // C
  },
  {
    text: "What technology allows a browser to display images along with text, popularized in 1993?",
    options: ["Mosaic web browser", "Netscape", "Internet Explorer", "HTML5"],
    correctOption: 0, // A
  },
  {
    text: "Which layer in an N-Tier architecture handles business logic and rules?",
    options: ["Presentation Layer", "Data Layer", "Application Layer", "Cache Layer"],
    correctOption: 2, // C
  },
  {
    text: "PHP was originally created in 1994 by:",
    options: ["Tim Berners-Lee", "Rasmus Lerdorf", "Bill Joy", "Larry Wall"],
    correctOption: 1, // B
  },
  {
    text: "Which property ensures that a database remains consistent even if a disk fails?",
    options: ["Indexing", "Backup and replication", "Rule enforcement", "Transaction mechanism"],
    correctOption: 1, // B
  },
  {
    text: 'A URL "path" typically shows:',
    options: [
      "The protocol used",
      "The server's IP",
      "The location of the resource on the server",
      "The query string",
    ],
    correctOption: 2, // C
  },
  {
    text: 'PHP is considered a "loosely typed" language because:',
    options: [
      "It doesn't support objects.",
      "Variables do not need type declaration before use.",
      "It only supports strings.",
      "It runs on any server.",
    ],
    correctOption: 1, // B
  },
  {
    text: "Which DBMS was developed for the Apollo program on System/360?",
    options: ["System R", "INGRES", "IMS", "DB2"],
    correctOption: 2, // C
  },
  {
    text: "Which term describes a system where the server crashes and all clients lose access?",
    options: ["Network bottleneck", "Single point of failure", "Latency", "Scalability error"],
    correctOption: 1, // B
  },
  {
    text: "In 1969, how many universities were first connected via ARPANET?",
    options: ["2", "4", "10", "50"],
    correctOption: 1, // B
  },
  {
    text: "Which PHP tag is used to close a code block?",
    options: ["</php>", "?>", "]", "/?>"],
    correctOption: 1, // B
  },
  {
    text: "The Relational model uses what to uniquely define a particular record?",
    options: ["Tuple", "Pointer", "Key", "Link"],
    correctOption: 2, // C
  },
  {
    text: "What is the primary protocol for transferring data over the Web?",
    options: ["FTP", "SMTP", "HTTP", "SSH"],
    correctOption: 2, // C
  },
  {
    text: "Which tier in a 3-Tier architecture handles storage and retrieval of data?",
    options: ["Presentation Tier", "Logic Tier", "Data Tier", "Client Tier"],
    correctOption: 2, // C
  },
];

async function main() {
  console.log('\n=== Seeding: Web Programming and DBMS ===\n');

  // Create the exam (upsert by courseCode so it's safe to re-run)
  const exam = await prisma.exam.upsert({
    where: { courseCode: 'WEB-DBMS' },
    update: {
      title: 'Web Programming and DBMS',
      questions: questions.length,
      duration: 60,
      status: 'Active',
    },
    create: {
      courseCode: 'WEB-DBMS',
      title: 'Web Programming and DBMS',
      questions: questions.length,
      duration: 60,
      status: 'Active',
    },
  });

  console.log(`✓ Exam created/updated: "${exam.title}" [${exam.courseCode}] — ID: ${exam.id}`);

  // Delete existing questions for this exam to avoid duplicates on re-run
  const deleted = await prisma.question.deleteMany({ where: { examId: exam.id } });
  if (deleted.count > 0) {
    console.log(`  Removed ${deleted.count} existing question(s) before re-seeding.`);
  }

  // Insert all questions
  let count = 0;
  for (const q of questions) {
    await prisma.question.create({
      data: {
        examId: exam.id,
        text: q.text,
        options: q.options,
        correctOption: q.correctOption,
      },
    });
    count++;
    const letter = ['A', 'B', 'C', 'D'][q.correctOption];
    console.log(`  [Q${count + 15}] Added — Answer: ${letter} (index ${q.correctOption})`);
  }

  console.log(`\n✅ Done! ${count} questions seeded for "${exam.title}".`);
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
