import * as vscode from "vscode";
import { format } from "./format";
import { minify } from "./minify";
import { XPathSemanticTokensProvider, legend } from "./semanticTokens";
import { off } from "process";
import { XPathHoverProvider } from "./hover";

export function activate(context: vscode.ExtensionContext) {
    const formatAndSave = vscode.commands.registerCommand("xpatherized.formatAndSave", async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor || editor.document.languageId !== "xpath") return;
        const edits = format(editor.document);
        if (edits.length > 0) {
            const edit = new vscode.WorkspaceEdit();
            edit.set(editor.document.uri, edits);
            await vscode.workspace.applyEdit(edit);
        }
        await editor.document.save();
    });
    context.subscriptions.push(formatAndSave);

    const minifyXpath = vscode.commands.registerCommand("xpatherized.minify", () => {
        minify();
    });
    context.subscriptions.push(minifyXpath);

    const semanticProvider = vscode.languages.registerDocumentSemanticTokensProvider(
        { language: "xpath" },
        new XPathSemanticTokensProvider(),
        legend,
    );
    context.subscriptions.push(semanticProvider);

    context.subscriptions.push(
        vscode.languages.registerHoverProvider({ language: "xpath" }, new XPathHoverProvider()),
    );
}

export function deactivate() {}
