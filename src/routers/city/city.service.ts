import prisma from "../../lib/config/prisma";

export const createCity = async (name: string, province_id: number) => {
  return await prisma.cities.create({
    data: { name, province_id },
  });
};

export const getAllCities = async () => {
  return await prisma.cities.findMany({
    include: { province: true },
    orderBy: { id: "asc" },
  });
};

export const getCitiesByProvince = async (province_id: number) => {
  return await prisma.cities.findMany({
    where: { province_id },
    orderBy: { id: "asc" },
  });
};
