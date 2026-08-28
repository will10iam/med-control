import { NextResponse } from "next/server";
import { notificarNovaCaixa } from "@/services/notificacaoService";

export async function POST(request: Request) {
	try {
		const { nome, quantidadeAdicionada, estoqueTotal } = await request.json();

		await notificarNovaCaixa(nome, quantidadeAdicionada, estoqueTotal);

		return NextResponse.json({
			success: true,
		});
	} catch (error) {
		console.error("Erro ao enviar notificação de nova caixa:", error);

		return NextResponse.json(
			{
				success: false,
				error: "Erro ao enviar notificação.",
			},
			{ status: 500 },
		);
	}
}
