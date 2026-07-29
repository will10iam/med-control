export type StatusDose = "pendente" | "confirmada" | "atrasada" | "ignorada";

export type Dose = {
	id?: string;

	medicamentoId: string;
	medicamentoNome: string;

	data: string;
	horario: string;

	previstoPara: string;

	status: StatusDose;

	lembreteEnviado?: boolean;

	notificacoes: {
		lembrete10min: boolean;
		atraso15min: boolean;
	};

	confirmadoEm?: string;
	origemConfirmacao?: OrigemConfirmacao;

	createdAt: string;
};

export type OrigemConfirmacao = "app" | "telegram" | "fcm";
