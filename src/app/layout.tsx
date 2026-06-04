import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "Med Control App",
	description: "Controle inteligente de medicamentos",
	manifest: "/manifest.json",
};

export const viewport = {
	themeColor: "#16a34a",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html
			lang="en"
			className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
		>
			<meta name="apple-mobile-web-app-capable" content="yes" />
			<meta name="apple-mobile-web-app-status-bar-style" content="default" />
			<meta name="apple-mobile-web-app-title" content="MedControl" />
			<link rel="apple-touch-icon" href="/icon-192.png" />
			<body className="min-h-full flex flex-col" cz-shortcut-listen="true">
				<Toaster position="top-center" richColors />
				{children}
			</body>
		</html>
	);
}
