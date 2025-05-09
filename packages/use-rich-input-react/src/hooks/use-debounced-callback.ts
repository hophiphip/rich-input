import { useCallback, useEffect, useRef } from "react";

import { useCallbackRef } from "./use-callback-ref";

/**
 * biome-ignore lint/suspicious/noExplicitAny: Use any because unknown is not enough
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(callback: T, delayMs: number) {
	const handleCallback = useCallbackRef(callback);
	const debounceTimerRef = useRef(0);
    
	useEffect(() => () => window.clearTimeout(debounceTimerRef.current), []);

	return useCallback(
		(...args: Parameters<T>) => {
			window.clearTimeout(debounceTimerRef.current);
			debounceTimerRef.current = window.setTimeout(() => handleCallback(...args), delayMs);
		},
		[handleCallback, delayMs],
	);
}
