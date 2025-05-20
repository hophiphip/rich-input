import { describe, expect, test } from "vitest";
import { TemplateParser, TemplateTokenType, appendToTokens, computeCurrentToken, getTemplateTokenId, tokensToString, updateTokens } from "../src";

const start = '{';
const end = '}';

const parser = new TemplateParser(start, end);

test('tokensToString should be defined', () => {
    expect(tokensToString).toBeDefined();
});

test('computeCurrentToken should be defined', () => {
    expect(computeCurrentToken).toBeDefined();
});

describe('should property convert tokens to string', () => {
    test('should convert empty token array to empty string', () => {
        expect(tokensToString(parser.parse(''))).toBe('');
    });

    test('should convert one literal token array to valid string representation', () => {
        expect(tokensToString(parser.parse('one'))).toBe('one');
    });

    test('should convert literal + argument token array to valid string representation', () => {
        expect(tokensToString(parser.parse(`one${start}arg${end}`))).toBe(`one${start}arg${end}`);
    });
});

describe('should properly compute current token based on cursor position', () => {
    test('should return null when cursor is outside', () => {
        const tokens = parser.parse('');
        expect(computeCurrentToken(tokens, 100, 100)).toStrictEqual([null, null]);
    });

    test('should return the first toke', () => {
        const tokens = parser.parse('one');
        expect(computeCurrentToken(tokens, 1, 1)).toStrictEqual([tokens[0], 0]);
    });

    test('should return the second token', () => {
        const tokens = parser.parse(`one${start}arg${end}`);
        expect(computeCurrentToken(tokens, 4, 4)).toStrictEqual([tokens[1], 1]);
    });
});

