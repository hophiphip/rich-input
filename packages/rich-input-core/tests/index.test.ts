import { describe, expect, test } from 'vitest';
import { TemplateParser, TemplateTokenType } from '../src/index';

test('should export the TemplateParser class', () => {
    expect(TemplateParser).toBeDefined();
});

describe('should parse query-like template', () => {
    const argumentStart = ":";
    const argumentEnd = " ";

    const parser = new TemplateParser(argumentStart, argumentEnd);

    test('should return empty array for an empty string', () => {
        expect(parser.parse("")).toEqual([]);
    });

    test('should return one literal token', () => {
        const literal = "one";

        expect(parser.parse(literal)).toMatchObject([
            {
                position: {
                    end: literal.length - 1,
                    start: 0,
                },
                type: TemplateTokenType.Literal,
                value: literal,
                label: literal,
            }
        ]);
    });

    test('should return literal and incomplete-argument tokens when contains not-closed argument start', () => {
        const literal = "one";
        
        expect(parser.parse(`${literal}${argumentStart}`)).toMatchObject([
            {
                position: {
                    end: literal.length - 1,
                    start: 0,
                },
                type: TemplateTokenType.Literal,
                value: literal,
                label: literal,
            },
            {
                position: {
                    start: literal.length,
                    end: literal.length + argumentStart.length - 1,
                },
                type: TemplateTokenType.IncompleteArgument,
                value: "",
                rawValue: argumentStart,
                label: argumentStart,
            }
        ]);
    });

    test('should return literal and argument tokens', () => {
        const literal = "one";
        const argumentValue = "argument";

        expect(parser.parse(`${literal}${argumentStart}${argumentValue}${argumentEnd}`)).toMatchObject([
            {
                position: {
                    end: literal.length - 1,
                    start: 0,
                },
                type: TemplateTokenType.Literal,
                value: literal,
                label: literal,
            },
            {
                position: {
                    start: literal.length,
                    end: literal.length + argumentStart.length + argumentValue.length + argumentEnd.length - 1,
                },
                type: TemplateTokenType.Argument,
                value: argumentValue,
                rawValue: `${argumentStart}${argumentValue}${argumentEnd}`,
                label: `${argumentStart}${argumentValue}${argumentEnd}`,
            }
        ]);
    });

    test('should return literal and incomplete-argument tokens when argument was not closed', () => {
        const literal = "one";
        const argumentValue = "argument";

        expect(parser.parse(`${literal}${argumentStart}${argumentValue}`)).toMatchObject([
            {
                position: {
                    end: literal.length - 1,
                    start: 0,
                },
                type: TemplateTokenType.Literal,
                value: literal,
                label: literal,
            },
            {
                position: {
                    start: literal.length,
                    end: literal.length + argumentStart.length + argumentValue.length - 1,
                },
                type: TemplateTokenType.IncompleteArgument,
                value: argumentValue,
                rawValue: `${argumentStart}${argumentValue}`,
                label: `${argumentStart}${argumentValue}`,
            }
        ]);
    });

    test('should return two argument tokens', () => {
        const argumentOne = "argumentOne";
        const argumentTwo = "argumentTwo";

        expect(parser.parse(`${argumentStart}${argumentOne}${argumentEnd}${argumentStart}${argumentTwo}${argumentEnd}`)).toMatchObject([
            {
                position: {
                    end: argumentStart.length + argumentOne.length + argumentEnd.length - 1,
                    start: 0,
                },
                type: TemplateTokenType.Argument,
                value: argumentOne,
                rawValue: `${argumentStart}${argumentOne}${argumentEnd}`,
                label: `${argumentStart}${argumentOne}${argumentEnd}`,
            },
            {
                position: {
                    start: argumentStart.length + argumentOne.length + argumentEnd.length,
                    end: argumentStart.length + argumentOne.length + argumentEnd.length + argumentStart.length + argumentTwo.length + argumentEnd.length - 1,
                },
                type: TemplateTokenType.Argument,
                value: argumentTwo,
                rawValue: `${argumentStart}${argumentTwo}${argumentEnd}`,
                label: `${argumentStart}${argumentTwo}${argumentEnd}`,
            }
        ]);
    });
});

