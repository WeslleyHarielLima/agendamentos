import 'dotenv/config';
import argon2 from 'argon2';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const usuarios = [
  { email: 'dona@clinica.com', senha: 'Clinica@2024', nome: 'Dona da Clínica' },
  {
    email: 'secretaria@clinica.com',
    senha: 'Clinica@2024',
    nome: 'Secretaria',
  },
];

async function main() {
  console.log('Criando usuários...\n');

  for (const { email, senha, nome } of usuarios) {
    const senhaHash = await argon2.hash(senha, { type: argon2.argon2id });

    await prisma.usuario.upsert({
      where: { email },
      update: {},
      create: { email, senhaHash, role: 'ADMIN' },
    });

    console.log(`✓ ${nome}`);
    console.log(`  Email: ${email}`);
    console.log(`  Senha: ${senha}\n`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
