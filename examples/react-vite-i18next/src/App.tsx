import { useTranslation } from "react-i18next";
import "./App.css";
import "./i18n/config";

function App() {
	const { t, i18n } = useTranslation();

	const toggleLanguage = () => {
		const newLang = i18n.language === "en" ? "es" : "en";
		i18n.changeLanguage(newLang);
	};

	return (
		<div className="app">
			<h1>LocaleOps i18next Example</h1>
			<p>Ready for localization integration</p>

			<p>{t("welcome_message")}</p>

			<button type="button" onClick={toggleLanguage}>
				Switch to {i18n.language === "en" ? "Spanish" : "English"}
			</button>
		</div>
	);
}

export default App;
