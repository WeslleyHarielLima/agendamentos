-- CreateTable
CREATE TABLE "compromissos" (
    "id" TEXT NOT NULL,
    "pacienteNome" TEXT NOT NULL,
    "procedimento" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "dataMarcacao" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "compromissos_pkey" PRIMARY KEY ("id")
);
