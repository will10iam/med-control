importScripts(
	"https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js",
);
importScripts(
	"https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js",
);

firebase.initializeApp({
	apiKey: "AIzaSyBi4q1508XAJL1vbgUNEOooOl4tsGQba5g",
	authDomain: "med-control-493fb.firebaseapp.com",
	projectId: "med-control-493fb",
	storageBucket: "med-control-493fb.firebasestorage.app",
	messagingSenderId: "227466424527",
	appId: "1:227466424527:web:4db1ac64ffc1fabc5d87ba",
});

const messaging = firebase.messaging();
