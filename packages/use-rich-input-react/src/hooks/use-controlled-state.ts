import { type SetStateAction, useCallback, useEffect, useRef, useState } from "react";

type StateBase =
	| string
	| number
	| boolean
	| null
	| undefined
	| { [x: string]: StateBase }
	| StateBase[];

export function useControlledState<
	State extends StateBase,
	OnChange extends (value: State) => void,
>(value: State, onChange?: OnChange) {
	const [uncontrolledValue, setUncontrolledValue] = useState(value);

	const valueRef = useRef(value);
	useEffect(() => {
		valueRef.current = value;
	});

	const onChangeRef = useRef(onChange);
	useEffect(() => {
		onChangeRef.current = onChange;
	});

	const onControlledChange = useCallback((action: SetStateAction<State>) => {
		if (onChangeRef.current) {
			const currentValue = valueRef.current;
			const nextValue = typeof action === "function" ? action(currentValue) : action;
			onChangeRef.current(nextValue);
		}
	}, []);

	if (typeof onChange === "function") {
		return [value, onControlledChange] as const;
	}

	return [uncontrolledValue, setUncontrolledValue] as const;
}
