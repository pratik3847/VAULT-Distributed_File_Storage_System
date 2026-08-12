const prisma = require("../config/prisma");

async function findByEmail(email) {
  return await prisma.user.findUnique({
    where: {
      email,
    },
  });
}

async function createUser(userData) {
  return await prisma.user.create({
    data: userData,
  });
}

async function findById(id) {
  return await prisma.user.findUnique({
    where: {
      id,
    },
  });
}

async function updateUser(id, data) {
  return prisma.user.update({
    where: {
      id,
    },
    data,
  });
}

async function searchUsers(query, currentUserId) {
  return await prisma.user.findMany({
    where: {
      id: { not: currentUserId },
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { email: { contains: query, mode: "insensitive" } },
      ],
    },
    select: {
      id: true,
      name: true,
      email: true,
    },
    take: 10,
  });
}

module.exports = {
  findByEmail,
  createUser,
  findById,
  updateUser,
  searchUsers,
};