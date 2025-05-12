import { memo, useCallback, useMemo, useRef, useState, type Dispatch, type RefObject, type SetStateAction/*, type KeyboardEvent as ReactKeyboardEvent */ } from 'react';

import {
	FloatingFocusManager,
	FloatingPortal,
	autoUpdate,
	flip,
	offset,
	size,
	useClick,
	useDismiss,
	useFloating,
	useInteractions,
	useListNavigation,
	useMergeRefs,
	useRole,
} from '@floating-ui/react';

import {
    Container,
    Overlay,
    Input,
    Token,

    useRichInput,
    useRichInputToken,

    TemplateTokenType,
    type TokenInfo,

    tokensToString,
} from '@hophiphip/use-rich-input-react';

import '@hophiphip/use-rich-input-react/style.css';

import classes from './template-builder.module.css';

/** ---------------------------------------------------------------------------------- */

const templateConfig = {
    API_HOST: "dev.test.local",
    API_PROTO: "https",
    API_PORT: "8080",
} as const;

const argumentStart = "{";
const argumentEnd = "}";

/** ---------------------------------------------------------------------------------- */

type TemplateOptionsProps = {
    tokenInfo: TokenInfo;
    setValue: Dispatch<SetStateAction<string>>;
    listRef: RefObject<(HTMLElement | null)[]>;
    getItemProps: (userProps?: Omit<React.HTMLProps<HTMLElement>, "selected" | "active"> & Record<string, unknown>) => Record<string, unknown>;

    activeIndex: number | null;
    setActiveIndex: Dispatch<SetStateAction<number | null>>;
    setOptionsOpen: Dispatch<SetStateAction<boolean>>;

    inputRef: RefObject<HTMLInputElement | null>;
}; 

