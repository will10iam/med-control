export type Medicamento = {
	id?: string;

	nome: string;
	tipo: "contínuo" | "eventual";

	quantidadePorCaixa: number;

	comprimidosPorDia?: number;
	dataInicio?: string;

	estoqueAtual: number;
	alertaMinimo: number;

	createdAt: string;
};
