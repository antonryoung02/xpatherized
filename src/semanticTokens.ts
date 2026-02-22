import * as vscode from "vscode";

const tokenTypes = [
    "keyword", // and, or
    "function", // not
    "operator", // = != <= >= < >
    "string", // "..." '...'
    "variable", // @attributes
    "number", // numeric values
    "class", // element names, path separators, ., *
    "punctuation", // [ ] ( )
];

export const legend = new vscode.SemanticTokensLegend(tokenTypes);

function classifyToken(token: string): number {
    if (token === "and" || token === "or") return 0;
    if (token === "not") return 1;
    if (/^(=|!=|<=|>=|<|>)$/.test(token)) return 2;
    if (/^["']/.test(token)) return 3;
    if (token.startsWith("@")) return 4;
    if (/^\d+(\.\d+)?$/.test(token)) return 5;
    if (/^[[\]()]$/.test(token)) return 7;
    return 6; // property — paths, separators, element names
}

export class XPathSemanticTokensProvider implements vscode.DocumentSemanticTokensProvider {
    provideDocumentSemanticTokens(document: vscode.TextDocument): vscode.SemanticTokens {
        const builder = new vscode.SemanticTokensBuilder(legend);
        const text = document.getText();
        const regex =
            /(not(?=\s*\()|\[|\]|\(|\)|and\b|or\b|\/\/|\/|@[\w]+|\d+(?:\.\d+)?|[\w.:*]+|=|!=|<=|>=|<|>|"[^"]*"|'[^']*')/g;

        let match;
        while ((match = regex.exec(text)) !== null) {
            const pos = document.positionAt(match.index);
            const tokenType = classifyToken(match[0]);
            builder.push(pos.line, pos.character, match[0].length, tokenType);
        }

        return builder.build();
    }
}
