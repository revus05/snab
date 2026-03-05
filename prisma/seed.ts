import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";
import { Pool } from "pg";

const connectionString = process.env.SOTRAGE_PRISMA_DATABASE_URL;
if (!connectionString) {
  throw new Error("SOTRAGE_PRISMA_DATABASE_URL is not configured");
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.restockRequest.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();

  const adminPassword = await bcrypt.hash("admin12345", 10);
  const userPassword = await bcrypt.hash("user12345", 10);

  const admin = await prisma.user.create({
    data: {
      email: "admin@warehouse.local",
      firstName: "Admin",
      lastName: "User",
      password: adminPassword,
      role: UserRole.ADMIN,
    },
  });

  const user = await prisma.user.create({
    data: {
      email: "user@warehouse.local",
      firstName: "Ivan",
      lastName: "Petrov",
      password: userPassword,
      role: UserRole.USER,
    },
  });

  const products = await prisma.$transaction([
    prisma.product.create({
      data: {
        name: "Ткань техническая 240",
        description: "Плотная техническая ткань для промышленных задач.",
        images: [],
        stock: 120,
      },
    }),
    prisma.product.create({
      data: {
        name: "Войлок листовой 10мм",
        description: "Листовой войлок для фильтрации и изоляции.",
        images: [],
        stock: 75,
      },
    }),
    prisma.product.create({
      data: {
        name: "Ткань смесовая 180",
        description: "Универсальная смесовая ткань для производства.",
        images: [],
        stock: 200,
      },
    }),
  ]);

  await prisma.order.create({
    data: {
      userId: user.id,
      items: {
        create: [
          { productId: products[0].id, quantity: 10 },
          { productId: products[1].id, quantity: 5 },
        ],
      },
    },
  });

  await prisma.order.create({
    data: {
      userId: admin.id,
      items: {
        create: [{ productId: products[2].id, quantity: 20 }],
      },
    },
  });

  console.log("Seed completed.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
