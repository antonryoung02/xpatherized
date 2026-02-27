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
    if (token === "and" || token === "or") return 0; // keyword
    if (token === "not") return 1; // function
    if (/^(=|!=|<=|>=|<|>)$/.test(token)) return 2; // operator
    if (/^["']/.test(token)) return 3; // string
    if (token.startsWith("@")) return 4; // variable
    if (/^\d+(\.\d+)?$/.test(token)) return 5; // number
    if (/^[[\]()]$/.test(token)) return 7; // punctuation
    if (token === ",") return 7; // punctuation
    if (/^[\w][\w.\-]*$/.test(token) && token.includes("-")) return 1; // function (contains-hyphen)
    return 6; // class — paths, separators, element names
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
