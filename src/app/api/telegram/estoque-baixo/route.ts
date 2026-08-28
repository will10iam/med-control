import { NextResponse } from "next/server";
import { notificarEstoqueBaixo } from "@/services/notificacaoService";

export async function POST(request: Request) {
	try {
		const { nome, estoqueRestante, alertaMinimo } = await request.json();

		await notificarEstoqueBaixo(nome, estoqueRestante, alertaMinimo);

		return NextResponse.json({
			success: true,
		});
	} catch (error) {
		console.error("Erro ao enviar notificação de estoque baixo:", error);

		return NextResponse.json(
			{
				success: false,
				error: "Erro ao enviar notificação.",
			},
			{ status: 500 },
		);
	}
}
