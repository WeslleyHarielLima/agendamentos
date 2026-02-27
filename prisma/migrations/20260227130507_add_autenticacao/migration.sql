-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'USUARIO');

-- CreateEnum
CREATE TYPE "StatusCompromisso" AS ENUM ('AGENDADO', 'REALIZADO', 'CANCELADO');

-- CreateEnum
CREATE TYPE "Sexo" AS ENUM ('MASCULINO', 'FEMININO', 'OUTRO');

-- AlterTable
ALTER TABLE "compromissos" ADD COLUMN     "observacao" TEXT,
ADD COLUMN     "pacienteId" TEXT,
ADD COLUMN     "procedimentoId" TEXT,
ADD COLUMN     "status" "StatusCompromisso" NOT NULL DEFAULT 'AGENDADO',
ADD COLUMN     "valorCobrado" DECIMAL(65,30);

-- CreateTable
CREATE TABLE "pacientes" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cpf" TEXT,
    "dataNascimento" TIMESTAMP(3),
    "sexo" "Sexo",
    "telefone" TEXT NOT NULL,
    "email" TEXT,
    "cep" TEXT,
    "logradouro" TEXT,
    "numero" TEXT,
    "complemento" TEXT,
    "bairro" TEXT,
    "cidade" TEXT,
    "estado" TEXT,
    "observacoes" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pacientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senhaHash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USUARIO',
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "tentativas" INTEGER NOT NULL DEFAULT 0,
    "bloqueadoAte" TIMESTAMP(3),
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "ip" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "procedimentos" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "valor" DECIMAL(65,30) NOT NULL,
    "descricao" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "procedimentos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_token_key" ON "sessions"("token");

-- AddForeignKey
ALTER TABLE "compromissos" ADD CONSTRAINT "compromissos_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "pacientes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compromissos" ADD CONSTRAINT "compromissos_procedimentoId_fkey" FOREIGN KEY ("procedimentoId") REFERENCES "procedimentos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