const TemplateOptionsBase = ({
    tokenInfo,
    setValue,
    listRef,
    getItemProps,

    activeIndex,
    setActiveIndex,
    setOptionsOpen,

    inputRef,
}: TemplateOptionsProps) => {
	const [currentToken, currentTokenIndex] = useRichInputToken(tokenInfo);

    const options = useMemo(() => {
        if (currentToken && currentToken.type !== TemplateTokenType.Literal) {
            return Object.entries(templateConfig).map(([key, value]) => ({
                key,
                value,
                complete: `${argumentStart}${key}${argumentEnd}`,
            }));
        }

        return [];
    }, [
        currentToken, 
    ]);

    const onOptionClick = useCallback((value: string) => {
        if (currentTokenIndex) {
            const newTokens = tokenInfo.tokens.map((token, index) => {
                return index === currentTokenIndex
                    ? { ...token, value }
                    : token
            });

            setValue(tokensToString(newTokens, argumentStart, argumentEnd));
        } else {
            setValue(value);
        }

        setActiveIndex(null);
        setOptionsOpen(false);
        inputRef.current?.focus();
    }, [currentTokenIndex, setValue, tokenInfo.tokens, setActiveIndex, setOptionsOpen, inputRef]);

    return (
        <>
            {options.length === 0 && (
                <div>
                    Nothing to show :(
                </div>
            )}

            {options.map(({ key, value, complete }, index) => (
                <div 
                    key={key} 
                    role='option'
                    className={classes.option} 
                    aria-selected={activeIndex === index}
                    {...getItemProps({
                        ref: (element) => {
                            listRef.current[index] = element;
                        },
                        onClick: () => {
                            onOptionClick(complete);
                        },
                    })}>
                    <span>{key}</span>
                    <span className={classes.secondary}>{value}</span>
                </div>
            ))}
        </>
    );
};

const TemplateOptions = memo(TemplateOptionsBase);

/** ---------------------------------------------------------------------------------- */

const TemplateBuilder = () => {
    const [value, setValue] = useState("");

    const [areOptionsOpen, setOptionsOpen] = useState(false);
	const [activeOptionIndex, setActiveOptionIndex] = useState<number | null>(null);

    const rootRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
	const overlayRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);

	const { getInputProps, tokenInfo, inputValue } = useRichInput({
		inputRef,
		overlayRef,

		value,
		onChange: setValue,

        argumentEnd,
        argumentStart,
	});

    const inputProps = useMemo(() => getInputProps({
        onKeyDown: (event) => {
            if (event.ctrlKey && event.code === "Space") {
                setOptionsOpen(true);
            }
        },
    }), [getInputProps]);

	/** ---------------------------------------------------------------------------------- */

    const listRef = useRef<Array<HTMLElement | null>>([]);

    const { refs, floatingStyles, context } = useFloating<HTMLInputElement>({
		whileElementsMounted: autoUpdate,
		open: areOptionsOpen,
		onOpenChange: setOptionsOpen,
		middleware: [
			flip({ padding: 10 }),
			offset(5),
			size({
				apply({ rects, elements }) {
                    const rootRect = rootRef.current?.getBoundingClientRect();
                    const dropdownWidth = rootRect?.width ?? rects.reference.width;

					Object.assign(elements.floating.style, {
						width: `${dropdownWidth}px`,
					});
				},
			}),
		],
	});

    const click = useClick(context, { stickIfOpen: true, toggle: false });
	const role = useRole(context, { role: 'listbox' });
	const dismiss = useDismiss(context);
	const listNav = useListNavigation(context, {
		listRef,
		activeIndex: activeOptionIndex,
		onNavigate: setActiveOptionIndex,
		virtual: true,
		loop: true,
	});

	const { getReferenceProps, getFloatingProps, getItemProps } = useInteractions([
		click,
		role,
		dismiss,
		listNav,
	]);

	/** ---------------------------------------------------------------------------------- */

    //const onInputKeyDown = useCallback((event: ReactKeyboardEvent<HTMLElement>, value: string) => {
    //    if (event.key === 'Enter' && activeOptionIndex !== null) {
    //    }
    //}, [activeOptionIndex]);

    return (
        <div ref={rootRef} className={classes.root}>
			<Container ref={containerRef}>
				<Overlay ref={overlayRef}>
					{tokenInfo.tokens.map((token) =>
						token.type === TemplateTokenType.Literal ? (
							<Token.Literal key={token.id}>
								{token.label}
							</Token.Literal>
						) : (
							<Token.Argument key={token.id} className={classes.argument}>
								{token.label}
							</Token.Argument>
						),
					)}
				</Overlay>

				<Input 
                    value={inputValue}
                    {...getReferenceProps({
                        ref: useMergeRefs([inputRef, refs.setReference]),
                        'aria-autocomplete': 'list',
                        ...inputProps,
                    })} 
                />

                {areOptionsOpen && (
                    <FloatingPortal root={containerRef}>
                        <FloatingFocusManager context={context} initialFocus={-1} modal={false}>
                            <div
                                {...getFloatingProps({
                                    ref: refs.setFloating,
                                    style: floatingStyles,
                                    className: classes.dropdown,
                                })}
                            >
                                <TemplateOptions 
                                    tokenInfo={tokenInfo}
                                    setValue={setValue}
                                    listRef={listRef}
                                    getItemProps={getItemProps}
                                    activeIndex={activeOptionIndex}
                                    setOptionsOpen={setOptionsOpen}
                                    setActiveIndex={setActiveOptionIndex}
                                    inputRef={inputRef}
                                />
                            </div>
                        </FloatingFocusManager>
                    </FloatingPortal>
                )}
			</Container>
		</div>
    );
};

/** ---------------------------------------------------------------------------------- */

const TemplateBuilderExample = () => {
    return (
        <div style={{ padding: '0.5rem', boxSizing: 'border-box', width: '100%' }}>
            <TemplateBuilder />
        </div>
    );
};

export default TemplateBuilderExample;