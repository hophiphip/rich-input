import { computeCurrentToken } from "@hophiphip/rich-input-core";
import { useEffect, useState } from "react";

import { useDebouncedCallback } from "./use-debounced-callback";
import type { TokenInfo } from "./use-rich-input";

const defaultDebounceDelayMs = 200;

export type UseRichInputTokenOptions = TokenInfo & {
	debounceDelayMs?: number;
};

/**
 * Returns current token index and value.
 * @param tokenInfo token info object
 */
export function useRichInputToken({
	tokens,
	cursorStart,
	cursorEnd,

	debounceDelayMs = defaultDebounceDelayMs,
}: UseRichInputTokenOptions) {
	const [tokenInfo, setTokenInfo] = useState(() =>
		computeCurrentToken(tokens, cursorStart, cursorEnd),
	);

	const debuncedUpdateTokenInfo = useDebouncedCallback(
		() => {
			setTokenInfo(computeCurrentToken(tokens, cursorStart, cursorEnd));
		},
		debounceDelayMs,
	);

    /**
     * biome-ignore lint/correctness/useExhaustiveDependencies(debuncedUpdateTokenInfo): reference to the function
	 * biome-ignore lint/correctness/useExhaustiveDependencies(tokens): dependency of debuncedUpdateTokenInfo
	 * biome-ignore lint/correctness/useExhaustiveDependencies(cursorStart): dependency of debuncedUpdateTokenInfo
	 * biome-ignore lint/correctness/useExhaustiveDependencies(cursorEnd): dependency of debuncedUpdateTokenInfo
     */
	useEffect(() => {
		debuncedUpdateTokenInfo();
	}, [tokens, cursorStart, cursorEnd]);

	return tokenInfo;
}
