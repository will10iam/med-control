export function calcularProgresso(tomadas: number, previstas: number): number {
	if (previstas <= 0) {
		return 0;
	}

	return Math.min(Math.round((tomadas / previstas) * 100), 100);
}
