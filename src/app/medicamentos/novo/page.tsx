"use client";

import { useState } from "react";
import { addMedicamento } from "@/services/medicamentoService";

import { useRouter } from "next/navigation";

export default function NovoMedicamento() {
	const [nome, setNome] = useState("");
	const [tipo, setTipo] = useState<"contínuo" | "eventual">("contínuo");
	const [quantidade, setQuantidade] = useState(30);
	const [porDia, setPorDia] = useState(1);
	const [alerta, setAlerta] = useState(5);

	const router = useRouter();

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();

		await addMedicamento({
			nome,
			tipo,
			quantidadePorCaixa: quantidade,
			comprimidosPorDia: tipo === "contínuo" ? porDia : undefined,
			estoqueAtual: quantidade,
			alertaMinimo: alerta,
			dataInicio: new Date().toISOString(),
			createdAt: new Date().toISOString(),
		});

		alert("Medicamento cadastrado!");
		router.push("/");
	}

	return (
		<div className="min-h-screen bg-gray-100 p-4">
			<h1 className="text-xl font-bold mb-4">Adicionar Medicamento</h1>

			<form onSubmit={handleSubmit} className="space-y-4">
				<input
					placeholder="Nome do medicamento"
					className="w-full p-3 rounded-lg border"
					value={nome}
					onChange={(e) => setNome(e.target.value)}
				/>

				<select
					className="w-full p-3 rounded-lg border"
					value={tipo}
					onChange={(e) => setTipo(e.target.value as never)}
				>
					<option value="continuo">Contínuo</option>
					<option value="eventual">Eventual</option>
				</select>

				<input
					type="number"
					placeholder="Comprimidos por caixa"
					className="w-full p-3 rounded-lg border"
					value={quantidade}
					onChange={(e) => setQuantidade(Number(e.target.value))}
				/>

				{tipo === "contínuo" && (
					<input
						type="number"
						placeholder="Comprimidos por dia"
						className="w-full p-3 rounded-lg border"
						value={porDia}
						onChange={(e) => setPorDia(Number(e.target.value))}
					/>
				)}

				<input
					type="number"
					placeholder="Alerta mínimo"
					className="w-full p-3 rounded-lg border"
					value={alerta}
					onChange={(e) => setAlerta(Number(e.target.value))}
				/>

				<button className="w-full bg-green-600 text-white p-3 rounded-lg">
					Salvar
				</button>
			</form>
		</div>
	);
}
