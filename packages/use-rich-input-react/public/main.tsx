import React from "react";
import ReactDOM from "react-dom/client";

import UsageExample from "./usage-example";

import "./index.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
	<React.StrictMode>
		<UsageExample />
	</React.StrictMode>,
);
