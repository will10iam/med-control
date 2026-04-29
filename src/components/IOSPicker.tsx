"use client";

import { useState } from "react";

type Props = {
	label: string;
	value: number;
	onChange: (v: number) => void;
	min?: number;
	max?: number;
};

export function IOSPicker({
	label,
	value,
	onChange,
	min = 0,
	max = 100,
}: Props) {
	const [open, setOpen] = useState(false);

	const options = Array.from({ length: max - min + 1 }, (_, i) => i + min);
	return (
		<>
			<div
				onClick={() => setOpen(true)}
				className="flex items-center justify-between bg-white px-4 py-3 cursor-pointer"
			>
				<span className="text-xl">{label}</span>
				<span className="text-gray-900 text-xl">{value}</span>
			</div>

			{open && (
				<div className="fixed inset-0 bg-black/40 flex items-end">
					<div className="bg-white w-full rounded-t-2xl p-4">
						<div className="h-60 overflow-y-scroll snap-y">
							{options.map((opt) => (
								<div
									key={opt}
									onClick={() => {
										onChange(opt);
										setOpen(false);
									}}
									className={`text-center py-3 text-lg snap-center ${
										opt === value ? "font-bold text-blue-600" : ""
									}`}
								>
									{opt}
								</div>
							))}
						</div>

						<button
							onClick={() => setOpen(false)}
							className="w-full mt-4 bg-red-500 text-white p-3 rounded-lg"
						>
							Cancelar
						</button>
					</div>
				</div>
			)}
		</>
	);
}
