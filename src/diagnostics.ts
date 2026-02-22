import * as vscode from "vscode";

export function createDiagnostics(
    document: vscode.TextDocument,
    collection: vscode.DiagnosticCollection,
): void {
    if (document.languageId !== "xpath") return;

    const diagnostics: vscode.Diagnostic[] = [];
    const text = document.getText();
    const stack: { char: string; index: number }[] = [];

    const pairs: Record<string, string> = { "(": ")", "[": "]" };
    const closers: Record<string, string> = { ")": "(", "]": "[" };

    let inString = false;
    let stringChar = "";

    for (let i = 0; i < text.length; i++) {
        const ch = text[i];

        if (inString) {
            if (ch === stringChar) inString = false;
            continue;
        }

        if (ch === '"' || ch === "'") {
            inString = true;
            stringChar = ch;
            continue;
        }

        if (pairs[ch]) {
            stack.push({ char: ch, index: i });
        } else if (closers[ch]) {
            if (stack.length > 0 && stack[stack.length - 1].char === closers[ch]) {
                stack.pop();
            } else {
                const pos = document.positionAt(i);
                diagnostics.push(
                    new vscode.Diagnostic(
                        new vscode.Range(pos, pos.translate(0, 1)),
                        `Unexpected '${ch}' — no matching '${closers[ch]}'`,
                        vscode.DiagnosticSeverity.Error,
                    ),
                );
            }
        }
    }

    for (const unmatched of stack) {
        const pos = document.positionAt(unmatched.index);
        diagnostics.push(
            new vscode.Diagnostic(
                new vscode.Range(pos, pos.translate(0, 1)),
                `Unclosed '${unmatched.char}' — missing '${pairs[unmatched.char]}'`,
                vscode.DiagnosticSeverity.Error,
            ),
        );
    }

    collection.set(document.uri, diagnostics);
}
