export enum TemplateTokenType {
	Literal = 0,
	Argument = 1,
	IncompleteArgument = 2,
}

type TemplateTokenPosition = {
	/** Index of the first token character  */
	start: number;
	/** Index of the last token character */
	end: number;
};

type TemplateTokenBaseParams = {
	id: string;
	value: string;
	position: TemplateTokenPosition;
};

export type TemplateArgumentToken = TemplateTokenBaseParams & {
	rawValue: string;
	type: TemplateTokenType.Argument;
};

export type TemplateLiteralToken = TemplateTokenBaseParams & {
	type: TemplateTokenType.Literal;
};

export type TemplateIncompleteArgumentToken = TemplateTokenBaseParams & {
	rawValue: string;
	type: TemplateTokenType.IncompleteArgument;
};

export type TemplateToken = TemplateArgumentToken | TemplateLiteralToken | TemplateIncompleteArgumentToken;
