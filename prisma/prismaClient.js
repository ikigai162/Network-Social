const { PrismaClient } = require("@prisma/client"); //generator de interogări generat automat care permite accesul la bazele de date în condiții de siguranță și reduce boilerplate
const prisma = new PrismaClient();

module.exports = {
  prisma,
};
