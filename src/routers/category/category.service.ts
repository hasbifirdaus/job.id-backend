import prisma from "../../lib/config/prisma";

export const createCategory = async (name: string) => {
  return await prisma.categories.create({
    data: { name },
  });
};

export const getAllCategories = async () => {
  return await prisma.categories.findMany({
    orderBy: { id: "asc" },
  });
};
