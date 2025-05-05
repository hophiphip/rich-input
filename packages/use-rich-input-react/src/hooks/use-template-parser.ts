import { TemplateParser } from "@hophiphip/rich-input-core";
import { useMemo } from "react";

export type TemplateParserOptions = {
	argumentStart?: string | undefined;
	argumentEnd?: string | undefined;
	value: string | undefined;
};

export function useTemplateParser({ argumentStart, argumentEnd, value }: TemplateParserOptions) {
	const parser = useMemo(() => {
		return new TemplateParser(argumentStart, argumentEnd);
	}, [argumentStart, argumentEnd]);

	const tokens = useMemo(() => {
		return value ? parser.parse(value) : [];
	}, [parser, value]);

	return [tokens, parser] as const;
}
