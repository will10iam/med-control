export type StatusDose = "pendente" | "confirmada" | "atrasada" | "ignorada";

export type Dose = {
	id?: string;

	medicamentoId: string;

	medicamentoNome: string;

	data: string;
	horario: string;

	previstoPara: string;

	status: StatusDose;

	confirmadoEm?: string;

	origemConfirmacao?: OrigemConfirmacao;

	lembreteEnviado?: boolean;

	ultimoLembreteEm?: string;

	createdAt: string;
};

export type OrigemConfirmacao = "app" | "telegram" | "fcm";
