"use client";

import { useState } from "react";
import { Medicamento } from "@/types/Medicamento";

type Props = {
	initialData?: Medicamento;
	onSubmit: (data: Partial<Medicamento>) => Promise<void>;
};

export default function MedicamentoForm({ initialData, onSubmit }: Props) {
	const [nome, setNome] = useState(initialData?.nome || "");
	const [tipo, setTipo] = useState<"continuo" | "eventual">(
		initialData?.tipo || "continuo",
	);
	const [quantidade, setQuantidade] = useState(
		initialData?.quantidadePorCaixa || 30,
	);
	const [porDia, setPorDia] = useState(initialData?.comprimidosPorDia || 1);
	const [alerta, setAlerta] = useState(initialData?.alertaMinimo || 5);
	const [horarios, setHorarios] = useState(
		initialData?.horarios?.join(", ") || "",
	);

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();

		const horariosArray = horarios
			.split(",")
			.map((h) => h.trim())
			.filter((h) => /^\d{2}:\d{2}$/.test(h));

		await onSubmit({
			nome,
			tipo,
			quantidadePorCaixa: quantidade,
			comprimidosPorDia: tipo === "continuo" ? porDia : undefined,
			alertaMinimo: alerta,
			horarios: horariosArray,
		});
	}

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			<input
				placeholder="Nome do medicamento"
				value={nome}
				onChange={(e) => setNome(e.target.value)}
				className="w-full p-3 border rounded-lg"
			/>

			<select
				value={tipo}
				onChange={(e) => setTipo(e.target.value as never)}
				className="w-full p-3 border rounded-lg"
			>
				<option value="contínuo">Contínuo</option>
				<option value="eventual">Eventual</option>
			</select>

			<input
				type="number"
				placeholder="Comprimidos por caixa"
				value={quantidade}
				onChange={(e) => setQuantidade(Number(e.target.value))}
				className="w-full p-3 border rounded-lg"
			/>

			{tipo === "continuo" && (
				<input
					type="number"
					placeholder="Comprimidos por dia"
					value={porDia}
					onChange={(e) => setPorDia(Number(e.target.value))}
					className="w-full p-3 border rounded-lg"
				/>
			)}

			{tipo === "continuo" && (
				<input
					type="text"
					placeholder="Horários (08:00, 20:00)"
					value={horarios}
					onChange={(e) => setHorarios(e.target.value)}
					className="w-full p-3 border rounded-lg"
				/>
			)}

			<input
				type="number"
				placeholder="Alerta mínimo"
				value={alerta}
				onChange={(e) => setAlerta(Number(e.target.value))}
				className="w-full p-3 border rounded-lg"
			/>

			<button className="w-full bg-green-600 text-white p-3 rounded-lg font-bold">
				Salvar
			</button>
		</form>
	);
}
