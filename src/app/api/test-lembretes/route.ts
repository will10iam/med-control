import { NextResponse } from "next/server";
import {
	buscarDosesParaLembrete,
	buscarDosesAtrasadas,
	marcarLembrete10MinEnviado,
	marcarLembreteAtrasoEnviado,
} from "@/services/doseService";

import {
	enviarLembreteDose,
	enviarLembreteAtraso,
} from "@/server/telegram/telegramService";
/* import { marcarLembreteEnviado } from "@/services/doseService"; */

export async function GET() {
	try {
		const doses = await buscarDosesParaLembrete();

		let enviados = 0;

		for (const dose of doses) {
			try {
				await enviarLembreteDose(dose.medicamentoNome, dose.horario);

				await marcarLembrete10MinEnviado(dose.id!);

				enviados++;
			} catch (erro) {
				console.error(`Erro ao enviar lembrete da dose ${dose.id}`, erro);
			}
		}

		const dosesAtrasadas = await buscarDosesAtrasadas();

		let atrasosEnviados = 0;

		for (const dose of dosesAtrasadas) {
			try {
				await enviarLembreteAtraso(dose.medicamentoNome, dose.horario);

				await marcarLembreteAtrasoEnviado(dose.id!);

				atrasosEnviados++;
			} catch (erro) {
				console.error(
					`Erro ao enviar aviso de atraso da dose ${dose.id}`,
					erro,
				);
			}
		}

		return NextResponse.json({
			success: true,

			totalLembretes: doses.length,
			lembretesEnviados: enviados,

			totalAtrasadas: dosesAtrasadas.length,
			atrasosEnviados,
		});
	} catch (error) {
		console.error(error);

		return NextResponse.json(
			{
				success: false,
				error: "Erro ao processar lembretes.",
			},
			{ status: 500 },
		);
	}
}
