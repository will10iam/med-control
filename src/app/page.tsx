"use client";

import { useEffect, useState } from "react";
import {
	getMedicamentos,
	subscribeMedicamentos,
} from "@/services/medicamentoService";
import { Medicamento } from "@/types/Medicamento";

import { getStatus } from "@/utils/medicamentoUtils";

import Link from "next/link";

export default function Home() {
	const [medicamentos, setMedicamentos] = useState<Medicamento[]>([]);

	/* useEffect(() => {
		async function fetchData() {
			const data = await getMedicamentos();
			console.log("DADOS:", data);
			setMedicamentos(data as Medicamento[]);
			console.log(medicamentos);
		}
		fetchData();
	}, []); */

	useEffect(() => {
		const unsubscribe = subscribeMedicamentos((data: Medicamento[]) => {
			setMedicamentos(data);
		});

		return () => unsubscribe();
	}, []);

	return (
		<div className="min-h-screen bg-gray-100 p-4">
			<h1 className="text-2xl font-bold mb-4">Medicamentos</h1>

			<Link href="/medicamentos/novo">
				<button className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-full shadow-lg">
					+ Adicionar Medicamento
				</button>
			</Link>

			<div className="space-y-3">
				{medicamentos.map((med) => {
					const status = getStatus(med.estoqueAtual, med.alertaMinimo);

					return (
						<Link href={`/medicamentos/${med.id}`} key={med.id}>
							<div className="bg-white p-4 rounded-xl shadow flex justify-between items-center cursor-pointer">
								<div>
									<p className="font-semibold text-lg">{med.nome}</p>
									<p className="text-gray-500">
										{med.estoqueAtual} comprimidos
									</p>
								</div>

								<span
									className={`px-3 py-1 rounded-full text-sm font-medium ${status === "ok" ? "bg-green-100 text-green-700" : status === "acabando" ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"}`}
								>
									{status === "ok"
										? "OK"
										: status === "acabando"
											? "Acabando"
											: "Acabou"}
								</span>
							</div>
						</Link>
					);
				})}
			</div>
		</div>
	);
}
