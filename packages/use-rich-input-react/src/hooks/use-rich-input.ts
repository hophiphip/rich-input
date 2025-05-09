import {
	type InputHTMLAttributes,
	type ChangeEventHandler as ReactChangeEventHandler,
	type KeyboardEventHandler as ReactKeyboardEventHandler,
	type MouseEventHandler as ReactMouseEventHandler,
	type UIEventHandler as ReactUIEventHandler,
	type RefObject,
	useCallback,
	useMemo,
} from "react";

import type { TemplateToken } from "@hophiphip/rich-input-core";

import { useControlledState } from "./use-controlled-state";
import { useInputCursor } from "./use-input-cursor";
import { type TemplateParserOptions, useTemplateParser } from "./use-template-parser";

export type UseRichInputOptions<OverlayElement extends HTMLElement> = {
	value?: string | undefined;
	onChange?: (value: string) => void;

	overlayRef: RefObject<OverlayElement>;
	inputRef: RefObject<HTMLInputElement>;
} & Pick<TemplateParserOptions, "argumentStart" | "argumentEnd">;

export type TokenInfo = {
	tokens: TemplateToken[];
	cursorStart: number;
	cursorEnd: number;
};

export function useRichInput<OverlayElement extends HTMLElement>({
	value: externalValue,
	onChange: externalOnChange,

	overlayRef,
	inputRef,

	argumentStart,
	argumentEnd,
}: UseRichInputOptions<OverlayElement>) {
	const [inputValue, setInputValue] = useControlledState(externalValue ?? "", externalOnChange);
	const [tokens] = useTemplateParser({ argumentStart, argumentEnd, value: inputValue });

	const {
		start: cursorStart,
		end: cursorEnd,
		updateCursor,
	} = useInputCursor({
		ref: inputRef,
	});

	/** ---------------------------------------------------------------------------------- */

	const onChange: ReactChangeEventHandler<HTMLInputElement> = useCallback(
		(event) => {
			setInputValue(event.target.value);
			updateCursor();
		},
		[setInputValue, updateCursor],
	);

	const onKeyDown: ReactKeyboardEventHandler<HTMLInputElement> = useCallback(() => {
		updateCursor();
	}, [updateCursor]);

	const onKeyUp: ReactKeyboardEventHandler<HTMLInputElement> = useCallback(() => {
		updateCursor();
	}, [updateCursor]);

	const onClick: ReactMouseEventHandler<HTMLInputElement> = useCallback(() => {
		updateCursor();
	}, [updateCursor]);

	/**
	 * Sync overlay and input element scroll.
	 *
	 * biome-ignore lint/correctness/useExhaustiveDependencies(overlayRef.current): overlayRef is a ref
	 */
	const onScroll: ReactUIEventHandler<HTMLInputElement> = useCallback((event) => {
		if (!overlayRef.current) return;
		overlayRef.current.scrollTop = (event.target as HTMLInputElement).scrollTop;
		overlayRef.current.scrollLeft = (event.target as HTMLInputElement).scrollLeft;
	}, []);

	const getInputProps = useCallback(
		(
			userProps?: Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange">,
		): InputHTMLAttributes<HTMLInputElement> => {
			return {
				...userProps,

				onChange,
				onKeyDown: (event) => {
					userProps?.onKeyDown?.(event);
					onKeyDown(event);
				},
				onKeyUp: (event) => {
					userProps?.onKeyUp?.(event);
					onKeyUp(event);
				},
				onClick: (event) => {
					userProps?.onClick?.(event);
					onClick(event);
				},
				onScroll: (event) => {
					userProps?.onScroll?.(event);
					onScroll(event);
				},
			};
		},
		[onChange, onKeyDown, onKeyUp, onClick, onScroll],
	);

	/** ---------------------------------------------------------------------------------- */

	const tokenInfo = useMemo((): TokenInfo => {
		return {
			tokens,
			cursorStart,
			cursorEnd,
		};
	}, [tokens, cursorStart, cursorEnd]);

	/** ---------------------------------------------------------------------------------- */

	return {
		getInputProps,
		inputValue,
		tokenInfo,
	};
}
