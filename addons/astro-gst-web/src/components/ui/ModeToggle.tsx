import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import * as React from "react";

export function ModeToggle() {
	const [theme, setTheme] = React.useState<"light" | "dark">("dark");

	React.useEffect(() => {
		if (!document.documentElement.classList.contains("dark")) {
			document.documentElement.classList.add("dark");
		}

		const isDarkMode = document.documentElement.classList.contains("dark");
		setTheme(isDarkMode ? "dark" : "light");
	}, []);

	const toggleTheme = () => {
		const newTheme = theme === "light" ? "dark" : "light";
		setTheme(newTheme);
		document.documentElement.classList.toggle("dark");
	};

	return (
		<Button variant="outline" size="icon" onClick={toggleTheme}>
			<Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
			<Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
			<span className="sr-only">Toggle theme</span>
		</Button>
	);
}
