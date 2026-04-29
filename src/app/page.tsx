"use client";

import { useEffect, useState } from "react";
import {
	getMedicamentos,
	subscribeMedicamentos,
	salvarToken,
} from "@/services/medicamentoService";
import { Medicamento } from "@/types/Medicamento";

import { getStatus } from "@/utils/medicamentoUtils";

import Link from "next/link";
import { requestNotificationPermission } from "@/lib/firebaseMessaging";

import { IoNotifications } from "react-icons/io5";
import { FaPlus } from "react-icons/fa6";

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

	async function handleAtivarNotificacoes() {
		const token = await requestNotificationPermission();

		if (token) {
			await salvarToken(token);
			alert("Notificações ativadas");
		}
	}

	function getStatusColor(status: string) {
		if (status === "OK") return "bg-green-600 text-white-700";
		if (status === "Acabando") return "bg-yellow-400 text-yellow-700";
		if (status === "Acabou") return "bg-red-600 text-red-700";
	}

	return (
		<div className="min-h-screen bg-gray-100 flex justify-center">
			<div className="w-full max-w-md bg-gray-100 p-4">
				<div className="flex space-x-16">
					<h1 className="ml-3 text-3xl font-bold mb-4 text-start text-black">
						Medicamentos
					</h1>
					<div className="flex items-center">
						<Link href="/medicamentos/novo">
							<button className="mb-4 bg-green-500 px-1 py-1 rounded-full text-2xl">
								<FaPlus size={20} />
							</button>
						</Link>
						<button
							onClick={handleAtivarNotificacoes}
							className="mb-4 text-gray-600 px-4 py-2 rounded-lg text-2xl"
						>
							<IoNotifications size={25} />
						</button>
					</div>
				</div>

				<div className="space-y-3">
					{medicamentos.map((med) => {
						const status = getStatus(med.estoqueAtual, med.alertaMinimo);

						return (
							<Link href={`/medicamentos/${med.id}`} key={med.id}>
								<div className="bg-white p-4 rounded-2xl shadow flex justify-between items-center cursor-pointer mb-2">
									<div>
										<p className="font-semibold text-lg text-gray-700">
											{med.nome}
										</p>
										<p className="text-gray-400 text-sm">
											{med.estoqueAtual} comprimidos restantes
										</p>
									</div>

									<span
										className={`px-2 py-1 rounded-full text-sm font-bold ${getStatusColor(status)}`}
									>
										{status}
									</span>
								</div>
							</Link>
						);
					})}
				</div>
			</div>
		</div>
	);
}
