import axios from "axios";
import { Medicamento } from "@/types/Medicamento";
import { formatarDataExtenso } from "@/utils/dateUtils";

const TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID!;

export async function sendTelegramMessage(text: string) {
	await axios.post(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
		chat_id: CHAT_ID,
		text,
		parse_mode: "Markdown",
	});
}

export async function sendNovoMedicamento(medicamento: Medicamento) {
	const horarios = medicamento.horarios?.length
		? medicamento.horarios.map((h) => `• ${h}`).join("\n")
		: "Não informado";

	const mensagem = `
💊 *Novo medicamento cadastrado!*

*Nome:* ${medicamento.nome}

📅 *Início do tratamento:*
${formatarDataExtenso(medicamento.dataInicio)}

💊 *Dose diária:*
${medicamento.comprimidosPorDia ?? 1} comprimido(s)

⏰ *Horários:*
${horarios}

📦 *Quantidade:*
${medicamento.quantidadePorCaixa} comprimidos

✅ Cadastro realizado com sucesso!
`;

	await sendTelegramMessage(mensagem);
}

export async function enviarLembreteDose(nome: string, horario: string) {
	const mensagem = `
💊 Hora do seu medicamento!

Daqui a 10 minutos você deverá tomar:

💊 ${nome}

🕒 Horário: ${horario}

Após tomar, confirme a dose no aplicativo.

MedControl
`;

	return sendTelegramMessage(mensagem);
}

export async function enviarLembreteAtraso(nome: string, horario: string) {
	const mensagem = `
⚠️ Você esqueceu seu medicamento!

Você ainda não confirmou a dose de:

💊 ${nome}

Já faz mais de 15 minutos do horário previsto.

🕒 Horário previsto: ${horario}

Caso já tenha tomado o medicamento,
abra o MedControl e confirme a dose.

MedControl
`;

	await sendTelegramMessage(mensagem);
}

export async function enviarDoseConfirmada(
	nome: string,
	horario: string,
	estoqueRestante: number,
) {
	const mensagem = `
✅ Dose registrada!

💊 Medicamento: ${nome}

🕒 Horário: ${horario}

📦 Estoque restante: ${estoqueRestante} comprimido(s)

MedControl
`;
	await sendTelegramMessage(mensagem);
}

export async function enviarNovaCaixa(
	nome: string,
	quantidadeAdicionada: number,
	estoqueTotal: number,
) {
	const mensagem = `
📦 Nova caixa registrada!

💊 Medicamento: ${nome}

➕ Quantidade adicionada: ${quantidadeAdicionada} comprimido(s)

📦 Estoque atual: ${estoqueTotal} comprimido(s)

MedControl
`;

	await sendTelegramMessage(mensagem);
}

export async function enviarEstoqueBaixo(
	nome: string,
	estoqueRestante: number,
	alertaMinimo: number,
) {
	const mensagem = `
⚠️ Estoque baixo!

💊 Medicamento: ${nome}

📦 Restam apenas ${estoqueRestante} comprimido(s).

⚠️ Seu limite de alerta é ${alertaMinimo} comprimido(s).

Considere providenciar uma nova caixa.

MedControl
`;

	await sendTelegramMessage(mensagem);
}

export async function enviarEstoqueEsgotado(nome: string) {
	const mensagem = `
🚨 Medicamento esgotado!

💊 ${nome}

📦 O estoque chegou a 0 comprimidos.

Nenhuma nova dose será programada até que o medicamento seja reabastecido.

MedControl
`;

	await sendTelegramMessage(mensagem);
}
