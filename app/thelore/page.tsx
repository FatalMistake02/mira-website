"use client";

import { useEffect, useState } from "react";

export default function TheLorePage() {
	const [isDarkMode, setIsDarkMode] = useState(false);

	useEffect(() => {
		const checkTheme = () => {
			const storedTheme = localStorage.getItem("theme-preference");
			if (storedTheme === "dark") {
				setIsDarkMode(true);
			} else if (storedTheme === "light") {
				setIsDarkMode(false);
			} else {
				// Check system preference if no stored theme
				const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
				setIsDarkMode(systemPrefersDark);
			}
		};

		checkTheme();

		// Listen for theme changes
		const handleThemeChange = () => {
			checkTheme();
		};

		window.addEventListener("storage", handleThemeChange);
		window.addEventListener("theme-preference-change", handleThemeChange);

		return () => {
			window.removeEventListener("storage", handleThemeChange);
			window.removeEventListener("theme-preference-change", handleThemeChange);
		};
	}, []);

	return (
		<main style={{
			minHeight: '100vh',
			display: 'flex',
			flexDirection: 'column',
			alignItems: 'center',
			paddingTop: '4rem',
			background: isDarkMode ? '#0b1220' : '#ffffff',
			color: isDarkMode ? '#ffffff' : '#000000',
			fontFamily: 'Solitreo, serif',
		}}>
			<h1 style={{ fontSize: '3rem', margin: 0 }} className="font-solitreo">the LORE</h1>

			<div style={{ maxWidth: 800, marginTop: '1.5rem', padding: '0 1rem', lineHeight: 1.7 }}>
				<p>
					Lore goes here. Coming soon. Maybe.
				</p>
			</div>
		</main>
	)
}
