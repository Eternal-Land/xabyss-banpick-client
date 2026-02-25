export const DateFormat = {
	DEFAULT: "DD/MM/YYYY HH:mm:ss",
} as const;

export type DateFormatEnum = (typeof DateFormat)[keyof typeof DateFormat];
