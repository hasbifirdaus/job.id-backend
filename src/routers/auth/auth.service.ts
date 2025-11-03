import prisma from "../../lib/config/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { UserRole } from "../../generated/prisma";

const JWT_SECRET = process.env.JWT_SECRET_KEY;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET_KEY is not defined in .env");
}

export const registerService = async (data: any) => {
  const { name, email, password, role } = data;

  const existingUser = await prisma.users.findUnique({ where: { email } });
  if (existingUser) throw new Error("Email already registered");

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await prisma.users.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: role || UserRole.JOB_SEEKER,
    },
  });

  let newCompany = null;
  if (role === UserRole.COMPANY_ADMIN) {
    const existingCompany = await prisma.companies.findUnique({
      where: { email },
    });
    if (existingCompany)
      throw new Error("Company with this email already exists");

    newCompany = await prisma.companies.create({
      data: {
        name: `${name}'s Company`,
        email: email,
        phone: "000000000000",
        location: "Indonesia",
        description: "Default company created upon registration.",
      },
    });

    await prisma.companyAdmins.create({
      data: {
        user_id: newUser.id,
        company_id: newCompany.id,
        is_primary: true,
        role: "Owner",
      },
    });
  }
  return {
    message: "Registration successfull",
    user: newUser,
    company: newCompany,
  };
};

export const loginService = async (data: any) => {
  const { email, password } = data;

  const user = await prisma.users.findUnique({
    where: { email },
    include: {
      companyAdmins: {
        include: {
          company: true,
        },
      },
    },
  });

  if (!user) throw new Error("Invalid credentials");

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) throw new Error("invalid credentials");

  const company_id =
    user.role === UserRole.COMPANY_ADMIN
      ? user.companyAdmins[0]?.company_id
      : null;

  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      company_id,
    },
    JWT_SECRET as string,
    { expiresIn: "2d" }
  );
  return token;
};
