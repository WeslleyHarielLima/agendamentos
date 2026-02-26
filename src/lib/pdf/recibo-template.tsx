import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const B = 'Helvetica-Bold';

const styles = StyleSheet.create({
  page: {
    paddingHorizontal: 62,
    paddingTop: 56,
    paddingBottom: 72,
    fontSize: 10.5,
    fontFamily: 'Helvetica',
    color: '#111111',
  },
  headerBox: {
    borderBottom: '2pt solid #111111',
    paddingBottom: 12,
    marginBottom: 26,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  title: {
    fontSize: 17,
    fontFamily: B,
    letterSpacing: 1.2,
  },
  receiptNo: {
    fontSize: 9,
    color: '#666666',
    textAlign: 'right',
  },
  paragraph: {
    marginBottom: 13,
    lineHeight: 1.7,
    textAlign: 'justify',
  },
  divider: {
    borderBottom: '0.5pt solid #cccccc',
    marginTop: 20,
    marginBottom: 20,
  },
  locationRow: {
    lineHeight: 1.6,
    marginBottom: 4,
  },
  signatureArea: {
    marginTop: 52,
    width: '58%',
  },
  signatureLine: {
    borderBottom: '1pt solid #111111',
    paddingBottom: 30,
    marginBottom: 7,
  },
  signatureCaption: {
    fontSize: 9,
    color: '#555555',
    marginBottom: 5,
  },
  signatureDetail: {
    fontSize: 9.5,
    marginBottom: 3,
    lineHeight: 1.4,
  },
  footer: {
    position: 'absolute',
    bottom: 28,
    left: 62,
    right: 62,
    fontSize: 7.5,
    color: '#aaaaaa',
    textAlign: 'center',
    borderTop: '0.5pt solid #dddddd',
    paddingTop: 6,
  },
});

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

function formatData(date: Date | string): string {
  const d = date instanceof Date ? date : new Date(date);
  return `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}/${d.getFullYear()}`;
}

function formatDataHora(date: Date): string {
  return `${formatData(date)} às ${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
}

function formatBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

const UNIDADES = [
  '',
  'um',
  'dois',
  'três',
  'quatro',
  'cinco',
  'seis',
  'sete',
  'oito',
  'nove',
  'dez',
  'onze',
  'doze',
  'treze',
  'quatorze',
  'quinze',
  'dezesseis',
  'dezessete',
  'dezoito',
  'dezenove',
];
const DEZENAS = [
  '',
  '',
  'vinte',
  'trinta',
  'quarenta',
  'cinquenta',
  'sessenta',
  'setenta',
  'oitenta',
  'noventa',
];
const CENTENAS = [
  '',
  'cento',
  'duzentos',
  'trezentos',
  'quatrocentos',
  'quinhentos',
  'seiscentos',
  'setecentos',
  'oitocentos',
  'novecentos',
];

function numeroPorExtenso(n: number): string {
  if (n === 0) return 'zero';
  const partes: string[] = [];

  if (n >= 1000000) {
    const m = Math.floor(n / 1000000);
    partes.push(`${numeroPorExtenso(m)} ${m === 1 ? 'milhão' : 'milhões'}`);
    n %= 1000000;
  }
  if (n >= 1000) {
    const k = Math.floor(n / 1000);
    partes.push(k === 1 ? 'mil' : `${numeroPorExtenso(k)} mil`);
    n %= 1000;
  }
  if (n >= 100) {
    const c = Math.floor(n / 100);
    const resto = n % 100;
    partes.push(resto === 0 && c === 1 ? 'cem' : CENTENAS[c]);
    n = resto;
  }
  if (n >= 20) {
    const d = Math.floor(n / 10);
    const u = n % 10;
    partes.push(u > 0 ? `${DEZENAS[d]} e ${UNIDADES[u]}` : DEZENAS[d]);
  } else if (n > 0) {
    partes.push(UNIDADES[n]);
  }

  return partes.join(' e ');
}

function valorPorExtenso(valor: number): string {
  const intPart = Math.floor(valor);
  const centPart = Math.round((valor - intPart) * 100);
  const partes: string[] = [];

  if (intPart > 0)
    partes.push(
      `${numeroPorExtenso(intPart)} ${intPart === 1 ? 'real' : 'reais'}`
    );
  if (centPart > 0)
    partes.push(
      `${numeroPorExtenso(centPart)} ${centPart === 1 ? 'centavo' : 'centavos'}`
    );

  return partes.length === 0 ? 'zero reais' : partes.join(' e ');
}

export type ReciboCompromisso = {
  id: string;
  pacienteNome: string;
  procedimento: string;
  telefone: string;
  descricao: string;
  dataMarcacao: Date | string;
  valorCobrado: number | string | null;
  observacao: string | null;
  paciente: {
    nome: string;
    cpf?: string | null;
    telefone: string;
    email?: string | null;
    logradouro?: string | null;
    numero?: string | null;
    complemento?: string | null;
    bairro?: string | null;
    cidade?: string | null;
    estado?: string | null;
    cep?: string | null;
  } | null;
  procedimentoRel: { nome: string } | null;
};

const _ = '__________________________';

function buildEndereco(p: ReciboCompromisso['paciente']): string | null {
  if (!p) return null;
  const linha1 = [p.logradouro, p.numero, p.complemento]
    .filter(Boolean)
    .join(', ');
  const linha2 = [p.bairro, p.cidade, p.estado].filter(Boolean).join('/');
  const cep = p.cep ? `CEP ${p.cep}` : '';
  const parts = [linha1, linha2, cep].filter(Boolean);
  return parts.length > 0 ? parts.join(' — ') : null;
}

function buildLocalidade(p: ReciboCompromisso['paciente']): string {
  if (!p) return _;
  const cidade = [p.cidade, p.estado].filter(Boolean).join('/');
  return cidade || _;
}

export function ReciboTemplate({
  compromisso,
}: {
  compromisso: ReciboCompromisso;
}) {
  const p = compromisso.paciente;
  const nomePaciente = p?.nome ?? compromisso.pacienteNome;
  const cpfPaciente = p?.cpf ?? null;
  const telefonePaciente = p?.telefone ?? compromisso.telefone;
  const enderecoPaciente = buildEndereco(p);
  const localidade = buildLocalidade(p);

  const valor = Number(compromisso.valorCobrado ?? 0);
  const dataAtendimento = formatData(compromisso.dataMarcacao);
  const dataEmissao = formatData(new Date());
  const receiptNo = compromisso.id.slice(-8).toUpperCase();

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Cabeçalho */}
        <View style={styles.headerBox}>
          <Text style={styles.title}>RECIBO DE PAGAMENTO</Text>
          <Text style={styles.receiptNo}>{'Nº ' + receiptNo}</Text>
        </View>

        {/* Parágrafo 1 — Declaração principal */}
        <Text style={styles.paragraph}>
          {'Eu, '}
          <Text style={{ fontFamily: B }}>Clínica</Text>
          {`, inscrito(a) no CPF/CNPJ sob o nº ${_}, residente/situado(a) em ${_}, telefone ${_}, declaro que recebi de `}
          <Text style={{ fontFamily: B }}>{nomePaciente}</Text>
          {', CPF/CNPJ nº '}
          <Text style={{ fontFamily: B }}>{cpfPaciente ?? _}</Text>
          {', residente/situado(a) em '}
          <Text style={{ fontFamily: B }}>{enderecoPaciente ?? _}</Text>
          {', telefone '}
          <Text style={{ fontFamily: B }}>{telefonePaciente}</Text>
          {', na data de '}
          <Text style={{ fontFamily: B }}>{dataAtendimento}</Text>
          {', o valor de '}
          <Text style={{ fontFamily: B }}>{formatBRL(valor)}</Text>
          {' ('}
          <Text style={{ fontFamily: B }}>{valorPorExtenso(valor)}</Text>
          {`)`}
        </Text>

        {/* Parágrafo 2 — Referência do pagamento */}
        <Text style={styles.paragraph}>
          {'O pagamento refere-se a '}
          <Text style={{ fontFamily: B }}>{compromisso.procedimento}</Text>
          {
            ', e corresponde à quitação total da obrigação assumida entre as partes.'
          }
        </Text>

        {/* Parágrafo 3 — Terceiro autorizado */}
        <Text style={styles.paragraph}>
          {
            'Caso este pagamento tenha sido efetuado por terceiro autorizado, este recibo confirma que o mesmo ocorreu com ciência e concordância do credor.'
          }
        </Text>

        {/* Parágrafo 4 — Declaração legal */}
        <Text style={styles.paragraph}>
          {
            'Declaro, para todos os fins de direito, que este recibo é verdadeiro e representa fielmente a transação realizada.'
          }
        </Text>

        <View style={styles.divider} />

        {/* Local e data */}
        <Text style={styles.locationRow}>
          {'Local: '}
          <Text style={{ fontFamily: B }}>{localidade}</Text>
          {',  '}
          <Text style={{ fontFamily: B }}>{dataEmissao}</Text>
        </Text>

        {/* Rodapé */}
        <Text style={styles.footer}>
          {'Documento gerado digitalmente em ' +
            formatDataHora(new Date()) +
            '  ·  Referência: ' +
            compromisso.id}
        </Text>
      </Page>
    </Document>
  );
}
