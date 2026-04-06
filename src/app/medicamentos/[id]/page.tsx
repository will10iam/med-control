"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import { Medicamento } from "@/types/Medicamento";
import { usarComprimido, adicionarCaixa } from "@/services/medicamentoService";

import { db } from "@/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";

export default function MedicamentoDetalhe() {
	const { id } = useParams();
	const [med, setMed] = useState<Medicamento | null>(null);

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

	return (
		<div className="min-h-screen bg-gray-100 p-4">
			<h1 className="text-2xl font-bold mb-4">{med.nome}</h1>

			<div className="bg-white p-4 rounded-xl shadow space-y-2">
				<p>Estoque: {med.estoqueAtual}</p>
				<p>Tipo: {med.tipo}</p>
			</div>

			<div className="mt-4 space-y-2">
				<button
					onClick={() => usarComprimido(med.id!, med.estoqueAtual)}
					className="w-full bg-red-500 text-white p-3 rounded-lg cursor-pointer"
				>
					Usar 1 comprimido
				</button>

				<button
					onClick={() =>
						adicionarCaixa(med.id!, med.estoqueAtual, med.quantidadePorCaixa)
					}
					className="w-full bg-green-600 text-white p-3 rounded-lg cursor-pointer"
				>
					Adicionar Caixa
				</button>
			</div>
		</div>
	);
}
