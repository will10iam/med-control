"use client";

import { useState } from "react";
import { Medicamento } from "@/types/Medicamento";
import { IOSPicker } from "@/components/IOSPicker";
import { IOSDatePicker } from "@/components/IOSDatePicker";
import { useRouter } from "next/navigation";

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
	const [dataInicio, setDataInicio] = useState("");

	const router = useRouter();

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
		<form onSubmit={handleSubmit} className="space-y-4 bg-white p-4 rounded-lg">
			<label className="text-xl text-gray-900 ml-4">Nome do Medicamento</label>
			<input
				placeholder="Ex: Cymbi 125g"
				value={nome}
				onChange={(e) => setNome(e.target.value)}
				className="w-full p-3 border border-gray-300 rounded-lg"
			/>

			<div className="flex bg-gray-200 rounded-lg p-1">
				<button
					type="button"
					onClick={() => setTipo("continuo")}
					className={`flex-1 p-2 rounded-lg text-sm font-medium transition ${
						tipo === "continuo" ? "bg-blue-500 text-white" : "text-gray-700"
					}`}
				>
					Contínuo
				</button>

				<button
					type="button"
					onClick={() => setTipo("eventual")}
					className={`flex-1 p-2 rounded-lg text-sm font-medium transition ${
						tipo === "eventual" ? "bg-white text-black shadow" : "text-gray-700"
					}`}
				>
					Eventual
				</button>
			</div>

			<IOSPicker
				label="Comprimidos por caixa"
				value={quantidade}
				onChange={setQuantidade}
				max={100}
			/>

			{tipo === "continuo" && (
				<IOSPicker
					label="Comprimidos por dia"
					value={porDia}
					onChange={setPorDia}
					max={3}
				/>
			)}

			<IOSPicker
				label="Alerta Mínimo"
				value={alerta}
				onChange={setAlerta}
				max={10}
			/>

			{tipo === "continuo" && (
				<>
					<label className="text-xl text-gray-900 ml-4">
						Qual horário tomar?
					</label>
					<input
						type="text"
						placeholder="Ex: 08:00"
						value={horarios}
						onChange={(e) => setHorarios(e.target.value)}
						className="w-full p-3 rounded-lg text-1xl text-gray-900 border border-gray-300 bg-gray-100"
					/>
				</>
			)}

			<IOSDatePicker
				label="Início tratamento"
				value={dataInicio}
				onChange={setDataInicio}
			/>

			<button
				type="submit"
				className="w-full bg-blue-500 text-white text-xl p-3 rounded-lg font-bold mt-4"
			>
				Salvar
			</button>

			<button
				type="button"
				onClick={() => router.back()}
				className="w-full text-white bg-red-500 text-xl p-3 rounded-lg font-bold border border-red-500 -mt-2"
			>
				Cancelar
			</button>
		</form>
	);
}
