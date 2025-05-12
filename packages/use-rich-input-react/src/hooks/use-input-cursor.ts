import { type RefObject, useCallback, useEffect, useState } from "react";

export function useInputCursor<
	T extends HTMLInputElement | HTMLTextAreaElement = HTMLInputElement,
>({ ref }: { ref: RefObject<T | null> }) {
	const [start, setStart] = useState(0);
	const [end, setEnd] = useState(0);

	/**
	 * Callback to trigger input cursor update.
	 * biome-ignore lint/correctness/useExhaustiveDependencies(ref.current): reference to the input
	 */
	const updateCursor = useCallback(() => {
		if (ref.current) {
			const { selectionStart, selectionEnd } = ref.current;

			setStart(selectionStart ?? 0);
			setEnd(selectionEnd ?? 0);
		}
	}, []);

	/**
	 * biome-ignore lint/correctness/useExhaustiveDependencies(ref.current): reference to the input
	 * biome-ignore lint/correctness/useExhaustiveDependencies(ref.current.setSelectionRange): reference to the input property
	 */
	useEffect(() => {
		if (ref.current) {
			ref.current.setSelectionRange(start, end);
		}
	}, [start, end]);

	return { start, end, updateCursor };
}
