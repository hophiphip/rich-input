import { defaultTemplateArgumentEnd, defaultTemplateArgumentStart } from "./const";
import { type TemplateToken, TemplateTokenType } from "./types";

export type TemplateTokenWithoutId = Omit<TemplateToken, 'id'>;

/**
 * Convert an array of template tokens into a string value.
 * @param tokens an array of template tokens
 * @param start argument token start
 * @param end argument token end
 */
export function tokensToString(
	tokens: TemplateToken[],
	start: string = defaultTemplateArgumentStart,
	end: string = defaultTemplateArgumentEnd,
) {
	return tokens
		.map((token) =>
			token.type === TemplateTokenType.Literal ? token.value : `${start}${token.value}${end}`,
		)
		.join("");
}

/**
 * Generate a unique id for a template token.
 * @param token template token
 * @param index template token index
 */
export function getTemplateTokenId(tokenType: TemplateTokenType, index: number) {
    return `tempalte-token-${index}-${tokenType}`;
}

/**
 * Compute current token based on input cursor position
 * @param tokens an array of template tokens
 * @param cursorStart input cursor start position
 * @param curstorEnd input cursor end position
 * @returns {([TemplateToken, number] | [null, null])} current token and current token index, or `null` if no valid token was found in the current cursor position
 */
export function computeCurrentToken(
	tokens: TemplateToken[],
	cursorStart: number,
	curstorEnd: number,
): [TemplateToken, number] | [null, null] {
	/** User is selecting text - cannot determine current token */
	if (cursorStart !== curstorEnd) {
		return [null, null];
	}

	for (let tokenIndex = 0; tokenIndex < tokens.length; tokenIndex++) {
		const token = tokens[tokenIndex];
		const { position } = token;
		const { start, end } = position;

		if (start <= cursorStart && (end + 1) >= cursorStart) {
			return [token, tokenIndex];
		}
	}

	return [null, null];
}