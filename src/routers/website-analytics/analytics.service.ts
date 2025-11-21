import prisma from "../../lib/config/prisma";

// 1️⃣ KPI Data
export const getKpiData = async (companyId: number) => {
  const totalJobs = await prisma.jobs.count({
    where: { company_id: companyId, deleted_at: null },
  });

  const applicantsPerJobData = await prisma.applications.groupBy({
    by: ["job_id"],
    where: { job: { company_id: companyId }, job_id: { not: undefined } },
    _count: { id: true },
  });

  const totalApplicants = applicantsPerJobData.reduce(
    (sum, job) => sum + (job._count?.id || 0),
    0
  );

  const avgApplicantsPerJob = totalJobs > 0 ? totalApplicants / totalJobs : 0;

  const acceptedApplications = await prisma.applications.findMany({
    where: {
      job: { company_id: companyId },
      status: "ACCEPTED",
      created_at: { not: undefined },
    },
    select: { created_at: true, updated_at: true },
  });

  const avgHiringTime =
    acceptedApplications.length > 0
      ? Math.round(
          acceptedApplications.reduce((sum, a) => {
            const diff =
              new Date(a.updated_at).getTime() -
              new Date(a.created_at).getTime();
            return sum + diff;
          }, 0) /
            acceptedApplications.length /
            (1000 * 60 * 60 * 24)
        )
      : 0;

  const pageViewsData = await prisma.pageViews.aggregate({
    _sum: { views: true },
    where: { company_id: companyId },
  });
  const pageViews = pageViewsData._sum.views || 0;

  const acceptedCount = await prisma.applications.count({
    where: { job: { company_id: companyId }, status: "ACCEPTED" },
  });
  const totalCount = await prisma.applications.count({
    where: { job: { company_id: companyId } },
  });
  const conversionRate =
    totalCount > 0
      ? ((acceptedCount / totalCount) * 100).toFixed(2) + "%"
      : "0%";

  return {
    conversionRate,
    applicantsPerJob: Math.round(avgApplicantsPerJob),
    avgHiringTime: `${avgHiringTime} hari`,
    pageViews,
  };
};

// 2️⃣ Applicant Flow
export const getApplicantFlow = async (companyId: number) => {
  const applications = await prisma.applications.findMany({
    where: { job: { company_id: companyId }, created_at: { not: undefined } },
    select: { created_at: true },
  });

  const months: Record<string, number> = {};

  applications.forEach((app) => {
    const month = new Date(app.created_at).toLocaleString("default", {
      month: "short",
    });
    months[month] = (months[month] || 0) + 1;
  });

  const orderedMonths = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  return orderedMonths.map((m) => ({ name: m, applications: months[m] || 0 }));
};

// 3️⃣ Funnel Data
export const getFunnelData = async (companyId: number) => {
  const statuses = [
    "SUBMITTED",
    "REVIEWED",
    "INTERVIEW",
    "ACCEPTED",
    "REJECTED",
  ];
  const funnel: { name: string; value: number }[] = [];

  for (const status of statuses) {
    const count = await prisma.applications.count({
      where: { job: { company_id: companyId }, status: status as any },
    });

    funnel.push({
      name:
        status === "SUBMITTED"
          ? "Applied"
          : status === "ACCEPTED"
            ? "Hired"
            : status,
      value: count,
    });
  }

  return funnel;
};

// 4️⃣ Top Categories
export const getTopCategories = async (companyId: number) => {
  const jobs = await prisma.jobs.findMany({
    where: { company_id: companyId },
    select: { category_id: true },
  });

  const categoryCount: Record<number, number> = {};
  jobs.forEach((job) => {
    if (job.category_id !== undefined) {
      categoryCount[job.category_id] =
        (categoryCount[job.category_id] || 0) + 1;
    }
  });

  const categories = await prisma.categories.findMany({
    where: { id: { in: Object.keys(categoryCount).map(Number) } },
  });

  return categories.map((cat) => ({
    name: cat.name,
    value: categoryCount[cat.id] || 0,
  }));
};

// 5️⃣ Demographics
export const getDemographics = async (companyId: number) => {
  const users = await prisma.users.findMany({
    where: { applications: { some: { job: { company_id: companyId } } } },
    select: { gender: true, dob: true, city: { select: { name: true } } },
  });

  const now = new Date().getFullYear();

  const ageGroups: Record<string, number> = {
    "18-25": 0,
    "26-30": 0,
    "31-35": 0,
    "36-40": 0,
  };
  const genderGroups: Record<string, number> = { Pria: 0, Wanita: 0 };
  const locationGroups: Record<string, number> = {};

  users.forEach((u) => {
    // Age
    if (u.dob) {
      const age = now - u.dob.getFullYear();
      if (age >= 18 && age <= 25) ageGroups["18-25"] += 1;
      else if (age >= 26 && age <= 30) ageGroups["26-30"] += 1;
      else if (age >= 31 && age <= 35) ageGroups["31-35"] += 1;
      else if (age >= 36 && age <= 40) ageGroups["36-40"] += 1;
    }

    // Gender
    if (u.gender === "MALE") genderGroups["Pria"] += 1;
    else if (u.gender === "FEMALE") genderGroups["Wanita"] += 1;

    // Location
    if (u.city?.name)
      locationGroups[u.city.name] = (locationGroups[u.city.name] || 0) + 1;
  });

  return {
    age: Object.entries(ageGroups).map(([name, value]) => ({ name, value })),
    gender: Object.entries(genderGroups).map(([name, value]) => ({
      name,
      value,
    })),
    location: Object.entries(locationGroups).map(([name, value]) => ({
      name,
      value,
    })),
  };
};

// 6️⃣ Salary Trends
export const getSalaryTrends = async (companyId: number) => {
  const jobs = await prisma.jobs.findMany({
    where: { company_id: companyId },
    select: { title: true, min_salary: true, max_salary: true },
  });

  return jobs.map((job) => ({
    position: job.title,
    avgSalary: Number((Number(job.min_salary) + Number(job.max_salary)) / 2),
  }));
};

export const getTotalPageViews = async (companyId: number) => {
  const result = await prisma.pageViews.aggregate({
    where: { company_id: companyId },
    _sum: { views: true },
  });

  return result._sum.views || 0;
};
