import * as vscode from "vscode";

const objectIdMap: Record<string, string> = {
    1: "Entity",
    2: "License",
    3: "Project",
    7: "Correspondence",
    10: "Exam",
    11: "Association",
    13: "Task",
    14: "History",
    15: "WorkAssignment",
    16: "WorkTime",
    17: "Address",
    18: "Invoice",
    19: "EntityName",
    20: "ExamSitting",
    22: "Document",
    23: "Payment",
    24: "Incoming",
    25: "KPI",
    31: "Appointment",
    33: "Allegation",
    34: "Command",
    35: "ObjectPropertyValue",
    37: "ObjectProperty",
    38: "ObjectType",
    39: "Report",
    40: "Query",
    41: "Web",
    42: "WebResource",
    43: "Topic",
    44: "BusinessProcess",
    47: "ProjectRequirement",
    48: "ProcessStep",
    49: "MetaAssociation",
};

export class XPathHoverProvider implements vscode.HoverProvider {
    provideHover(document: vscode.TextDocument, position: vscode.Position): vscode.Hover | null {
        const range = document.getWordRangeAtPosition(position, /\d+/);
        if (!range) {
            return null;
        }

        const number = document.getText(range);
        const lineText = document.lineAt(position.line).text;
        const beforeNumber = lineText.substring(0, range.start.character);

        const lines: string[] = [];

        if (/@ObjectID\s*=\s*$/.test(beforeNumber) && objectIdMap[number]) {
            lines.push(`**ObjectID ${number}:** ${objectIdMap[number]}`);
        }

        if (lines.length === 0) {
            return null;
        }
        return new vscode.Hover(new vscode.MarkdownString(lines.join("\n\n")));
    }
}
