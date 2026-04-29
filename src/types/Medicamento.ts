export type Medicamento = {
	id?: string;
	nome: string;
	tipo: "continuo" | "eventual";
	quantidadePorCaixa: number;
	comprimidosPorDia?: number;
	estoqueAtual: number;
	alertaMinimo: number;
	dataInicio: string;
	horarios?: string[];
	createdAt: string;
};
