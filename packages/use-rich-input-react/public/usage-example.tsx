import React, {
	type Dispatch,
	type SetStateAction,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";

import {
	Container,
	Input,
	Overlay,
	type TemplateToken,
	TemplateTokenType,
	Token,
	type TokenInfo,
	tokensToString,
	useRichInput,
	useRichInputToken,
} from "../src";

// NOTE: This is a valid import,
// @ts-ignore, reason: I don't really care about setting up TS config properly for dev app
import classes from "./usage-example.module.css";

const RichInput = ({ debug = true }: { debug?: boolean }) => {
	const [value, setValue] = useState("");

	const overlayRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);

	const { getInputProps, inputValue, tokenInfo } = useRichInput({
		inputRef,
		overlayRef,

		value,
		onChange: setValue,
	});

	const inputProps = useMemo(() => getInputProps(), [getInputProps]);

	const { currentToken, currentTokenIndex, updateCurrentToken } = useRichInputToken(tokenInfo);

	return (
		<>
			<div className={classes.root}>
				<Container>
					<Overlay ref={overlayRef}>
						{tokenInfo.tokens.map((token) =>
							token.type === TemplateTokenType.Argument ? (
								<Token.Argument key={token.id}>{token.label}</Token.Argument>
							) : (
								<Token.Literal key={token.id}>{token.label}</Token.Literal>
							),
						)}
					</Overlay>

					<Input ref={inputRef} value={inputValue} {...inputProps} />
				</Container>
			</div>

			{debug && (
				<DebugInput
					currentToken={currentToken}
					currentTokenIndex={currentTokenIndex}
					tokenInfo={tokenInfo}
					updateCurrentToken={updateCurrentToken}
					setValue={setValue}
				/>
			)}
		</>
	);
};

/** ---------------------------------------------------------------------------------- */

const TemplateTokenTypeToString = ({ type }: { type: TemplateTokenType | undefined }) => {
	if (type === undefined) return "-";

	switch (type) {
		case TemplateTokenType.Literal:
			return "Literal";
		case TemplateTokenType.Argument:
			return "Argument";
		case TemplateTokenType.IncompleteArgument:
			return "IncompleteArgument";
		default:
			return "Invalid type";
	}
};

function DebugInput({
	currentToken,
	currentTokenIndex,
	tokenInfo,
	updateCurrentToken,
	setValue,
}: {
	currentToken: TemplateToken | null;
	currentTokenIndex: number | null;
	tokenInfo: TokenInfo;
	updateCurrentToken: (value: string) => TemplateToken[] | null;
	setValue: Dispatch<SetStateAction<string>>;
}) {
	const [newTokenValue, setNewTokenValue] = useState("");

	// biome-ignore lint/correctness/useExhaustiveDependencies: Reset value on token change
	useEffect(() => {
		setNewTokenValue("");
	}, [currentTokenIndex]);

	return (
		<div>
			<div>Current token value: {currentToken?.value ?? "-"}</div>

			<div>Current token index: {currentTokenIndex ?? "-"}</div>

			{!!currentToken && currentToken.type !== TemplateTokenType.Literal && (
				<div>Current token raw value: {currentToken.rawValue}</div>
			)}

			<div>
				Current token type: <TemplateTokenTypeToString type={currentToken?.type} />
			</div>

			<div>
				Cursor position: [{tokenInfo.cursorStart}, {tokenInfo.cursorEnd}]
			</div>

			<label>
				Update current token:
				<input
					value={newTokenValue}
					onChange={(event) => setNewTokenValue(event.target.value)}
					onKeyDown={(event) => {
						if (event.key === "Enter" && newTokenValue) {
							const newTokens = updateCurrentToken(newTokenValue);
							if (!newTokens) return;

							const newInputValue = tokensToString(newTokens);
							setValue(newInputValue);

							setNewTokenValue('');
						}
					}}
				/>
			</label>
		</div>
	);
}

/** ---------------------------------------------------------------------------------- */

const UsageExample = () => {
	return (
		<div style={{ padding: "0.5rem", boxSizing: "border-box" }}>
			<RichInput />
		</div>
	);
};

export default UsageExample;
