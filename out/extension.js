"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
const https = require("https");
// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
function activate(context) {
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "htmlipsum" is now active!');
    let disposable = vscode.commands.registerCommand('htmlipsum.debugEnter', async (event) => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return;
        }
        const doc = editor.document;
        editor?.edit(editBuilder => {
            editBuilder.insert(new vscode.Position(editor.selection.active.line, editor.selection.active.character), "\n");
        });
        //console.log("current line: " + editor?.selection.active.line + "\nline a character after: " + doc.positionAt(event.contentChanges[0].range.start.character + 1) + "\n");
    });
    context.subscriptions.push(disposable);
    /*

    let loremipsum = vscode.workspace.onDidChangeTextDocument(event =>
        {
            const editor = vscode.window.activeTextEditor;

            if(!editor)
            {
                return;
            }

            const doc = event.document;
            const text = doc.getText();

            const pattern = /\/lorem\s(p|l|w)\s(\d+)/g;
            let match;

            while((match = pattern.exec(text)) !== null)
            {
                const type = match[1];
                const number = parseInt(match[2]);


                const start = doc.positionAt(match.index);
                const end = doc.positionAt(match.index + match[0].length);
                console.log("end: " + match.index + match[0].length);
                const range = new vscode.Range(start, end);

                GenLorem(type, number).then(loremText =>
                    {
                        editor.edit(editBuilder =>
                            {
                                editBuilder.replace(range, loremText);
                            });
                    }).catch(error =>
                        {
                            vscode.window.showErrorMessage('Error: '+ error.message +'.');
                        });
            }
        });

        context.subscriptions.push(loremipsum);

        */
    const provideInlineCompletionItems = (document, position, context) => {
        let prefix = document.lineAt(position).text.substr(0, position.character);
        if (prefix.endsWith('/') && !prefix.endsWith("</")) {
            const slashCompletionItem = new vscode.InlineCompletionItem("lorem");
            return [slashCompletionItem];
        }
        if (prefix.endsWith("/lorem p ") || prefix.endsWith("/lorem l ") || prefix.endsWith("/lorem w ")) {
            const noPlaceholder = new vscode.InlineCompletionItem("" + Math.round(Math.random() * 21));
            return [noPlaceholder];
        }
        return [];
    };
    context.subscriptions.push(vscode.languages.registerInlineCompletionItemProvider(["html", 'php'], { provideInlineCompletionItems }));
    const provideCompletionItems = (document, position, token, context) => {
        let prefix = document.lineAt(position).text.substr(0, position.character);
        if (prefix.endsWith("/lorem ")) {
            const completionItems = [
                new vscode.CompletionItem("p", vscode.CompletionItemKind.Text),
                new vscode.CompletionItem("l", vscode.CompletionItemKind.Text),
                new vscode.CompletionItem("w", vscode.CompletionItemKind.Text)
            ];
            return completionItems;
        }
        return [];
    };
    context.subscriptions.push(vscode.languages.registerCompletionItemProvider(["html", 'php'], { provideCompletionItems }, ' '));
    vscode.window.onDidChangeTextEditorSelection(async (event) => {
        const editor = vscode.window.activeTextEditor;
        if (editor && event.kind === 1) {
            const doc = editor.document;
            const selection = editor.selection;
            let line = doc.lineAt(selection.active.line);
            let lineText = line.text;
            let character = lineText.charAt(selection.active.character - 1);
            if (character === ' ') {
                const pattern = /\/lorem\s(p|l|w)\s(\d+)/g;
                let match;
                if ((match = pattern.exec(lineText)) !== null) {
                    let lineNo = line.lineNumber;
                    let type = match[1];
                    let number = parseInt(match[2]);
                    let loremText = await GenLorem(type, number);
                    let start = doc.positionAt(match.index);
                    let end = doc.positionAt(selection.active.character - 1);
                    const decoration = vscode.window.createTextEditorDecorationType({
                        backgroundColor: 'rgba(100, 100, 100, 0.3)',
                        borderRadius: '4px',
                        borderSpacing: '2px',
                        after: {
                            contentText: " press Enter to replace with  Lorem Ipsum",
                            fontStyle: 'ilatic',
                            color: 'rgb(160, 160, 160)'
                        }
                    });
                    editor.setDecorations(decoration, [new vscode.Range(start, end)]);
                    console.log(lineNo + '\n');
                    if (lineNo - 1 >= 0)
                        console.log(doc.lineAt(lineNo - 1).text + ' : ' + doc.lineAt(lineNo - 1).text.endsWith('\n '));
                    if (lineNo - 1 >= 0 && doc.lineAt(lineNo - 1).text.endsWith('\n')) {
                        console.log('enter pressed');
                        editor.edit(editBuilder => {
                            editBuilder.replace(new vscode.Range(start, end), loremText);
                        });
                    }
                    //	decoration.dispose(); // Dispose the decoration after replacement
                }
            }
        }
    });
}
exports.activate = activate;
async function GenLorem(type, number) {
    let url = `https://lipsum.com/feed/json?amount=${number}&what=`;
    switch (type) {
        case 'p':
            url += 'paragraphs';
            break;
        case 'l':
            url += 'lists';
            break;
        case 'w':
            url += 'words';
            break;
        default:
            url += 'words';
            break;
    }
    return new Promise((resolve, reject) => {
        https.get(url, (response) => {
            let data = '';
            response.on('data', (chunk) => {
                data += chunk;
            });
            response.on('end', () => {
                try {
                    const jsonData = JSON.parse(data);
                    if (jsonData && jsonData.feed && jsonData.feed.lipsum) {
                        resolve(jsonData.feed.lipsum);
                    }
                    else {
                        reject(new Error('Failed to generate Lorem Ipsum'));
                    }
                }
                catch (error) {
                    reject(error);
                }
            });
        }).on('error', (error) => {
            reject(error);
        });
    });
}
// This method is called when your extension is deactivated
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map