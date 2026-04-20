/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

// export const helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

export const enviarNotificacaoTeste = functions.https.onRequest(
	async (req, res) => {
		const db = admin.firestore();

		const tokensSnapshot = await db.collection("tokens").get();
		const tokens = tokensSnapshot.docs.map((doc) => doc.data().token);

		await admin.messaging().sendEachForMulticast({
			tokens,
			notification: {
				title: "Teste funcionando 🔔",
				body: "Notificação funcionando!",
			},
		});

		res.send("Notificação enviada!");
	},
);

export const verificarEstoque = functions.pubsub
	.schedule("every 15 minutes")
	.onRun(async () => {
		const db = admin.firestore();

		const medsSnapshot = await db.collection("medicamentos").get();
		const tokensSnapshot = await db.collection("tokens").get();

		const tokens = tokensSnapshot.docs.map((doc) => doc.data().token);

		if (tokens.length === 0) {
			console.log("Nenhum token encontrado");
			return null;
		}

		for (const doc of medsSnapshot.docs) {
			const med = doc.data();
			const medRef = doc.ref;

			const hoje = new Date().toISOString().split("T")[0];

			const jaNotificouHoje = med.ultimoAviso === hoje;

			if (med.estoqueAtual <= med.alertaMinimo && !jaNotificouHoje) {
				await admin.messaging().sendEachForMulticast({
					tokens,
					notification: {
						title: "Remédio acabando ⚠️",
						body: `${med.nome} está com estoque baixo`,
					},
				});

				await medRef.update({
					ultimoAviso: hoje,
				});

				console.log(`Notificação enviada para ${med.nome}`);
			}
		}

		return null;
	});

export const verificarHorario = functions.pubsub
	.schedule("every 1 minutes")
	.onRun(async () => {
		const db = admin.firestore();

		const medsSnapshot = await db.collection("medicamentos").get();
		const tokensSnapshot = await db.collection("tokens").get();

		const tokens = tokensSnapshot.docs.map((doc) => doc.data().token);

		const agora = new Date();
		const horaAtual = agora.toTimeString().slice(0, 5); // "HH:MM"

		for (const doc of medsSnapshot.docs) {
			const med = doc.data();

			if (!med.horarios || med.horarios.length === 0) continue;

			const temHorarioAgora = med.horarios.includes(horaAtual);

			if (temHorarioAgora) {
				await admin.messaging().sendEachForMulticast({
					tokens,
					notification: {
						title: "Hora do remédio 💊",
						body: `Tomar ${med.nome}`,
					},
				});

				console.log(`Notificação de horário: ${med.nome}`);
			}
		}

		return null;
	});
