import {
	addDoc,
	collection,
	doc,
	getDocs,
	query,
	updateDoc,
	where,
	orderBy,
	limit,
} from "firebase/firestore";

import { db } from "@/lib/firebase";

import { Dose, OrigemConfirmacao } from "@/types/Dose";
import { Medicamento } from "@/types/Medicamento";

import { formatarDataLocal } from "@/utils/dateUtils";

export async function addDose(data: Dose) {
	try {
		const docRef = await addDoc(collection(db, "doses"), data);

		return docRef.id;
	} catch (error) {
		console.error(error);
	}
}

export async function getDosesByMedicamento(medicamentoId: string) {
	const q = query(
		collection(db, "doses"),
		where("medicamentoId", "==", medicamentoId),
	);

	const snapshot = await getDocs(q);

	return snapshot.docs.map((doc) => ({
		id: doc.id,
		...doc.data(),
	})) as Dose[];
}

export async function confirmarDose(
	id: string,
	origem: OrigemConfirmacao = "app",
) {
	await updateDoc(doc(db, "doses", id), {
		status: "confirmada",
		confirmadoEm: new Date().toISOString(),
		origemConfirmacao: origem,
	});
}

export async function criarPrimeiraDose(
	medicamentoId: string,
	medicamento: Medicamento,
) {
	if (!medicamento.horarios?.length) return;

	const [ano, mes, dia] = medicamento.dataInicio.split("-").map(Number);

	const inicio = new Date(ano, mes - 1, dia);

	const primeiraHora = medicamento.horarios[0];

	const [hora, minuto] = primeiraHora.split(":").map(Number);

	const previsto = new Date(
		inicio.getFullYear(),
		inicio.getMonth(),
		inicio.getDate(),
		hora,
		minuto,
	);

	const dose: Dose = {
		medicamentoId,
		medicamentoNome: medicamento.nome,

		data: formatarDataLocal(previsto),

		horario: primeiraHora,

		previstoPara: previsto.toISOString(),

		status: "pendente",

		lembreteEnviado: false,

		createdAt: new Date().toISOString(),
	};

	await addDose(dose);
}

export async function confirmarDoseDoMedicamento(
	medicamentoId: string,
	origem: OrigemConfirmacao = "app",
): Promise<boolean> {
	try {
		const q = query(
			collection(db, "doses"),
			where("medicamentoId", "==", medicamentoId),
			where("status", "==", "pendente"),
			orderBy("previstoPara"),
			limit(1),
		);

		const snapshot = await getDocs(q);

		if (snapshot.empty) {
			return false;
		}

		const doseDoc = snapshot.docs[0];

		const dose = doseDoc.data() as Dose;

		await confirmarDose(doseDoc.id, origem);

		await criarProximaDose(dose);

		return true;
	} catch (error) {
		console.error("Erro ao confirmar dose:", error);
		return false;
	}
}

export async function criarProximaDose(dose: Dose) {
	const proximaData = new Date(dose.previstoPara);

	proximaData.setDate(proximaData.getDate() + 1);

	await addDoc(collection(db, "doses"), {
		medicamentoId: dose.medicamentoId,
		medicamentoNome: dose.medicamentoNome,

		data: formatarDataLocal(proximaData),

		horario: dose.horario,

		previstoPara: proximaData.toISOString(),

		status: "pendente",

		lembreteEnviado: false,

		createdAt: new Date().toISOString(),
	});
}

export async function buscarDosesParaLembrete() {
	const q = query(
		collection(db, "doses"),
		where("status", "==", "pendente"),
		where("lembreteEnviado", "==", false),
	);

	const snapshot = await getDocs(q);

	const agora = new Date();

	const doses = snapshot.docs
		.map((doc) => ({
			id: doc.id,
			...doc.data(),
		}))
		.filter((dose: any) => {
			const previsto = new Date(dose.previstoPara);

			const diferenca = (previsto.getTime() - agora.getTime()) / 60000;

			return diferenca <= 10 && diferenca >= 0;
		});

	return doses;
}
