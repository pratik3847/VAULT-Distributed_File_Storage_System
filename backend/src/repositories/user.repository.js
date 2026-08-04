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

module.exports = {
  findByEmail,
  createUser,
    findById,
};