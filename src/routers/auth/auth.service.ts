import prisma from "../../lib/config/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { UserRole } from "../../generated/prisma";

const JWT_SECRET = process.env.JWT_SECRET_KEY;
if (!JWT_SECRET) throw new Error("JWT_SECRET_KEY is not defined in .env");

// 🔹 Register Job Seeker
export const registerJobSeekerService = async (data: any) => {
  const { name, email, password } = data;

  const existingUser = await prisma.users.findUnique({ where: { email } });
  if (existingUser) throw new Error("Email already registered");

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await prisma.users.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: UserRole.JOB_SEEKER,
    },
  });

  return { message: "Job Seeker registration successful", user: newUser };
};

// 🔹 Register Company Admin
export const registerCompanyAdminService = async (data: any) => {
  const {
    name,
    email,
    password,
    companyName,
    companyPhone,
    companyLocation,
    companyDescription,
  } = data;

  const existingUser = await prisma.users.findUnique({ where: { email } });
  if (existingUser) throw new Error("Email already registered");

  const existingCompany = await prisma.companies.findUnique({
    where: { email },
  });
  if (existingCompany) throw new Error("Company email already registered");

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await prisma.users.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: UserRole.COMPANY_ADMIN,
    },
  });

  const newCompany = await prisma.companies.create({
    data: {
      name: companyName,
      email,
      phone: companyPhone,
      location: companyLocation,
      description: companyDescription || "Company created during registration",
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

  const userWithCompanyId = {
    ...newUser,
    company_id: newCompany.id,
  };

  const token = jwt.sign(
    {
      id: userWithCompanyId.id,
      email: userWithCompanyId.email,
      role: userWithCompanyId.role,
      company_id: userWithCompanyId.company_id,
    },
    JWT_SECRET,
    { expiresIn: "2d" }
  );

  return {
    message: "Company Admin registration successful",
    token, //
    user: {
      id: userWithCompanyId.id,
      name: userWithCompanyId.name,
      email: userWithCompanyId.email,
      role: userWithCompanyId.role,
      company_id: userWithCompanyId.company_id,
    },
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

  if (!user) throw new Error("Invalid email or password");

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) throw new Error("Invalid email or password");

  const company_id =
    user.role === UserRole.COMPANY_ADMIN
      ? user.companyAdmins[0]?.company_id
      : null;

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role, company_id },
    JWT_SECRET,
    { expiresIn: "2d" }
  );

  return {
    message: "Login successful",
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      company_id,
    },
  };
};

export const getMeService = async (userId: string) => {
  const user = await prisma.users.findUnique({
    where: { id: userId },
    include: {
      companyAdmins: {
        select: {
          company_id: true,
          is_primary: true,
        },
      },
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  let company_id: number | null = null;
  if (user.role === UserRole.COMPANY_ADMIN) {
    const companyAdmin =
      user.companyAdmins.find((admin) => admin.is_primary) ||
      user.companyAdmins[0];
    company_id = companyAdmin ? companyAdmin.company_id : null;
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    company_id,
    profile_image_url: user.profile_image_url,
    verified: user.verified,
  };
};
