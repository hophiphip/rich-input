import { useMemo } from "react";
import type { TokenInfo } from "./use-rich-input";

export type UseRichInputTokenOptions = TokenInfo;

export function useRichInputToken({
    cursorEnd,
    cursorStart,
    tokens,
}: UseRichInputTokenOptions) {
    return useMemo(() => {
        if (cursorEnd !== cursorStart) {
            return {
                currentTokenIndex: null,
                currentToken: null,
            };
        }

        const currentTokenIndex = tokens.findIndex((token) => {
			return token.position.start <= cursorStart && token.position.end >= cursorStart;
		});

		if (currentTokenIndex === -1) {
			return {
                currentTokenIndex: null,
                currentToken: null,
            };
		}

        const currentToken = tokens[currentTokenIndex];

        return {
            currentTokenIndex,
            currentToken,
        }
    }, [cursorEnd, cursorStart, tokens]);
}
