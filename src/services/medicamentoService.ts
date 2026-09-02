import { db } from "@/lib/firebase";
import {
	collection,
	addDoc,
	doc,
	updateDoc,
	getDocs,
	getDoc,
	deleteDoc,
	onSnapshot,
	query,
	where,
	writeBatch,
} from "firebase/firestore";
import { Medicamento } from "@/types/Medicamento";
import { ResultadoUsoComprimido } from "@/types/ResultadoUsoComprimido";

import { criarPrimeiraDose, criarProximaDose } from "./doseService";

import { confirmarDoseDoMedicamento } from "./doseService";

/* export async function addMedicamento(data: Medicamento) {
	try {
		const docRef = await addDoc(collection(db, "medicamentos"), {
			...data,
		});

		return docRef.id;
	} catch (error) {
		console.error("Erro ao adicionar medicamento:", error);
	}
} */

export async function addMedicamento(data: Medicamento) {
	try {
		const docRef = await addDoc(collection(db, "medicamentos"), {
			...data,
			estoqueBaixoNotificado: false,
			estoqueEsgotadoNotificado: false,
		});

		const id = docRef.id;

		// Cria a primeira dose
		await criarPrimeiraDose(id, data);

		// Envia mensagem para o Telegram (não bloqueia o fluxo)
		fetch("/api/telegram/novo-medicamento", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(data),
		}).catch((err) => {
			console.error("Erro ao enviar mensagem para o Telegram:", err);
		});

		return id;
	} catch (error) {
		console.error("Erro ao adicionar medicamento:", error);
		throw error;
	}
}

export async function getMedicamentos() {
	try {
		const querySnapshot = await getDocs(collection(db, "medicamentos"));

		console.log("DOCS:", querySnapshot.docs);

		const medicamentos = querySnapshot.docs.map((doc) => ({
			id: doc.id,
			...doc.data(),
		}));

		return medicamentos;
	} catch (error) {
		console.error("Erro ao buscar medicamentos:", error);
		return [];
	}
}

export function subscribeMedicamentos(callback: any) {
	const unsubscribe = onSnapshot(collection(db, "medicamentos"), (snapshot) => {
		const data = snapshot.docs.map((doc) => ({
			id: doc.id,
			...doc.data(),
		}));

		callback(data);
	});

	return unsubscribe;
}

export async function atualizarEstoque(id: string, novoEstoque: number) {
	const ref = doc(db, "medicamentos", id);

	await updateDoc(ref, {
		estoqueAtual: novoEstoque,
	});
}

export async function usarComprimido(
	id: string,
	estoqueAtual: number,
	alertaMinimo: number,
): Promise<ResultadoUsoComprimido> {
	if (estoqueAtual <= 0) {
		throw new Error(
			"Não é possível registrar uma dose de um medicamento sem estoque.",
		);
	}

	const dose = await confirmarDoseDoMedicamento(id);

	if (!dose) {
		return {
			confirmou: false,
			estoqueRestante: estoqueAtual,
			estoqueBaixo: false,
			estoqueAcabou: false,
		};
	}

	const novoEstoque = estoqueAtual - 1;

	await atualizarEstoque(id, novoEstoque);

	if (novoEstoque > 0) {
		await criarProximaDose(dose);
	}

	const medicamento = await getMedicamentoById(id);

	if (
		medicamento &&
		novoEstoque > 0 &&
		novoEstoque <= alertaMinimo &&
		!medicamento.estoqueBaixoNotificado
	) {
		fetch("/api/telegram/estoque-baixo", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				nome: medicamento.nome,
				estoqueRestante: novoEstoque,
				alertaMinimo,
			}),
		})
			.then(async (response) => {
				if (response.ok) {
					await marcarEstoqueBaixoNotificado(id);
				}
			})
			.catch((error) => {
				console.error("Erro ao enviar notificação de estoque baixo:", error);
			});
	}

	if (
		medicamento &&
		novoEstoque === 0 &&
		!medicamento.estoqueEsgotadoNotificado
	) {
		fetch("/api/telegram/estoque-esgotado", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				nome: medicamento.nome,
			}),
		})
			.then(async (response) => {
				if (response.ok) {
					await marcarEstoqueEsgotadoNotificado(id);
				}
			})
			.catch((error) => {
				console.error("Erro ao enviar notificação de estoque esgotado:", error);
			});
	}

	return {
		confirmou: true,
		estoqueRestante: novoEstoque,
		estoqueBaixo: novoEstoque > 0 && novoEstoque <= alertaMinimo,
		estoqueAcabou: novoEstoque === 0,
	};
}

export async function adicionarCaixa(
	id: string,
	estoqueAtual: number,
	quantidadePorCaixa: number,
) {
	const novoEstoque = estoqueAtual + quantidadePorCaixa;
	await atualizarEstoque(id, novoEstoque);

	try {
		const medicamento = await getMedicamentoById(id);

		if (!medicamento) {
			console.error("Medicamento não encontrado para notificação.");
			return;
		}

		const ref = doc(db, "medicamentos", id);

		await updateDoc(ref, {
			estoqueBaixoNotificado: false,
			estoqueEsgotadoNotificado: false,
		});

		fetch("/api/telegram/nova-caixa", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				nome: medicamento.nome,
				quantidadeAdicionada: quantidadePorCaixa,
				estoqueTotal: novoEstoque,
			}),
		}).catch((error) => {
			console.error("Erro ao enviar notificação de nova caixa:", error);
		});
	} catch (error) {
		console.error("Erro ao preparar notificação de nova caixa:", error);
	}
}

export async function salvarToken(token: string) {
	try {
		await addDoc(collection(db, "tokens"), {
			token,
			createdAt: new Date().toISOString(),
		});
	} catch (error) {
		console.error("Erro ao salvar token:", error);
	}
}

export async function deletarMedicamento(id: string) {
	const dosesQuery = query(
		collection(db, "doses"),
		where("medicamentoId", "==", id),
	);

	const snapshot = await getDocs(dosesQuery);

	const batch = writeBatch(db);

	snapshot.docs.forEach((doseDoc) => {
		batch.delete(doseDoc.ref);
	});

	batch.delete(doc(db, "medicamentos", id));

	await batch.commit();
}

export async function getMedicamentoById(
	id: string,
): Promise<Medicamento | null> {
	try {
		const ref = doc(db, "medicamentos", id);
		const snapshot = await getDoc(ref);

		if (!snapshot.exists()) return null;

		return {
			id: snapshot.id,
			...(snapshot.data() as Omit<Medicamento, "id">),
		};
	} catch (error) {
		console.error("Erro ao buscar medicamento:", error);
		return null;
	}
}

export async function atualizarMedicamento(
	id: string,
	data: Partial<Medicamento>,
) {
	try {
		const ref = doc(db, "medicamentos", id);

		await updateDoc(ref, {
			...data,
		});
	} catch (error) {
		console.error("Erro ao atualizar medicamento:", error);
	}
}

export async function marcarEstoqueBaixoNotificado(id: string) {
	const ref = doc(db, "medicamentos", id);

	await updateDoc(ref, {
		estoqueBaixoNotificado: true,
	});
}

export async function marcarEstoqueEsgotadoNotificado(id: string) {
	const ref = doc(db, "medicamentos", id);

	await updateDoc(ref, {
		estoqueEsgotadoNotificado: true,
	});
}
