"use client";

import { useState } from "react";
import { addMedicamento } from "@/services/medicamentoService";

import { useRouter } from "next/navigation";

export default function NovoMedicamento() {
	const [nome, setNome] = useState("");
	const [tipo, setTipo] = useState<"continuo" | "eventual">("continuo");
	const [quantidade, setQuantidade] = useState(30);
	const [porDia, setPorDia] = useState(1);
	const [alerta, setAlerta] = useState(5);
	const [horariosInput, setHorariosInput] = useState("");

	const router = useRouter();

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();

		if (!nome) {
			alert("Informe o nome do medicamento");
			return;
		}

		const horariosArray = horariosInput
			.split(",")
			.map((h) => h.trim())
			.filter((h) => /^\d{2}:\d{2}$/.test(h));

		await addMedicamento({
			nome,
			tipo,
			quantidadePorCaixa: quantidade,
			comprimidosPorDia: tipo === "continuo" ? porDia : undefined,
			estoqueAtual: quantidade,
			alertaMinimo: alerta,
			dataInicio: new Date().toISOString(),
			horarios: tipo === "continuo" ? horariosArray : [],
			createdAt: new Date().toISOString(),
		});

		alert("Medicamento cadastrado!");
		router.push("/");
	}

	return (
		<div className="min-h-screen bg-gray-100 p-4">
			<h1 className="text-3xl font-bold mb-8 mt-4 text-center text-black">
				💊 Novo Medicamento
			</h1>

			<form onSubmit={handleSubmit} className="space-y-4">
				<input
					placeholder="Nome do medicamento"
					className="w-full p-3 rounded-lg border border-gray-800"
					value={nome}
					onChange={(e) => setNome(e.target.value)}
				/>

				<select
					className="w-full p-3 rounded-lg border border-gray-800"
					value={tipo}
					onChange={(e) => setTipo(e.target.value as "continuo" | "eventual")}
				>
					<option value="continuo">Contínuo</option>
					<option value="eventual">Eventual</option>
				</select>

				<input
					type="number"
					placeholder="Comprimidos por caixa"
					className="w-full p-3 rounded-lg border border-gray-800"
					value={quantidade}
					onChange={(e) => setQuantidade(Number(e.target.value))}
				/>

				{tipo === "continuo" && (
					<input
						type="number"
						placeholder="Comprimidos por dia"
						className="w-full p-3 rounded-lg border border-gray-800"
						value={porDia}
						onChange={(e) => setPorDia(Number(e.target.value))}
					/>
				)}

				{tipo === "continuo" && (
					<>
						<input
							type="text"
							placeholder="Horários (ex: 08:00, 20:00)"
							value={horariosInput}
							onChange={(e) => setHorariosInput(e.target.value)}
							className="w-full border p-3 rounded-lg border-gray-800"
						/>
						<p className="text-xs text-gray-500">
							Separe os horários por vírgula (ex: 08:00, 20:00)
						</p>
					</>
				)}

				<input
					type="number"
					placeholder="Alerta mínimo"
					className="w-full p-3 rounded-lg border border-gray-800"
					value={alerta}
					onChange={(e) => setAlerta(Number(e.target.value))}
				/>

				<button className="w-full bg-green-600 text-white p-3 rounded-md text-xl font-bold">
					Salvar
				</button>
			</form>
		</div>
	);
}
