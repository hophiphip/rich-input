import { useMemo, useRef, useState } from 'react';

import { GoRepo } from 'react-icons/go';
import { FaUser } from 'react-icons/fa';

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
} from '@hophiphip/use-rich-input-react';

import '@hophiphip/use-rich-input-react/style.css';

import classes from './query-builder.module.css';

/** ---------------------------------------------------------------------------------- */

const queryConfig = {
    scopes: [
        { key: 'repo', Leading: GoRepo },
        { key: 'user', Leading: FaUser },
    ],
    values: {
        repo: [
            'Alex/ToDoApp',
            'John/WeatherInfoClient',
        ],
        user: [
            'Alex',
            'John',
        ],
    }
} as const;

const argumentStart = ":";
const argumentEnd = " ";

const QueryBuilder = () => {
    const [value, setValue] = useState("");

    const rootRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
	const overlayRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);

	const { getInputProps, tokenInfo } = useRichInput({
		inputRef,
		overlayRef,

		value,
		onChange: setValue,

        argumentEnd,
        argumentStart,
	});

    const inputProps = useMemo(() => getInputProps(), [getInputProps]);

	const [currentToken, currentTokenIndex] = useRichInputToken(tokenInfo);

	/** ---------------------------------------------------------------------------------- */

    const listRef = useRef<Array<HTMLElement | null>>([]);

	const [areOptionsOpen, setOptionsOpen] = useState(false);
	const [activeOptionIndex, setActiveOptionIndex] = useState<number | null>(null);

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
    
    const options = useMemo(() => {
        if (!currentToken || currentToken.type === TemplateTokenType.Literal) {
            return queryConfig.scopes.map((scope) => ({
                key: scope.key,
                value: scope.key,
                Leading: scope.Leading,
            }));
        }

        if (currentToken.type === TemplateTokenType.Argument && currentTokenIndex > 0) {
            const prevToken = tokenInfo.tokens[currentTokenIndex - 1];
            if (prevToken.type === TemplateTokenType.Literal) {
                switch (prevToken.value) {
                    case 'user': {
                        return queryConfig.values.user.map((user) => ({
                            key: user,
                            value: user,
                            Leading: null,
                        }))
                    };

                    case 'repo': {
                        return queryConfig.values.repo.map((repo) => ({
                            key: repo,
                            value: repo,
                            Leading: null,
                        }));
                    };
                }
            }
        }

        return [];
    }, [
        tokenInfo.tokens, 
        currentToken, 
        currentTokenIndex,
    ]);

    return (
        <div ref={rootRef} className={classes.root}>
			<Container ref={containerRef}>
				<Overlay ref={overlayRef}>
					{tokenInfo.tokens.map((token) =>
						token.type === TemplateTokenType.Literal ? (
							<Token.Literal key={token.id}>
								{token.value}
							</Token.Literal>
						) : (
							<Token.Argument key={token.id} className={classes.argument}>
								{token.value}
							</Token.Argument>
						),
					)}
				</Overlay>

				<Input 
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
                                {options.map(({ Leading, key, value }) => (
                                    <div key={key} className={classes.option} {...getItemProps()}>
                                        {Leading && <Leading />} 
                                        <span>{value}</span>
                                    </div>
                                ))}
                            </div>
                        </FloatingFocusManager>
                    </FloatingPortal>
                )}
			</Container>
		</div>
    );
};

/** ---------------------------------------------------------------------------------- */

const QueryBuilderExample = () => {
    return (
        <div style={{ padding: '0.5rem', boxSizing: 'border-box', width: '100%' }}>
            <QueryBuilder />
        </div>
    );
};

export default QueryBuilderExample;