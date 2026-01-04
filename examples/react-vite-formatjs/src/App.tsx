import { useState } from "react";
import { FormattedMessage, IntlProvider } from "react-intl";
import { defaultLocale, type Locale, messages } from "./i18n/config";
import "./App.css";

function App() {
	const [locale, setLocale] = useState<Locale>(defaultLocale);

	const toggleLanguage = () => {
		setLocale((current) => (current === "en" ? "es" : "en"));
	};

	return (
		<IntlProvider
			messages={messages[locale]}
			locale={locale}
			defaultLocale={defaultLocale}
		>
			<div className="app">
				<h1>LocaleOps FormatJS Example</h1>
				<p>Ready for localization integration</p>

				<p>
					<FormattedMessage id="welcome_message" />
				</p>

				<button type="button" onClick={toggleLanguage}>
					Switch to {locale === "en" ? "Spanish" : "English"}
				</button>
			</div>
		</IntlProvider>
	);
}

export default App;
