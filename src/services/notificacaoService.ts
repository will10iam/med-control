import {
	enviarDoseConfirmada,
	enviarNovaCaixa,
	enviarEstoqueBaixo,
	enviarEstoqueEsgotado,
} from "@/server/telegram/telegramService";

export async function notificarDoseConfirmada(
	nome: string,
	horario: string,
	estoqueRestante: number,
) {
	await enviarDoseConfirmada(nome, horario, estoqueRestante);
}

export async function notificarNovaCaixa(
	nome: string,
	quantidadeAdicionada: number,
	estoqueTotal: number,
) {
	await enviarNovaCaixa(nome, quantidadeAdicionada, estoqueTotal);
}

export async function notificarEstoqueBaixo(
	nome: string,
	estoqueRestante: number,
	alertaMinimo: number,
) {
	await enviarEstoqueBaixo(nome, estoqueRestante, alertaMinimo);
}

export async function notificarEstoqueEsgotado(nome: string) {
	await enviarEstoqueEsgotado(nome);
}
