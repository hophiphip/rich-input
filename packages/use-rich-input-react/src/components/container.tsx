import cx from "classnames";
import { type HTMLAttributes, forwardRef } from "react";

import classes from "./container.module.css";

const Container = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
	({ className, ...props }, forwardedRef) => {
		return <div ref={forwardedRef} className={cx(classes.container, className)} {...props} />;
	},
);

export default Container;
