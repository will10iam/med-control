export type Medicamento = {
	id?: string;

	nome: string;
	tipo: "continuo" | "eventual";

	quantidadePorCaixa: number;

	comprimidosPorDia?: number;
	dataInicio?: string;

	estoqueAtual: number;
	alertaMinimo: number;

	horarios?: string[];

	createdAt: string;
};
