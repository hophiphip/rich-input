import React, { useMemo, useRef, useState } from "react";

import {
	Container,
	Input,
	Overlay,
	type TemplateToken,
	TemplateTokenType,
	Token,
	type TokenInfo,
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

	const [currentToken] = useRichInputToken(tokenInfo);

	return (
		<>
			<div className={classes.root}>
				<Container>
					<Overlay ref={overlayRef}>
						{tokenInfo.tokens.map((token) =>
							token.type === TemplateTokenType.Literal ? (
								<Token.Literal key={token.id}>{token.value}</Token.Literal>
							) : (
								<Token.Argument key={token.id}>{token.value}</Token.Argument>
							),
						)}
					</Overlay>

					<Input ref={inputRef} value={inputValue} {...inputProps} />
				</Container>
			</div>

			{debug && (
				<DebugInput 
					currentToken={currentToken} 
					tokenInfo={tokenInfo} 
				/>
			)}
		</>
	);
};

/** ---------------------------------------------------------------------------------- */

function DebugInput({
	currentToken,
	tokenInfo,
}: {
	currentToken: TemplateToken | null;
	tokenInfo: TokenInfo;
}) {
	return (
		<div>
			<div>Current token: {currentToken?.value ?? "-"}</div>
			<div>
				Cursor position: [{tokenInfo.cursorStart}, {tokenInfo.cursorEnd}]
			</div>
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
