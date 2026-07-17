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
