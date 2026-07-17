import { NextResponse } from "next/server";
import { sendTelegramMessage } from "@/server/telegram/telegramService";

export async function GET() {
	try {
		await sendTelegramMessage(
			"🚀 MedControl conectado com sucesso ao Telegram!",
		);

		return NextResponse.json({
			success: true,
		});
	} catch {
		return NextResponse.json(
			{
				success: false,
			},
			{ status: 500 },
		);
	}
}
