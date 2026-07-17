import {
	addDoc,
	collection,
	doc,
	getDocs,
	query,
	updateDoc,
	where,
} from "firebase/firestore";

import { db } from "@/lib/firebase";

import { Dose } from "@/types/Dose";

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

export async function confirmarDose(id: string) {
	await updateDoc(doc(db, "doses", id), {
		status: "confirmada",
		confirmadoEm: new Date().toISOString(),
	});
}
