import { type TemplateToken, TemplateTokenType, computeCurrentToken, getTemplateTokenId, updateTokens } from "@hophiphip/rich-input-core";
import { useCallback, useEffect, useRef, useState } from "react";

import { useDebouncedCallback } from "./use-debounced-callback";
import type { TokenInfo } from "./use-rich-input";

const defaultDebounceDelayMs = 200;

export type UseRichInputTokenOptions = TokenInfo & {
	debounceDelayMs?: number;
};

type RichInputTokenResult = {
	updateCurrentToken: (value: string) => TemplateToken[] | null;
} & (
	{
		currentToken: TemplateToken;
		currentTokenIndex: number;
	}
	|
	{
		currentToken: null;
		currentTokenIndex: null;
	}
);

/**
 * Returns current token index and value.
 * @param tokenInfo token info object
 */
export function useRichInputToken({
	tokens,
	cursorStart,
	cursorEnd,

	argumentEnd,
	argumentStart,

	debounceDelayMs = defaultDebounceDelayMs,
}: UseRichInputTokenOptions): RichInputTokenResult {
	const [tokenInfo, setTokenInfo] = useState(() =>
		computeCurrentToken(tokens, cursorStart, cursorEnd),
	);

	const [currentToken, currentTokenIndex] = tokenInfo;

	const debuncedUpdateTokenInfo = useDebouncedCallback(() => {
		setTokenInfo(computeCurrentToken(tokens, cursorStart, cursorEnd));
	}, debounceDelayMs);

	/**
	 * biome-ignore lint/correctness/useExhaustiveDependencies(debuncedUpdateTokenInfo): reference to the function
	 * biome-ignore lint/correctness/useExhaustiveDependencies(tokens): dependency of debuncedUpdateTokenInfo
	 * biome-ignore lint/correctness/useExhaustiveDependencies(cursorStart): dependency of debuncedUpdateTokenInfo
	 * biome-ignore lint/correctness/useExhaustiveDependencies(cursorEnd): dependency of debuncedUpdateTokenInfo
	 */
	useEffect(() => {
		debuncedUpdateTokenInfo();
	}, [tokens, cursorStart, cursorEnd]);

	/** Refs for `updateCurrentToken` callback */
	const currentTokenIndexRef = useRef(currentTokenIndex);
	useEffect(() => {
		currentTokenIndexRef.current = currentTokenIndex;
	});

	const tokensRef = useRef(tokens);
	useEffect(() => {
		tokensRef.current = tokens;
	});

	/** Update token via index and return new tokens array */
	const updateCurrentToken = useCallback(
		(value: string) => {
			const currentTokenIndex = currentTokenIndexRef.current;	
			const currentTokens = tokensRef.current;
			
			if (currentTokenIndex === null) {
				/** When the value is empty (there is no tokens) - create a new token */
				return currentTokens.length === 0 ? [
					{
						id: getTemplateTokenId(TemplateTokenType.Literal, 0),
						type: TemplateTokenType.Literal,
						value,
						label: value,
						position: {
							start: 0,
							end: value.length - 1,
						},
					},
				] : null;
			}

			return updateTokens(currentTokens, currentTokenIndex, value, {
				start: argumentStart,
				end: argumentEnd,
			});
		},
		[argumentStart, argumentEnd],
	);

	return {
		currentToken,
		currentTokenIndex,
		updateCurrentToken,
	} as RichInputTokenResult;
}
