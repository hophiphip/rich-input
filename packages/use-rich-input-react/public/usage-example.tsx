import React, { useRef, useState } from "react";

import { 
	Container,
	Input,
	Overlay,
	TemplateTokenType,
	Token,
	useRichInput, 
	useRichInputToken,
} from "../src";

// It is a valid import,
// @ts-ignore ..Do not really care about setting up TS config properly for now
import classes from "./usage-example.module.css";

const RichInput = () => {
	const [value, setValue] = useState("");

	const overlayRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);

	const { getInputProps, getTokenInfo } = useRichInput({
		inputRef,
		overlayRef,

		value,
		onChange: setValue,
	});

	const tokenInfo = getTokenInfo();

	const {
		currentToken,
		currentTokenIndex
	} = useRichInputToken(tokenInfo);

	return (
		<div className={classes.root}>
			<Container>
				<Overlay ref={overlayRef}>
					{tokenInfo.tokens.map((token) =>
						token.type === TemplateTokenType.Literal ? (
							<Token.Literal key={token.id}>
								{token.value}
							</Token.Literal>
						) : (
							<Token.Argument key={token.id}>
								{token.value}
							</Token.Argument>
						),
					)}
				</Overlay>

				<Input ref={inputRef} {...getInputProps()} />
			</Container>
		</div>
	);
};

/** ---------------------------------------------------------------------------------- */

const UsageExample = () => {
	return (
		<div style={{ padding: "0.5rem", boxSizing: "border-box" }}>
			<RichInput />
		</div>
	);
};

export default UsageExample;
