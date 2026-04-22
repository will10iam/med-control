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
} from "firebase/firestore";
import { Medicamento } from "@/types/Medicamento";

export async function addMedicamento(data: Medicamento) {
	try {
		const docRef = await addDoc(collection(db, "medicamentos"), {
			...data,
		});

		return docRef.id;
	} catch (error) {
		console.error("Erro ao adicionar medicamento:", error);
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

export async function usarComprimido(id: string, estoqueAtual: number) {
	await atualizarEstoque(id, Math.max(estoqueAtual - 1, 0));
}

export async function adicionarCaixa(
	id: string,
	estoqueAtual: number,
	quantidadePorCaixa: number,
) {
	await atualizarEstoque(id, estoqueAtual + quantidadePorCaixa);
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
	await deleteDoc(doc(db, "medicamentos", id));
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
