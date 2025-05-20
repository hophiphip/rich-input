import { defaultTemplateArgumentEnd, defaultTemplateArgumentStart } from "./const";
import {
	type TemplateArgumentToken,
	type TemplateIncompleteArgumentToken,
	type TemplateLiteralToken,
	type TemplateToken,
	TemplateTokenType,
} from "./types";

export type TemplateTokenWithoutId = Omit<TemplateToken, "id">;

/** ---------------------------------------------------------------------------------- */

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

/** ---------------------------------------------------------------------------------- */

/**
 * Generate a unique id for a template token.
 * @param token template token
 * @param index template token index
 */
export function getTemplateTokenId(tokenType: TemplateTokenType, index: number) {
	return `tempalte-token-${index}-${tokenType}`;
}

/** ---------------------------------------------------------------------------------- */

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

/** ---------------------------------------------------------------------------------- */

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

	const updatedTokens = cloneTokens(tokens);

	const { updatedToken, positionDiff } = updateInfo;

	updatedTokens[tokenIndex] = updatedToken;

	for (let index = tokenIndex + 1; index < tokens.length; index++) {
		updatedTokens[index].position.start += positionDiff;
		updatedTokens[index].position.end += positionDiff;
	}

	return updatedTokens;
}

/** ---------------------------------------------------------------------------------- */

export type AppenTokenOptions = UpdateTokenOptions;

/**
 * Append a new token to the end of an existing tokens array and return a new array of tokens
 * @param tokens an array of tokens
 * @param value new token value
 * @param type new token type
 * @param options argument start/end params
 */
export function appendToTokens(
	tokens: TemplateToken[],
	value: string,
	type: TemplateTokenType,
	options: AppenTokenOptions,
) {
	const start = options?.start ?? defaultTemplateArgumentStart;
	const end = options?.end ?? defaultTemplateArgumentEnd;

	const updatedTokens = cloneTokens(tokens);

	updatedTokens.push(
		createToken(value, type, { start, end, tokens })
	);

	return updatedTokens;
}

/** ---------------------------------------------------------------------------------- */

/**
 * Deep clone tokens array
 * @param tokens an array of tokens
 */
function cloneTokens(tokens: TemplateToken[]): TemplateToken[] {
	return tokens.map((token) => ({ ...token, position: { ...token.position } }));
}

type CreateTokenOptions = Required<UpdateTokenOptions> & {
	tokens: TemplateToken[];
};

function createToken(value: string, type: TemplateTokenType, options: CreateTokenOptions) {
	const index = options.tokens.length;
	const lastPosition = options.tokens.at(-1)?.position;

	const startPosition = lastPosition ? lastPosition.end + 1 : 0;

	switch (type) {
		case TemplateTokenType.Literal: {
			const token: TemplateLiteralToken = {
				id: getTemplateTokenId(type, index),
				label: value,
				value,
				position: {
					start: startPosition,
					end: startPosition + value.length - 1,
				},
				type,
			};

			return token;
		}

		case TemplateTokenType.Argument: {
			const rawValue = `${options.start}${value}${options.end}`;

			const token: TemplateArgumentToken = {
				id: getTemplateTokenId(type, index),
				label: rawValue,
				rawValue,
				value,
				type,
				position: {
					start: startPosition,
					end: startPosition + rawValue.length - 1,
				},
			};

			return token;
		}

		case TemplateTokenType.IncompleteArgument: {
			const rawValue = `${options.start}${value}`;

			const token: TemplateIncompleteArgumentToken = {
				id: getTemplateTokenId(type, index),
				label: rawValue,
				rawValue,
				value,
				type,
				position: {
					start: startPosition,
					end: startPosition + rawValue.length - 1,
				},
			};

			return token;
		}
	}
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
	options: Required<UpdateTokenOptions>,
): {
	updatedToken: TemplateToken;
	positionDiff: number;
} | null {
	const { end, start } = options;

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
			const positionDiff = value.length - token.value.length + end.length;

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