/** 
 * Basically the same as previous tests but with different argument start/end characters.
 * Not really needed, just left here for possible border cases in the future. 
 */
describe('should parse template with brackets', () => {
    const argumentStart = '{';
    const argumentEnd = '}';

    const parser = new TemplateParser(argumentStart, argumentEnd);

    test('should return empty array for an empty string', () => {
        expect(parser.parse("")).toEqual([]);
    });

    test('should return one literal token', () => {
        const literal = "one";

        expect(parser.parse(literal)).toMatchObject([
            {
                position: {
                    end: literal.length - 1,
                    start: 0,
                },
                type: TemplateTokenType.Literal,
                value: literal,
                label: literal,
            }
        ]);
    });

    test('should return literal and incomplete-argument tokens when contains not-closed argument start', () => {
        const literal = "one";
        
        expect(parser.parse(`${literal}${argumentStart}`)).toMatchObject([
            {
                position: {
                    end: literal.length - 1,
                    start: 0,
                },
                type: TemplateTokenType.Literal,
                value: literal,
                label: literal,
            },
            {
                position: {
                    start: literal.length,
                    end: literal.length + argumentStart.length - 1,
                },
                type: TemplateTokenType.IncompleteArgument,
                value: "",
                rawValue: argumentStart,
                label: argumentStart,
            }
        ]);
    });

    test('should return literal and argument tokens', () => {
        const literal = "one";
        const argumentValue = "argument";

        expect(parser.parse(`${literal}${argumentStart}${argumentValue}${argumentEnd}`)).toMatchObject([
            {
                position: {
                    end: literal.length - 1,
                    start: 0,
                },
                type: TemplateTokenType.Literal,
                value: literal,
                label: literal,
            },
            {
                position: {
                    start: literal.length,
                    end: literal.length + argumentStart.length + argumentValue.length + argumentEnd.length - 1,
                },
                type: TemplateTokenType.Argument,
                value: argumentValue,
                rawValue: `${argumentStart}${argumentValue}${argumentEnd}`,
                label: `${argumentStart}${argumentValue}${argumentEnd}`,
            }
        ]);
    });

    test('should return literal and incomplete-argument tokens when argument was not closed', () => {
        const literal = "one";
        const argumentValue = "argument";

        expect(parser.parse(`${literal}${argumentStart}${argumentValue}`)).toMatchObject([
            {
                position: {
                    end: literal.length - 1,
                    start: 0,
                },
                type: TemplateTokenType.Literal,
                value: literal,
                label: literal,
            },
            {
                position: {
                    start: literal.length,
                    end: literal.length + argumentStart.length + argumentValue.length - 1,
                },
                type: TemplateTokenType.IncompleteArgument,
                value: argumentValue,
                rawValue: `${argumentStart}${argumentValue}`,
                label: `${argumentStart}${argumentValue}`,
            }
        ]);
    });

    test('should return two argument tokens', () => {
        const argumentOne = "argumentOne";
        const argumentTwo = "argumentTwo";

        expect(parser.parse(`${argumentStart}${argumentOne}${argumentEnd}${argumentStart}${argumentTwo}${argumentEnd}`)).toMatchObject([
            {
                position: {
                    end: argumentStart.length + argumentOne.length + argumentEnd.length - 1,
                    start: 0,
                },
                type: TemplateTokenType.Argument,
                value: argumentOne,
                rawValue: `${argumentStart}${argumentOne}${argumentEnd}`,
                label: `${argumentStart}${argumentOne}${argumentEnd}`,
            },
            {
                position: {
                    start: argumentStart.length + argumentOne.length + argumentEnd.length,
                    end: argumentStart.length + argumentOne.length + argumentEnd.length + argumentStart.length + argumentTwo.length + argumentEnd.length - 1,
                },
                type: TemplateTokenType.Argument,
                value: argumentTwo,
                rawValue: `${argumentStart}${argumentTwo}${argumentEnd}`,
                label: `${argumentStart}${argumentTwo}${argumentEnd}`,
            }
        ]);
    });
})