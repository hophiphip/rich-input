export enum TemplateTokenType {
	Literal = 0,
	Argument = 1,
	IncompleteArgument = 2,
}

export type TemplateTokenPosition = {
	/** Index of the first token character  */
	start: number;
	/** Index of the last token character */
	end: number;
};

type TemplateTokenBaseParams = {
	id: string;
	/** Value that is used for previewing token */
	label: string;
	/** Token value without argument start/end characters */
	value: string;
	/** Token substring positions inside the whole string template */
	position: TemplateTokenPosition;
};

export type TemplateArgumentToken = TemplateTokenBaseParams & {
	/** Token value with argument start/end characters */
	rawValue: string;
	type: TemplateTokenType.Argument;
};

export type TemplateLiteralToken = TemplateTokenBaseParams & {
	type: TemplateTokenType.Literal;
};

export type TemplateIncompleteArgumentToken = TemplateTokenBaseParams & {
	/** Token value with argument start/end characters */
	rawValue: string;
	type: TemplateTokenType.IncompleteArgument;
};

export type TemplateToken =
	| TemplateArgumentToken
	| TemplateLiteralToken
	| TemplateIncompleteArgumentToken;
