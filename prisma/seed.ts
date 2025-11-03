/// <reference types="node" />

import prisma from "../src/lib/config/prisma";
import * as fs from "fs";
import * as path from "path";

function loadJson(filename: string) {
  const p = path.join(__dirname, "data", filename);
  return JSON.parse(fs.readFileSync(p, "utf-8"));
}

async function main() {
  console.log("Start seeding...");

  type Province = {
    id: number;
    name: string;
  };

  const provinces = loadJson("provinces.json") as Province[];
  if (provinces.length) {
    await prisma.provinces.createMany({
      data: provinces.map((p) => ({
        id: p.id,
        name: p.name,
      })),
      skipDuplicates: true,
    });
    console.log(`Inserted ${provinces.length} provinces`);
  }

  const cities = loadJson("cities.json");
  if (cities.length) {
    await prisma.cities.createMany({ data: cities, skipDuplicates: true });
    console.log(`Inserted ${cities.length} cities`);
  }

  const categories = loadJson("categories.json");
  if (categories.length) {
    await prisma.categories.createMany({
      data: categories,
      skipDuplicates: true,
    });
    console.log(`Inserted ${categories.length} categories`);
  }

  const tags = loadJson("tags.json");
  if (tags.length) {
    await prisma.tags.createMany({ data: tags, skipDuplicates: true });
    console.log(`Inserted ${tags.length} tags`);
  }

  const companies = loadJson("companies.json");
  if (companies.length) {
    await prisma.companies.createMany({
      data: companies,
      skipDuplicates: true,
    });
    console.log(`Inserted ${companies.length} companies`);
  }

  const users = loadJson("users.json");
  if (users.length) {
    await prisma.users.createMany({ data: users, skipDuplicates: true });
    console.log(`Inserted ${users.length} users`);
  }

  const jobs = loadJson("jobs.json");
  if (jobs.length) {
    await prisma.jobs.createMany({ data: jobs, skipDuplicates: true });
    console.log(`Inserted ${jobs.length} jobs`);
  }

  const jobTags = loadJson("jobTags.json");
  if (jobTags.length) {
    for (const jt of jobTags) {
      await prisma.jobTags.upsert({
        where: {
          job_id_tag_id: { job_id: jt.job_id, tag_id: jt.tag_id },
        },
        update: {},
        create: {
          job_id: jt.job_id,
          tag_id: jt.tag_id,
          created_at: new Date().toISOString(),
        },
      });
    }
    console.log(`Inserted or skipped ${jobTags.length} jobTags`);
  } else {
    console.log("No jobTags data found");
  }

  const test = loadJson("preSelectionTests.json");
  if (test.length) {
    await prisma.preSelectionTests.createMany({
      data: test,
      skipDuplicates: true,
    });
    console.log(`Inserted ${test.length} preselection tests`);
  }

  const questions = loadJson("preselectionQuestions.json");
  if (questions.length) {
    await prisma.preSelectionQuestions.createMany({
      data: questions,
      skipDuplicates: true,
    });
    console.log(`Inserted ${questions.length} preselection questions`);
  }

  const applications = loadJson("applications.json");
  if (applications.length) {
    await prisma.applications.createMany({
      data: applications,
      skipDuplicates: true,
    });
    console.log(`Inserted ${applications.length} applications`);
  }

  console.log("Seeding finished.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
