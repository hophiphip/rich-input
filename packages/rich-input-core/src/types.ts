export enum TemplateTokenType {
	Literal = 0,
	Argument = 1,
}

export type TemplateToken = {
	id: string;
	value: string;
	type: TemplateTokenType;
	position: {
		/** Index of the first token character  */
		start: number;
		/** Index of the last token character */
		end: number;
	};
};
