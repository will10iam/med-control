export function formatarDataExtenso(data: string) {
	return new Intl.DateTimeFormat("pt-BR", {
		day: "numeric",
		month: "long",
		year: "numeric",
	}).format(new Date(data));
}
