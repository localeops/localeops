export type Formatting = {
	indent: string; // tabs or spaces for nesting
	eol: string; // \n or \r\n
	tail: string; // trailing newline or not
};

export const formatJson = ({
	resource,
	formatting,
}: {
	resource: unknown;
	formatting: Formatting;
}) => {
	const { indent, eol, tail } = formatting;
	return JSON.stringify(resource, null, indent).replace(/\n/g, eol) + tail;
};
