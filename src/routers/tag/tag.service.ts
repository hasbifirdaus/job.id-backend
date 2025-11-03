import prisma from "../../lib/config/prisma";

export const getAlltags = async () => {
  return await prisma.tags.findMany({
    orderBy: { id: "asc" },
  });
};

export const getTagById = async (id: number) => {
  return await prisma.tags.findUnique({
    where: { id },
  });
};

export const createTag = async (name: string) => {
  const existingTag = await prisma.tags.findUnique({
    where: { name },
  });

  if (existingTag) throw new Error("Tag already exists");

  return await prisma.tags.create({
    data: { name },
  });
};

export const updateTag = async (id: number, name: string) => {
  const tag = await prisma.tags.findUnique({ where: { id } });
  if (!tag) throw new Error("Tag not found");

  return await prisma.tags.update({
    where: { id },
    data: { name },
  });
};

export const deleteTag = async (id: number) => {
  const tag = await prisma.tags.findUnique({ where: { id } });
  if (!tag) throw new Error("Tag not found");

  return await prisma.tags.delete({ where: { id } });
};
