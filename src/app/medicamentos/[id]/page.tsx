"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import { Medicamento } from "@/types/Medicamento";
import {
	usarComprimido,
	adicionarCaixa,
	deletarMedicamento,
} from "@/services/medicamentoService";

import { getStatus } from "@/utils/medicamentoUtils";

import { db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";

import Link from "next/link";

import { useRouter } from "next/navigation";

import { FaMinus, FaPlus } from "react-icons/fa";
import { MdKeyboardArrowLeft } from "react-icons/md";

import { toast } from "sonner";

export default function MedicamentoDetalhe() {
	const { id } = useParams();
	const [med, setMed] = useState<Medicamento | null>(null);

	const router = useRouter();

	useEffect(() => {
		if (!id) return;

		const ref = doc(db, "medicamentos", id as string);

		const unsubscribe = onSnapshot(ref, (snapshot) => {
			if (snapshot.exists()) {
				setMed({
					id: snapshot.id,
					...(snapshot.data() as Medicamento),
				});
			}
		});

		return () => unsubscribe();
	}, [id]);

	if (!med) return <p>Carregando...</p>;

	const status = getStatus(med.estoqueAtual, med.alertaMinimo);

	function getStatusColor(status: string) {
		if (status === "OK") return "bg-green-600 text-white-700";
		if (status === "Acabando") return "bg-yellow-400 text-yellow-700";
		if (status === "Acabou") return "bg-red-600 text-red-700";
	}

	function formatarData(dataISO: string) {
		const date = new Date(dataISO);

		const formatado = new Intl.DateTimeFormat("pt-BR", {
			day: "numeric",
			month: "long",
			year: "numeric",
		}).format(date);

		return formatado.replace(/^\w/, (c) => c.toUpperCase());
	}

	async function handleDelete(id: string) {
		/* const confirm = window.confirm("Deseja excluir este medicamento?");
		if (!confirm) return;

		await deletarMedicamento(id);
		toast.success("Medicamento Deletado!");
		router.push("/"); */

		toast("Excluir medicamento?", {
			description: "Essa ação não pode ser desfeita.",
			action: {
				label: "Excluir",
				onClick: async () => {
					await toast.promise(deletarMedicamento(id), {
						loading: "Excluindo...",
						success: "Medicamento deletado!",
						error: "Erro ao excluir",
					});
					className: "bg-red-500 text-white";

					router.push("/");
				},
			},
			cancel: {
				label: "Cancelar",
			},
		});
	}

	return (
		<div className="min-h-screen bg-gray-100 p-4 text-black">
			<div className="flex items-center mb-6 mt-4 gap-2">
				<Link href="/">
					<MdKeyboardArrowLeft size={40} color="#3b3a3a" />
				</Link>

				<h1 className="text-3xl font-bold">{med.nome}</h1>
			</div>

			<div className="flex items-center justify-between -ml-9 mr-3">
				<p className="text-black font-bold text-5xl ml-12 flex items-baseline gap-2">
					{med.estoqueAtual}{" "}
					<span className="font-medium text-2xl">comprimidos</span>
				</p>

				<p
					className={`px-4 py-2 rounded-full text-1xl text-white font-bold ${getStatusColor(status)}`}
				>
					{status}
				</p>
			</div>

			<div className="bg-white p-4 rounded-xl shadow space-y-2 flex items-center justify-between mt-7">
				<div>
					{/* <p>Tipo: {med.tipo}</p> */}

					<div className="mt-2 flex flex-col justify-center items-center">
						<button
							onClick={() => usarComprimido(med.id!, med.estoqueAtual)}
							className="w-81 h-12 bg-blue-800 text-white rounded-md flex items-center justify-center gap-8 cursor-pointer mb-2"
						>
							<FaMinus size={30} color="#FFF" />
							<span className="text-2xl">Usei 1 comprimido</span>
						</button>

						<button
							onClick={() =>
								adicionarCaixa(
									med.id!,
									med.estoqueAtual,
									med.quantidadePorCaixa,
								)
							}
							className="w-81 h-12 bg-blue-800 text-white rounded-md flex items-center justify-center gap-8 cursor-pointer"
						>
							<FaPlus size={30} color="#FFF" className="mr-0.5" />
							<span className="mr-2.5 text-2xl">Adicionar 1 Caixa</span>
						</button>
					</div>
				</div>
			</div>

			<div className="mt-4 bg-white p-4 rounded-xl shadow space-y-2 flex flex-col items-start justify-between">
				<p className="text-black font-bold text-2xl">Detalhes</p>

				<p className="font-bold text-gray-700">
					Quantidade:{" "}
					<span className="font-light italic">
						{med.quantidadePorCaixa} comprimidos
					</span>
				</p>
				<p className="font-bold text-gray-700">
					Dose:{" "}
					<span className="font-light italic">
						{med.comprimidosPorDia} por dia
					</span>
				</p>
				<p className="font-bold text-gray-700">
					Em que horário tomar?:{" "}
					<span className="font-light italic">
						Todos os dias às {med.horarios}
					</span>
				</p>
				<p className="font-bold text-gray-700">
					Início da caixa atual:{" "}
					<span className="font-light italic">
						{formatarData(med.dataInicio)}
					</span>
				</p>
			</div>

			<div className="mt-6 bg-blue-400 p-3 rounded-xl shadow space-y-2 flex items-center justify-between">
				<Link href={`/medicamentos/${med.id}/editar`}>
					<button className="text-white text-2xl font-bold">
						Editar Medicamento
					</button>
				</Link>
			</div>
			<div className="mt-2 bg-red-500 p-3 rounded-xl shadow space-y-2 flex items-center justify-between">
				<button
					onClick={() => handleDelete(med.id)}
					className="text-white text-2xl font-bold"
				>
					Excluir medicamento
				</button>
			</div>
		</div>
	);
}
