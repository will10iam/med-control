import { NextResponse } from "next/server";
import { notificarEstoqueEsgotado } from "@/services/notificacaoService";

export async function POST(request: Request) {
	try {
		const { nome } = await request.json();

		await notificarEstoqueEsgotado(nome);

		return NextResponse.json({
			success: true,
		});
	} catch (error) {
		console.error("Erro ao enviar notificação de estoque esgotado:", error);

		return NextResponse.json(
			{
				success: false,
				error: "Erro ao enviar notificação.",
			},
			{ status: 500 },
		);
	}
}
