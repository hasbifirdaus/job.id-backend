import prisma from "../../lib/config/prisma";

export const createProvince = async (name: string) => {
  return await prisma.provinces.create({
    data: { name },
  });
};

export const getAllProvinces = async () => {
  return await prisma.provinces.findMany({
    orderBy: { id: "asc" },
  });
};
