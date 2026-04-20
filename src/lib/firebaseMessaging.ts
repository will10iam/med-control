import { getMessaging, getToken } from "firebase/messaging";
import { app } from "./firebase";

export async function requestNotificationPermission() {
	const permission = await Notification.requestPermission();

	if (permission !== "granted") {
		console.log("Permissão negada");
		return;
	}

	const messaging = getMessaging(app);

	const token = await getToken(messaging, {
		vapidKey:
			"BCQKEHj_DtgmpFWcHXXEbbsSwTTmf2-clC_vTSQZ__hKqOjM6t6RQOILGRwbDIbAtUZPSUihMRWP6o-0iVph3CI",
	});

	console.log("TOKEN:", token);

	return token;
}
