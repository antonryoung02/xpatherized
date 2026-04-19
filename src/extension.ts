import * as vscode from "vscode";
import { format } from "./format";
import { minify } from "./minify";
import { XPathSemanticTokensProvider, legend } from "./semanticTokens";
import { XPathHoverProvider } from "./hover";
import { createDiagnostics } from "./diagnostics";
import { provideCompletionSuggestions } from "./completionSuggestions";

export function activate(context: vscode.ExtensionContext) {
    const diagnosticCollection = vscode.languages.createDiagnosticCollection("xpath");
    context.subscriptions.push(diagnosticCollection);

    // Run on open and on change
    if (vscode.window.activeTextEditor) {
        createDiagnostics(vscode.window.activeTextEditor.document, diagnosticCollection);
    }

    context.subscriptions.push(
        vscode.workspace.onDidChangeTextDocument((e) => {
            createDiagnostics(e.document, diagnosticCollection);
        }),
        vscode.workspace.onDidOpenTextDocument((doc) => {
            createDiagnostics(doc, diagnosticCollection);
        }),
        vscode.workspace.onDidCloseTextDocument((doc) => {
            diagnosticCollection.delete(doc.uri);
        }),
    );

    const formatAndSave = vscode.commands.registerCommand("xpatherized.formatAndSave", async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor || editor.document.languageId !== "xpath") {
            return;
        }
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

    vscode.languages.registerCompletionItemProvider("xpath", {
        provideCompletionItems: () => provideCompletionSuggestions(),
    });
}

export function deactivate() {}
