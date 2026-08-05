export function calcularTempoRestante(previstoPara: string) {
	const agora = new Date();
	const previsto = new Date(previstoPara);

	const diff = previsto.getTime() - agora.getTime();

	const minutos = Math.floor(Math.abs(diff) / 60000);

	if (diff >= 0) {
		if (minutos < 60) {
			return `Em ${minutos} min`;
		}

		const horas = Math.floor(minutos / 60);
		const resto = minutos % 60;

		return `Em ${horas}h ${resto}min`;
	}

	if (minutos < 60) {
		return `Há ${minutos} min`;
	}

	const horas = Math.floor(minutos / 60);
	const resto = minutos % 60;

	return `Há ${horas}h ${resto}min`;
}
