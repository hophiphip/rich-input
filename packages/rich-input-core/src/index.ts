import { defaultTemplateArgumentEnd, defaultTemplateArgumentStart } from "./const";
import { type TemplateToken, TemplateTokenType } from "./types";
import { getTemplateTokenId } from "./utils";

export class TemplateParser {
	/** argument token start */
	private start: string = defaultTemplateArgumentStart;
	/** argumen token end */
	private end: string = defaultTemplateArgumentEnd;

	/**
	 * Create an instanse of template string parser.
	 * @param start argument token start
	 * @param end argumen token end
	 */
	constructor(
		start: string = defaultTemplateArgumentStart,
		end: string = defaultTemplateArgumentEnd,
	) {
		this.start = start;
		this.end = end;
	}

	/**
	 * Parse template string into an array of tokens.
	 * @param template a string that represents token template
	 */
	parse(template: string) {
		const tokens: TemplateToken[] = [];

		if (!template) return tokens;

		let index = 0;
		/** A character index where current token starts from. */
		let offset = 0;
		/** Nesting level of argument token. */
		let nesting = 0;

		const start = this.start;
		const end = this.end;

		for (; index < template.length; index++) {
			const character = template[index];

			if (character === start) {
				/** Are we outside of nested argument token */
				const isOutsideNesting = nesting <= 0;

				/**
				 * In case we met an opening character and we are outside of nested token
				 *  - treat all prev. text as a literal and enter a new argument token.
				 */
				if (index !== offset && isOutsideNesting) {
					/** Reset nesting level when a new token added */
					nesting = 0;

					tokens.push({
						id: getTemplateTokenId(TemplateTokenType.Literal, tokens.length),
						value: template.substring(offset, index),
						type: TemplateTokenType.Literal,
						position: {
							start: offset,
							end: index - 1,
						},
					});

					offset = index;
				}

				nesting++;
			} else if (character === end) {
				/** Needs at least one closing character to form a new argument token */
				const isGoingOutsideNesting = nesting === 1;

				if (isGoingOutsideNesting) {
					tokens.push({
						id: getTemplateTokenId(TemplateTokenType.Argument, tokens.length),
						value: template.substring(offset, index + 1),
						type: TemplateTokenType.Argument,
						position: {
							start: offset,
							end: index,
						},
					});

					offset = index + 1;
				}

				nesting--;
			}
		}

		if (index !== offset) {
			tokens.push({
				id: getTemplateTokenId(TemplateTokenType.Literal, tokens.length),
				value: template.substring(offset, index),
				type: TemplateTokenType.Literal,
				position: {
					start: offset,
					end: index - 1,
				},
			});
		}

		return tokens;
	}
}

// const
export { defaultTemplateArgumentEnd, defaultTemplateArgumentStart };

// types
export { type TemplateToken, TemplateTokenType };

// utils
export * from "./utils";
