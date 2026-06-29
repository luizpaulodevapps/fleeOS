const UNIDADES = [
  "", "um", "dois", "três", "quatro", "cinco", "seis", "sete", "oito", "nove",
  "dez", "onze", "doze", "treze", "quatorze", "quinze", "dezesseis", "dezessete", "dezoito", "dezenove",
];

const DEZENAS = [
  "", "", "vinte", "trinta", "quarenta", "cinquenta",
  "sessenta", "setenta", "oitenta", "noventa",
];

const CENTENAS = [
  "", "cento", "duzentos", "trezentos", "quatrocentos", "quinhentos",
  "seiscentos", "setecentos", "oitocentos", "novecentos",
];

const MILHAR = "mil";
const MILHAO = "milhão";
const MILHOES = "milhões";
const BILHAO = "bilhão";
const BILHOES = "bilhões";

function extensoDezena(n: number): string {
  if (n < 20) return UNIDADES[n];
  const d = Math.floor(n / 10);
  const u = n % 10;
  return DEZENAS[d] + (u > 0 ? ` e ${UNIDADES[u]}` : "");
}

function extensoCentena(n: number): string {
  if (n === 100) return "cem";
  const c = Math.floor(n / 100);
  const restante = n % 100;
  if (restante === 0) return CENTENAS[c];
  return `${CENTENAS[c]} e ${extensoDezena(restante)}`;
}

function extensoGrupo(n: number): string {
  if (n === 0) return "";
  if (n < 100) return extensoDezena(n);
  if (n < 1000) return extensoCentena(n);
  const milhar = Math.floor(n / 1000);
  const restante = n % 1000;
  const textoMilhar = milhar === 1 ? MILHAR : `${extensoGrupo(milhar)} ${MILHAR}`;
  if (restante === 0) return textoMilhar;
  return `${textoMilhar} e ${extensoGrupo(restante)}`;
}

function splitGroups(n: number): number[] {
  const groups: number[] = [];
  let temp = n;
  while (temp > 0) {
    groups.unshift(temp % 1000);
    temp = Math.floor(temp / 1000);
  }
  return groups.length > 0 ? groups : [0];
}

/**
 * Converte um número para extenso em português.
 * Ex: 1500 -> "mil e quinhentos"
 * Ex: 1234565 -> "um milhão, duzentos e trinta e quatro mil, quinhentos e sessenta e cinco"
 */
export function numeroPorExtenso(n: number): string {
  if (n === 0) return "zero";
  if (n < 0) return `menos ${numeroPorExtenso(-n)}`;

  const groups = splitGroups(n);
  const totalGroups = groups.length;
  const parts: string[] = [];

  for (let i = 0; i < totalGroups; i++) {
    const group = groups[i];
    if (group === 0) continue;

    const position = totalGroups - i - 1; // 0 = unidades, 1 = milhares, 2 = milhões, 3 = bilhões
    let nomeGrupo = "";

    if (position === 0) {
      nomeGrupo = extensoGrupo(group);
    } else if (position === 1) {
      nomeGrupo = group === 1 ? MILHAR : `${extensoGrupo(group)} ${MILHAR}`;
    } else if (position === 2) {
      nomeGrupo = group === 1 ? MILHAO : `${extensoGrupo(group)} ${MILHOES}`;
    } else if (position === 3) {
      nomeGrupo = group === 1 ? BILHAO : `${extensoGrupo(group)} ${BILHOES}`;
    }

    parts.push(nomeGrupo);
  }

  if (parts.length === 1) return parts[0];
  if (parts.length === 2) return `${parts[0]} e ${parts[1]}`;
  return `${parts.slice(0, -1).join(", ")} e ${parts[parts.length - 1]}`;
}

/**
 * Converte um valor monetário para extenso.
 * Ex: 1500.50 -> "um mil e quinhentos reais e cinquenta centavos"
 */
export function valorPorExtenso(valor: number): string {
  const inteiro = Math.floor(valor);
  const centavos = Math.round((valor - inteiro) * 100);

  const textoReais = inteiro === 1 ? "real" : "reais";
  const parteInteira = `${numeroPorExtenso(inteiro)} ${textoReais}`;

  if (centavos === 0) return parteInteira;

  const textoCentavos = centavos === 1 ? "centavo" : "centavos";
  return `${parteInteira} e ${numeroPorExtenso(centavos)} ${textoCentavos}`;
}

/**
 * Converte uma string de valor (ex: "1500,50" ou "1500.50") para extenso.
 * Retorna string vazia se não for um número válido.
 */
export function valorStringPorExtenso(valorStr: string): string {
  const cleaned = valorStr.replace(/\./g, "").replace(",", ".");
  const num = parseFloat(cleaned);
  if (isNaN(num)) return "";
  return valorPorExtenso(num);
}

/**
 * Converte uma data para extenso.
 * Ex: "2026-06-28" -> "vinte e oito de junho de 2026"
 */
export function dataPorExtenso(dateStr: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr + (dateStr.length === 10 ? "T12:00:00" : ""));
  if (isNaN(d.getTime())) return dateStr;

  const dias = [
    "", "primeiro", "dois", "três", "quatro", "cinco", "seis", "sete", "oito", "nove",
    "dez", "onze", "doze", "treze", "quatorze", "quinze", "dezesseis", "dezessete",
    "dezoito", "dezenove", "vinte", "vinte e um", "vinte e dois", "vinte e três",
    "vinte e quatro", "vinte e cinco", "vinte e seis", "vinte e sete", "vinte e oito",
    "vinte e nove", "trinta", "trinta e um",
  ];

  const meses = [
    "janeiro", "fevereiro", "março", "abril", "maio", "junho",
    "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
  ];

  const dia = d.getDate();
  const mes = meses[d.getMonth()];
  const ano = d.getFullYear();

  return `${dias[dia]} de ${mes} de ${ano}`;
}
