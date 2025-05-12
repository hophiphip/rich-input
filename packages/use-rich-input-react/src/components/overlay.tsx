import cx from "classnames";
import { type HTMLAttributes, forwardRef } from "react";

import classes from "./overlay.module.css";

const Overlay = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
	({ className, ...props }, forwardedRef) => {
		return <div ref={forwardedRef} className={cx(classes.overlay, className)} {...props} />;
	},
);

export default Overlay;
