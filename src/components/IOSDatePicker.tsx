"use client";

import { useRef } from "react";
import { IoIosArrowDown } from "react-icons/io";

type Props = {
	label: string;
	value: string;
	onChange: (v: string) => void;
};

export function IOSDatePicker({ label, value, onChange }: Props) {
	const inputRef = useRef<HTMLInputElement>(null);

	function formatDate(dateStr: string) {
		if (!dateStr) return "Selecionar data";

		const date = new Date(dateStr);

		return new Intl.DateTimeFormat("pt-BR", {
			day: "numeric",
			month: "long",
			year: "numeric",
		}).format(date);
	}

	function openPicker() {
		if (inputRef.current) {
			if ("showPicker" in inputRef.current) {
				inputRef.current.showPicker();
			} else {
				inputRef.current.focus();
			}
		}
	}

	return (
		<div className="flex flex-col gap-1">
			<label className="text-xl text-gray-900 ml-4">{label}</label>

			<div
				onClick={openPicker}
				className="flex items-center justify-between bg-gray-100 border border-gray-300 rounded-xl px-4 py-3 cursor-pointer"
			>
				<span className="text-gray-600 text-lg">{formatDate(value)}</span>

				<span className="text-gray-400 text-lg">
					<IoIosArrowDown size={25} />
				</span>

				<input
					ref={inputRef}
					type="date"
					value={value}
					onChange={(e) => onChange(e.target.value)}
					className="absolute opacity-0 pointer-events-none"
				/>
			</div>
		</div>
	);
}
