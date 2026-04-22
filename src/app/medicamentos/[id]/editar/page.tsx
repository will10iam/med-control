"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import MedicamentoForm from "@/components/MedicamentoForm";
import {
	getMedicamentoById,
	atualizarMedicamento,
} from "@/services/medicamentoService";

import { Medicamento } from "@/types/Medicamento";

export default function EditarMedicamento() {
	const { id } = useParams();
	const router = useRouter();

	const [med, setMed] = useState<Medicamento | null>(null);

	useEffect(() => {
		async function load() {
			const data = await getMedicamentoById(id as string);
			setMed(data);
		}

		load();
	}, [id]);

	async function handleUpdate(data: Partial<Medicamento>) {
		await atualizarMedicamento(id as string, data);

		alert("Atualizado!");
		router.push("/");
	}

	if (!med) return <p>Carregando...</p>;

	return (
		<div className="p-4">
			<h1 className="text-xl font-bold mb-4">Editar Medicamento</h1>
			{med && <MedicamentoForm initialData={med} onSubmit={handleUpdate} />}
		</div>
	);
}
