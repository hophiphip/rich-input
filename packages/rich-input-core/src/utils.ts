import { defaultTemplateArgumentEnd, defaultTemplateArgumentStart } from "./const";
import { type TemplateToken, TemplateTokenType } from "./types";

/**
 * Convert an array of template tokens into a string value.
 * @param tokens and array of template tokens
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
