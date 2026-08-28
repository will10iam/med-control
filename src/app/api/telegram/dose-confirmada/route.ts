import { NextResponse } from "next/server";
import { notificarDoseConfirmada } from "@/services/notificacaoService";

export async function POST(request: Request) {
	try {
		const { nome, horario, estoqueRestante } = await request.json();

		await notificarDoseConfirmada(nome, horario, estoqueRestante);

		return NextResponse.json({
			success: true,
		});
	} catch (error) {
		console.error("Erro ao enviar notificação de dose confirmada:", error);

		return NextResponse.json(
			{
				success: false,
				error: "Erro ao enviar notificação.",
			},
			{ status: 500 },
		);
	}
}
