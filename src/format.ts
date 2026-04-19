import * as vscode from "vscode";

export function format(document: vscode.TextDocument): vscode.TextEdit[] {
    const text = document.getText();
    const formatted = formatXPath(text.trim());
    const fullRange = new vscode.Range(document.positionAt(0), document.positionAt(text.length));
    return [new vscode.TextEdit(fullRange, formatted)];
}

function tokenize(xpath: string): string[] {
    const regex =
        /(\(![^!]*!\)|not(?=\s*\()|\[|\]|\(|\)|and\b|or\b|\/\/|\/|@[\w-]+|[\w.\-:*]+|=|!=|<=|>=|<|>|,|"[^"]*"|'[^']*')/g;
    return xpath.match(regex)?.filter((t) => t.trim() !== "") ?? [];
}

function findClosingBracket(tokens: string[], start: number, open: string, close: string): number {
    let depth = 0;
    for (let i = start; i < tokens.length; i++) {
        if (tokens[i] === open) {
            depth++;
        } else if (tokens[i] === close) {
            depth--;
            if (depth === 0) {
                return i;
            }
        }
    }
    return -1;
}

function isComplex(tokens: string[], start: number, open: string, close: string): boolean {
    const end = findClosingBracket(tokens, start, open, close);
    if (end === -1) {
        return false;
    }
    for (let i = start + 1; i < end; i++) {
        if (tokens[i] === "and" || tokens[i] === "or") {
            return true;
        }
    }
    return false;
}

function formatTokens(tokens: string[], indent: number): string {
    const tab = "\t";
    let result = "";
    let i = 0;

    while (i < tokens.length) {
        const t = tokens[i];
        const tabs = tab.repeat(indent);

        if (t === "[") {
            const end = findClosingBracket(tokens, i, "[", "]");
            if (end === -1) {
                result += t;
                i++;
                continue;
            }

            if (isComplex(tokens, i, "[", "]")) {
                const inner = tokens.slice(i + 1, end);
                result += "[\n" + formatTokens(inner, indent + 1) + "\n" + tabs + "]";
            } else {
                const inner = tokens.slice(i + 1, end).join("");
                result += "[" + inner + "]";
            }
            i = end + 1;
        } else if (t === "not") {
            const parenStart = i + 1;
            if (parenStart < tokens.length && tokens[parenStart] === "(") {
                const end = findClosingBracket(tokens, parenStart, "(", ")");
                if (end === -1) {
                    result += t;
                    i++;
                    continue;
                }

                const inner = tokens.slice(parenStart + 1, end);
                const innerFormatted = formatTokens(inner, indent + 1);
                const prefix = result === "" || result.endsWith("\n") ? tabs : "";
                if (innerFormatted.includes("\n")) {
                    result += prefix + "not(\n" + innerFormatted + "\n" + tabs + ")";
                } else {
                    result += prefix + "not(" + inner.join("") + ")";
                }
                i = end + 1;
            } else {
                result += t;
                i++;
            }
        } else if (t === "(") {
            const end = findClosingBracket(tokens, i, "(", ")");
            if (end === -1) {
                result += t;
                i++;
                continue;
            }
            const inner = tokens.slice(i + 1, end);
            const prevToken = i > 0 ? tokens[i - 1] : "";
            const isFunction =
                /^[\w.\-]+$/.test(prevToken) && prevToken !== "and" && prevToken !== "or";

            if (isFunction) {
                result += "(" + formatTokens(inner, indent + 1).trim() + ")";
            } else if (isComplex(tokens, i, "(", ")")) {
                result += "(\n" + formatTokens(inner, indent + 1) + "\n" + tabs + ")";
            } else {
                result += "(" + formatTokens(inner, indent) + ")";
            }
            i = end + 1;
        } else if (t === "and" || t === "or") {
            result += "\n" + tabs + t + " ";
            i++;
        } else if (t === ",") {
            result += ", ";
            i++;
        } else {
            if (result === "" || result.endsWith("\n")) {
                result += tabs + t;
            } else {
                result += t;
            }
            i++;
        }
    }

    return result;
}

function formatXPath(xpath: string): string {
    const tokens = tokenize(xpath);
    return formatTokens(tokens, 0);
}
