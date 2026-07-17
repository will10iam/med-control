import { NextRequest, NextResponse } from "next/server";

import { sendNovoMedicamento } from "@/server/telegram/telegramService";

export async function POST(req: NextRequest) {
	try {
		console.log("Recebi requisição para enviar ao Telegram");

		const medicamento = await req.json();

		console.log(medicamento);

		await sendNovoMedicamento(medicamento);

		console.log("Mensagem enviada!");

		return NextResponse.json({
			success: true,
		});
	} catch (error) {
		console.error(error);

		return NextResponse.json(
			{
				success: false,
			},
			{
				status: 500,
			},
		);
	}
}
