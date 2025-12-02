type Formatting = {
	indent: string;
	eol: string;
	tail: string;
};

export const inferFormatting = (raw: string): Formatting => {
	const eol = raw.includes("\r\n") ? "\r\n" : "\n";
	const tail = raw.endsWith(eol) ? eol : "";
	const indentMatch = raw.match(/^[\t ]+(?=")/m);
	const indent = indentMatch ? indentMatch[0] : "  ";
	return { indent, eol, tail };
};

export const formatContent = ({
	content,
	formatting,
}: {
	content: unknown;
	formatting: Formatting;
}) => {
	const { indent, eol, tail } = formatting;
	return JSON.stringify(content, null, indent).replace(/\n/g, eol) + tail;
};
