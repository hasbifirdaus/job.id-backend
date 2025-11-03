import prisma from "../../lib/config/prisma";

export const getUserDemographics = async () => {
  const totalUsers = await prisma.users.count();

  const genderStatsRaw = await prisma.users.groupBy({
    by: ["gender"],
    _count: { gender: true },
  });

  const genderStats = genderStatsRaw
    .filter((g) => g.gender !== null)
    .map((g) => ({
      gender: g.gender || "Unknown",
      total: g._count.gender,
    }));

  const ageStats = await prisma.$queryRawUnsafe(`
    SELECT 
      CASE
        WHEN EXTRACT(YEAR FROM AGE(dob)) BETWEEN 18 AND 25 THEN '18-25'
        WHEN EXTRACT(YEAR FROM AGE(dob)) BETWEEN 26 AND 35 THEN '26-35'
        WHEN EXTRACT(YEAR FROM AGE(dob)) BETWEEN 36 AND 45 THEN '36-45'
        ELSE '46+'
      END AS age_range,
      COUNT(*) AS total
    FROM "Users"
    WHERE dob IS NOT NULL
    GROUP BY age_range
  `);

  const locationStats = await prisma.cities.findMany({
    select: {
      name: true,
      _count: { select: { jobs: true } },
    },
    take: 10,
    orderBy: { jobs: { _count: "desc" } },
  });

  return { totalUsers, genderStats, ageStats, locationStats };
};

export const getSalaryTrends = async () => {
  const trends = await prisma.jobs.groupBy({
    by: ["city_id", "category_id"],
    _avg: { min_salary: true, max_salary: true },
    _count: { id: true },
  });

  const result = await Promise.all(
    trends.map(async (t) => {
      const city = await prisma.cities.findUnique({
        where: { id: t.city_id },
        select: { name: true },
      });
      const category = await prisma.categories.findUnique({
        where: { id: t.category_id },
        select: { name: true },
      });

      return {
        city: city?.name || "Unknown",
        category: category?.name || "Unknown",
        avg_min_salary: t._avg.min_salary,
        avg_max_salary: t._avg.max_salary,
        job_count: t._count.id,
      };
    })
  );

  return result;
};

export const getApplicantInterests = async () => {
  const data = await prisma.applications.groupBy({
    by: ["job_id"],
    _count: { job_id: true },
  });

  const topCategories = await Promise.all(
    data.map(async (item) => {
      const job = await prisma.jobs.findUnique({
        where: { id: item.job_id },
        select: { category: { select: { name: true } } },
      });
      return { category: job?.category.name, total: item._count.job_id };
    })
  );

  const categoryMap: Record<string, number> = {};
  topCategories.forEach((i) => {
    if (!i.category) return;
    categoryMap[i.category] = (categoryMap[i.category] || 0) + i.total;
  });

  const result = Object.entries(categoryMap)
    .map(([name, total]) => ({ category: name, total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  return result;
};

export const getAnalyticsSummary = async () => {
  const totalUsers = await prisma.users.count();
  const totalCompanies = await prisma.companies.count();
  const totalApplications = await prisma.applications.count();
  const avgSalary = await prisma.jobs.aggregate({
    _avg: { min_salary: true, max_salary: true },
  });

  const avgAge = await prisma.$queryRawUnsafe<{ avg_age: number }[]>(`
    SELECT ROUND(AVG(EXTRACT(YEAR FROM AGE(dob)))) AS avg_age
    FROM "Users"
    WHERE dob IS NOT NULL
  `);

  const result = {
    totalUsers,
    totalCompanies,
    totalApplications,
    avgSalary: avgSalary._avg,
    avgAge: avgAge?.[0]?.avg_age || null,
  };

  return result;
};

export const getOtherAnalytics = async () => {
  const topSkillsRaw = await prisma.userSkills.groupBy({
    by: ["tag_id"],
    _count: { tag_id: true },
  });

  const topSkills = await Promise.all(
    topSkillsRaw
      .sort((a, b) => b._count.tag_id - a._count.tag_id)
      .slice(0, 5)
      .map(async (s) => {
        const tag = await prisma.tags.findUnique({
          where: { id: s.tag_id },
          select: { name: true },
        });
        return { skill: tag?.name || "Unknown", total_users: s._count.tag_id };
      })
  );

  const activeCompaniesRaw = await prisma.jobs.groupBy({
    by: ["company_id"],
    _count: { id: true },
  });

  const activeCompanies = await Promise.all(
    activeCompaniesRaw
      .sort((a, b) => b._count.id - a._count.id)
      .slice(0, 5)
      .map(async (c) => {
        const company = await prisma.companies.findUnique({
          where: { id: c.company_id },
          select: { name: true },
        });
        return {
          company: company?.name || "Unknown",
          total_jobs: c._count.id,
        };
      })
  );

  const totalJobs = await prisma.jobs.count();
  const totalApplications = await prisma.applications.count();
  const conversionRate =
    totalJobs > 0
      ? Number(((totalApplications / totalJobs) * 100).toFixed(2))
      : 0;

  return {
    topSkills,
    activeCompanies,
    conversionRate,
  };
};
