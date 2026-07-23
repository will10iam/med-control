export function formatarDataExtenso(data: string) {
	return new Intl.DateTimeFormat("pt-BR", {
		day: "numeric",
		month: "long",
		year: "numeric",
	}).format(new Date(data));
}

export function formatarDataLocal(data: Date) {
	const ano = data.getFullYear();
	const mes = String(data.getMonth() + 1).padStart(2, "0");
	const dia = String(data.getDate()).padStart(2, "0");

	return `${ano}-${mes}-${dia}`;
}
