import cx from 'classnames';
import { type InputHTMLAttributes, forwardRef } from "react";

import classes from './input.module.css';

const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
	({ className, ...props }, forwardedRef) => {
		return (
            <input 
                ref={forwardedRef}
                className={cx(classes.input, className)} 
                {...props} 
            />
        );
	},
);

export default Input;
