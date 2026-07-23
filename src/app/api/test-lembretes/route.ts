import { NextResponse } from "next/server";
import { buscarDosesParaLembrete } from "@/services/doseService";

export async function GET() {
	try {
		const doses = await buscarDosesParaLembrete();

		return NextResponse.json({
			success: true,
			total: doses.length,
			doses,
		});
	} catch (error) {
		console.error(error);

		return NextResponse.json(
			{
				success: false,
				error: "Erro ao buscar lembretes.",
			},
			{ status: 500 },
		);
	}
}
