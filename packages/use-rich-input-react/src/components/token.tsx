import cx from "classnames";
import { type HTMLAttributes, forwardRef } from "react";

import classes from "./token.module.css";

const Literal = forwardRef<HTMLSpanElement, HTMLAttributes<HTMLSpanElement>>(
	({ className, ...props }, forwardedRef) => {
		return <span ref={forwardedRef} className={cx(classes.token, className)} {...props} />;
	},
);

const Argument = forwardRef<HTMLElement, HTMLAttributes<HTMLElement>>(
	({ className, ...props }, forwardedRef) => {
		return <mark ref={forwardedRef} className={cx(classes.token, className)} {...props} />;
	},
);

const Token = {
	Literal,
	Argument,
};

export default Token;
