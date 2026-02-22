import * as vscode from "vscode";

const objectIdMap: Record<string, string> = {
    "1": "Entity",
    "2": "License",
    "17": "Address",
};

const objectPkMap: Record<string, string> = {};

export class XPathHoverProvider implements vscode.HoverProvider {
    provideHover(document: vscode.TextDocument, position: vscode.Position): vscode.Hover | null {
        const range = document.getWordRangeAtPosition(position, /\d+/);
        if (!range) return null;

        const number = document.getText(range);
        const lineText = document.lineAt(position.line).text;
        const beforeNumber = lineText.substring(0, range.start.character);

        const lines: string[] = [];

        if (/@ObjectID\s*=\s*$/.test(beforeNumber) && objectIdMap[number]) {
            lines.push(`**ObjectID ${number}:** ${objectIdMap[number]}`);
        }

        if (/@ObjectPK\s*=\s*$/.test(beforeNumber) && objectPkMap[number]) {
            lines.push(`**ObjectPK ${number}:** ${objectPkMap[number]}`);
        }

        if (/@ActionTypeID\s*=\s*$/.test(beforeNumber)) {
            const actionTypes: Record<string, string> = {
                "1": "Append",
                "2": "Update",
                "3": "Delete",
            };
            if (actionTypes[number]) {
                lines.push(`**ActionTypeID ${number}:** ${actionTypes[number]}`);
            }
        }

        if (lines.length === 0) return null;
        return new vscode.Hover(new vscode.MarkdownString(lines.join("\n\n")));
    }
}
