import * as vscode from "vscode";

export function minify(): void {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showWarningMessage("No active editor found.");
        return;
    }

    const document = editor.document;
    const text = document.getText().trim();

    if (!text) {
        vscode.window.showWarningMessage("Document is empty.");
        return;
    }

    const minified = text
        .replace(/\s+/g, " ")
        .replace(/\s*\[\s*/g, "[")
        .replace(/\s*\]\s*/g, "]")
        .replace(/\s*\(\s*/g, "(")
        .replace(/\s*\)\s*/g, ")")
        .replace(/\s*=\s*/g, "=")
        .replace(/\s*!=\s*/g, "!=")
        .replace(/\s*<=\s*/g, "<=")
        .replace(/\s*>=\s*/g, ">=")
        .replace(/\s*<\s*/g, "<")
        .replace(/\s*>\s*/g, ">")
        .replace(/\s*\/\s*/g, "/")
        .replace(/(?<! )\b(and|or)\b/g, " $1")
        .replace(/\b(and|or)\b(?! )/g, "$1 ")
        .trim();

    vscode.env.clipboard.writeText(minified).then(() => {
        vscode.window.showInformationMessage("Minified XPath copied to clipboard.");
    });
}
