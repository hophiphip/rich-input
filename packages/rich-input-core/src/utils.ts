import { defaultTemplateArgumentEnd, defaultTemplateArgumentStart } from "./const";
import { type TemplateToken, TemplateTokenType } from "./types";

export type TemplateTokenWithoutId = Omit<TemplateToken, "id">;

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

		if (start <= cursorStart && end + 1 >= cursorStart) {
			return [token, tokenIndex];
		}
	}

	return [null, null];
}

export type UpdateTokenOptions = {
	start?: string;
	end?: string;
};

/**
 * Update (complete) token in an array of tokens via index
 * @param tokens an array of tokens
 * @param tokenIndex an index of a token to update 
 * @param value new token value without start and end argument characters
 * @param options argument start/end params
 */
export function updateTokens(
	tokens: TemplateToken[], 
	tokenIndex: number,
	value: string,
	options?: UpdateTokenOptions,
): TemplateToken[] | null {
	const tokenToUpdate = tokens.at(tokenIndex);
	if (!tokenToUpdate) {
		return null;
	}

	const start = options?.start ?? defaultTemplateArgumentStart;
	const end = options?.end ?? defaultTemplateArgumentEnd;

	const updateInfo = updateToken(tokenToUpdate, tokenIndex, value, { start, end });
	
	if (!updateInfo) {
		return null;
	}

	/** Create a new token array with cloned tokens */
	const updatedTokens = tokens.map((token) => ({ ...token }));

	const {
		updatedToken,
		positionDiff,
	} = updateInfo;

	updatedTokens[tokenIndex] = updatedToken;

	for (let index = tokenIndex + 1; index < tokens.length; index++) {
		/** Create a new position object to prevent from pointing to the old position object */
		updatedTokens[index].position = {
			start: updatedTokens[index].position.start + positionDiff,
			end: updatedTokens[index].position.end + positionDiff
		}
	}

	return updatedTokens;
}

/**
 * Create a new token based on its type and update-value
 * @param token token to update
 * @param tokenIndex index of token to update 
 * @param value new token value
 * @param options argument start/end params
 */
function updateToken(
	token: TemplateToken,
	tokenIndex: number,
	value: string,
	options: Required<UpdateTokenOptions>
): {
	updatedToken: TemplateToken;
	positionDiff: number;
} | null {
	const {
		end,
		start,
	} = options;

	switch (token.type) {
		case TemplateTokenType.Literal: {
			const positionDiff = value.length - token.value.length;

			return {
				updatedToken: {
					...token,
					label: value,
					value,
					position: {
						start: token.position.start,
						end: token.position.end + positionDiff,
					},
				},
				positionDiff,
			};
		}

		case TemplateTokenType.Argument: {
			const rawValue = `${start}${value}${end}`;
			const positionDiff = value.length - token.value.length;

			return {
				updatedToken: {
					...token,
					label: rawValue, 
					value,
					rawValue,
					position: {
						start: token.position.start,
						end: token.position.end + positionDiff,
					},
				},
				positionDiff,
			};
		}

		case TemplateTokenType.IncompleteArgument: {
			const rawValue = `${start}${value}${end}`;
			const positionDiff = value.length - token.value.length + end.length

			return {
				updatedToken: {
					...token,
					id: getTemplateTokenId(TemplateTokenType.Argument, tokenIndex),
					type: TemplateTokenType.Argument,
					label: rawValue,
					value,
					rawValue,
					position: {
						start: token.position.start,
						end: token.position.end + positionDiff,
					},
				},
				positionDiff,
			};
		}

		default:
			return null;
	}
}