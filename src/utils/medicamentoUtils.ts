export function calcularDuracao(quantidade: number, porDia: number) {
	return quantidade / porDia;
}

export function calcularDiasRestantes(dataInicio: string, duracao: number) {
	const inicio = new Date(dataInicio);
	const hoje = new Date();

	const diffTime = hoje.getTime() - inicio.getTime();
	const diasPassados = Math.floor(diffTime / (1000 * 60 * 60 * 24));

	return duracao - diasPassados;
}

export function getStatus(estoque: number, alerta: number) {
	if (estoque <= 0) return "Acabou";
	if (estoque <= alerta) return "Acabando";
	return "OK";
}

export function precisaNotificar(estoque: number, alerta: number) {
	return estoque <= alerta;
}
