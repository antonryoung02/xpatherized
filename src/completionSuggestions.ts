import * as vscode from "vscode";

export function provideCompletionSuggestions() {
    const items: vscode.CompletionItem[] = [];

    const functions = [
        "boolean",
        "ceiling",
        "concat",
        "contains",
        "count",
        "false",
        "floor",
        "id",
        "lang",
        "last",
        "local-name",
        "name",
        "namespace-uri",
        "normalize-space",
        "not",
        "number",
        "position",
        "round",
        "starts-with",
        "string",
        "string-length",
        "substring",
        "substring-after",
        "substring-before",
        "sum",
        "translate",
        "true",
    ];

    for (const fn of functions) {
        const item = new vscode.CompletionItem(fn, vscode.CompletionItemKind.Function);
        item.insertText = new vscode.SnippetString(`${fn}($1)`);
        items.push(item);
    }

    return items;
}