describe('should properly update token', () => {
    const literal = 'literal';
    const argument = 'argument';
    const incomplete = 'incomplete';
    const template = `${literal}${start}${argument}${end}${start}${incomplete}`;

    const tokens = parser.parse(template);

    test('should properly update literal token', () => {
        const newLiteral = 'literal42';
        const updatedTokens = updateTokens(tokens, 0, newLiteral, { start, end });

        expect(updatedTokens).toStrictEqual([
            {
                id: getTemplateTokenId(TemplateTokenType.Literal, 0),
                label: newLiteral,
                value: newLiteral,
                position: {
                    start: 0,
                    end: newLiteral.length - 1,
                },
                type: TemplateTokenType.Literal,
            },
            {
                id: getTemplateTokenId(TemplateTokenType.Argument, 1),
                label: `${start}${argument}${end}`,
                rawValue: `${start}${argument}${end}`,
                value: argument,
                position: {
                    start: newLiteral.length,
                    end: newLiteral.length + start.length + argument.length + end.length - 1,
                },
                type: TemplateTokenType.Argument,
            },
            {
                id: getTemplateTokenId(TemplateTokenType.IncompleteArgument, 2),
                label: `${start}${incomplete}`,
                rawValue: `${start}${incomplete}`,
                value: incomplete,
                position: {
                    start: newLiteral.length + start.length + argument.length + end.length,
                    end: newLiteral.length + start.length + argument.length + end.length + start.length + incomplete.length - 1,
                },
                type: TemplateTokenType.IncompleteArgument,
            },
        ])
    });

    test('should properly update argument token', () => {
        const newArgument = 'argument42';
        const updatedTokens = updateTokens(tokens, 1, newArgument, { start, end });

        expect(updatedTokens).toStrictEqual([
            {
                id: getTemplateTokenId(TemplateTokenType.Literal, 0),
                label: literal,
                value: literal,
                position: {
                    start: 0,
                    end: literal.length - 1,
                },
                type: TemplateTokenType.Literal,
            },
            {
                id: getTemplateTokenId(TemplateTokenType.Argument, 1),
                label: `${start}${newArgument}${end}`,
                rawValue: `${start}${newArgument}${end}`,
                value: newArgument,
                position: {
                    start: literal.length,
                    end: literal.length + start.length + newArgument.length + end.length - 1,
                },
                type: TemplateTokenType.Argument,
            },
            {
                id: getTemplateTokenId(TemplateTokenType.IncompleteArgument, 2),
                label: `${start}${incomplete}`,
                rawValue: `${start}${incomplete}`,
                value: incomplete,
                position: {
                    start: literal.length + start.length + newArgument.length + end.length,
                    end: literal.length + start.length + newArgument.length + end.length + start.length + incomplete.length - 1,
                },
                type: TemplateTokenType.IncompleteArgument,
            },
        ]);
    });

    test('should properly update incomplete argument token and turn it into argument', () => {
        const newIncomplete = 'incomplete42';
        const updatedTokens = updateTokens(tokens, 2, newIncomplete, { start, end });

        expect(updatedTokens).toStrictEqual([
            {
                id: getTemplateTokenId(TemplateTokenType.Literal, 0),
                label: literal,
                value: literal,
                position: {
                    start: 0,
                    end: literal.length - 1,
                },
                type: TemplateTokenType.Literal,
            },
            {
                id: getTemplateTokenId(TemplateTokenType.Argument, 1),
                label: `${start}${argument}${end}`,
                rawValue: `${start}${argument}${end}`,
                value: argument,
                position: {
                    start: literal.length,
                    end: literal.length + start.length + argument.length + end.length - 1,
                },
                type: TemplateTokenType.Argument,
            },
            {
                id: getTemplateTokenId(TemplateTokenType.Argument, 2),
                label: `${start}${newIncomplete}${end}`,
                rawValue: `${start}${newIncomplete}${end}`,
                value: newIncomplete,
                position: {
                    start: literal.length + start.length + argument.length + end.length,
                    end: literal.length + start.length + argument.length + end.length + start.length + newIncomplete.length + end.length - 1,
                },
                type: TemplateTokenType.Argument,
            },
        ]);
    });

    test('should properly append literal token to an empty array', () => {
        const newLiteral = 'literal';
        const tokens = [];
        const updatedTokens = appendToTokens(tokens, newLiteral, TemplateTokenType.Literal, { start, end });

        expect(updatedTokens).toStrictEqual([
            {
                id: getTemplateTokenId(TemplateTokenType.Literal, 0),
                label: newLiteral,
                value: newLiteral,
                position: {
                    start: 0,
                    end: newLiteral.length - 1,
                },
                type: TemplateTokenType.Literal,
            }
        ]);
    });

    test('should properly append argument token to an empty array', () => {
        const newArgument = 'argument';
        const rawNewArgument = `${start}${newArgument}${end}`;
        const tokens = [];
        const updatedTokens = appendToTokens(tokens, newArgument, TemplateTokenType.Argument, { start, end });

        expect(updatedTokens).toStrictEqual([
            {
                id: getTemplateTokenId(TemplateTokenType.Argument, 0),
                label: rawNewArgument,
                value: newArgument,
                rawValue: rawNewArgument,
                position: {
                    start: 0,
                    end: rawNewArgument.length - 1,
                },
                type: TemplateTokenType.Argument,
            }
        ]);
    });

    test('should properly append incomplete argument token to an empty array', () => {
        const newIncomplete = 'incomplete';
        const rawNewIncomplete = `${start}${newIncomplete}`;
        const tokens = [];
        const updatedTokens = appendToTokens(tokens, newIncomplete, TemplateTokenType.IncompleteArgument, { start, end });

        expect(updatedTokens).toStrictEqual([
            {
                id: getTemplateTokenId(TemplateTokenType.IncompleteArgument, 0),
                label: rawNewIncomplete,
                value: newIncomplete,
                rawValue: rawNewIncomplete,
                position: {
                    start: 0,
                    end: rawNewIncomplete.length - 1,
                },
                type: TemplateTokenType.IncompleteArgument,
            }
        ]);
    });

    test('should properly append literal token to an existing token array', () => {
        const liternal1 = 'lol';
        const argument2Value = 'kek';
        const argument2RawValue = `${start}${argument2Value}${end}`;
        const template = `${liternal1}${argument2RawValue}`;
        const tokens = parser.parse(template);

        const newLiteral = 'literal';
        const updatedTokens = appendToTokens(tokens, newLiteral, TemplateTokenType.Literal, { start, end });

        expect(updatedTokens).toStrictEqual([
            {
                id: getTemplateTokenId(TemplateTokenType.Literal, 0),
                label: liternal1,
                value: liternal1,
                position: {
                    start: 0,
                    end: liternal1.length - 1,
                },
                type: TemplateTokenType.Literal,
            },
            {
                id: getTemplateTokenId(TemplateTokenType.Argument, 1),
                label: argument2RawValue,
                rawValue: argument2RawValue,
                value: argument2Value,
                position: {
                    start: liternal1.length,
                    end: liternal1.length + argument2RawValue.length - 1,
                },
                type: TemplateTokenType.Argument,
            },
            {
                id: getTemplateTokenId(TemplateTokenType.Literal, 2),
                label: newLiteral,
                value: newLiteral,
                position: {
                    start: liternal1.length + argument2RawValue.length,
                    end: liternal1.length + argument2RawValue.length + newLiteral.length - 1,
                },
                type: TemplateTokenType.Literal,
            }
        ]);
    });

    test('should properly append argument token to an empty array', () => {
        const newArgument = 'argument';
        const rawNewArgument = `${start}${newArgument}${end}`;

        const liternal1 = 'lol';
        const argument2Value = 'kek';
        const argument2RawValue = `${start}${argument2Value}${end}`;
        const template = `${liternal1}${argument2RawValue}`;
        const tokens = parser.parse(template);

        const updatedTokens = appendToTokens(tokens, newArgument, TemplateTokenType.Argument, { start, end });

        expect(updatedTokens).toStrictEqual([
            {
                id: getTemplateTokenId(TemplateTokenType.Literal, 0),
                label: liternal1,
                value: liternal1,
                position: {
                    start: 0,
                    end: liternal1.length - 1,
                },
                type: TemplateTokenType.Literal,
            },
            {
                id: getTemplateTokenId(TemplateTokenType.Argument, 1),
                label: argument2RawValue,
                rawValue: argument2RawValue,
                value: argument2Value,
                position: {
                    start: liternal1.length,
                    end: liternal1.length + argument2RawValue.length - 1,
                },
                type: TemplateTokenType.Argument,
            },
            {
                id: getTemplateTokenId(TemplateTokenType.Argument, 2),
                label: rawNewArgument,
                value: newArgument,
                rawValue: rawNewArgument,
                position: {
                    start: liternal1.length + argument2RawValue.length,
                    end: liternal1.length + argument2RawValue.length + rawNewArgument.length - 1,
                },
                type: TemplateTokenType.Argument,
            }
        ]);
    });

    test('should properly append incomplete argument token to an empty array', () => {
        const newIncomplete = 'incomplete';
        const rawNewIncomplete = `${start}${newIncomplete}`;

        const liternal1 = 'lol';
        const argument2Value = 'kek';
        const argument2RawValue = `${start}${argument2Value}${end}`;
        const template = `${liternal1}${argument2RawValue}`;
        const tokens = parser.parse(template);

        const updatedTokens = appendToTokens(tokens, newIncomplete, TemplateTokenType.IncompleteArgument, { start, end });

        expect(updatedTokens).toStrictEqual([
            {
                id: getTemplateTokenId(TemplateTokenType.Literal, 0),
                label: liternal1,
                value: liternal1,
                position: {
                    start: 0,
                    end: liternal1.length - 1,
                },
                type: TemplateTokenType.Literal,
            },
            {
                id: getTemplateTokenId(TemplateTokenType.Argument, 1),
                label: argument2RawValue,
                rawValue: argument2RawValue,
                value: argument2Value,
                position: {
                    start: liternal1.length,
                    end: liternal1.length + argument2RawValue.length - 1,
                },
                type: TemplateTokenType.Argument,
            },
            {
                id: getTemplateTokenId(TemplateTokenType.IncompleteArgument, 2),
                label: rawNewIncomplete,
                value: newIncomplete,
                rawValue: rawNewIncomplete,
                position: {
                    start: liternal1.length + argument2RawValue.length,
                    end: liternal1.length + argument2RawValue.length + rawNewIncomplete.length - 1,
                },
                type: TemplateTokenType.IncompleteArgument,
            }
        ]);
    });
});