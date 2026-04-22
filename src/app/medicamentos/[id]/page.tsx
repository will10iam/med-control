"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import { Medicamento } from "@/types/Medicamento";
import {
	usarComprimido,
	adicionarCaixa,
	deletarMedicamento,
} from "@/services/medicamentoService";

import { db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";

import Link from "next/link";

import { useRouter } from "next/navigation";

import { FaMinus, FaPlus } from "react-icons/fa";
import { MdKeyboardArrowLeft } from "react-icons/md";

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
	/* const snapshot = await getDoc(ref);

        if (snapshot.exists()) {
            setMed({
                id: snapshot.id,
                ...(snapshot.data() as Medicamento),
            });
        }
    }
    fetchMedicamento(); */

	if (!med) return <p>Carregando...</p>;

	async function handleDelete(id: string) {
		const confirm = window.confirm("Deseja excluir este medicamento?");
		if (!confirm) return;

		await deletarMedicamento(id);

		router.push("/");
	}

	return (
		<div className="min-h-screen bg-gray-100 p-4 text-black">
			<div className="flex items-center mb-6 mt-4 gap-2">
				<Link href="/">
					<MdKeyboardArrowLeft size={40} color="#3b3a3a" />
				</Link>

				<h1 className="text-3xl font-bold">{med.nome}</h1>
			</div>

			<p className="text-black font-bold text-3xl ml-12">
				{med.estoqueAtual}{" "}
				<span className="font-medium text-lg">comprimidos</span>
			</p>

			<div className="bg-white p-4 rounded-xl shadow space-y-2 flex items-center justify-between">
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
					Início da caixa atual: <span className="font-light italic"></span>
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
