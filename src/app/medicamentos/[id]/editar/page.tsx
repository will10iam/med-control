"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import MedicamentoForm from "@/components/MedicamentoForm";
import {
	getMedicamentoById,
	atualizarMedicamento,
} from "@/services/medicamentoService";

import { Medicamento } from "@/types/Medicamento";

import Link from "next/link";

import { MdKeyboardArrowLeft } from "react-icons/md";

import { toast } from "sonner";

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

		toast.success("Medicamento atualizado!");
		router.push(`/medicamentos/${med?.id}`);
	}

	if (!med) return <p>Carregando...</p>;

	return (
		<div className="p-4 bg-gray-100 text-black">
			<div className="flex items-center mb-6 mt-4 gap-2">
				<Link href={`/medicamentos/${med.id}`}>
					<MdKeyboardArrowLeft size={40} color="#3b3a3a" />
				</Link>
				<h1 className="text-2xl font-bold text-gray-900">Editar Medicamento</h1>
			</div>
			{med && <MedicamentoForm initialData={med} onSubmit={handleUpdate} />}
		</div>
	);
}
