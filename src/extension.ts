// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as https from 'https';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "htmlipsum" is now active!');

	let disposable = vscode.commands.registerCommand('htmlipsum.debugEnter',async event =>
	{
		const editor = vscode.window.activeTextEditor;

		if(!editor)
		{
			return;
		}
		const doc = editor.document;

		editor?.edit(editBuilder =>
			{
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

		const provideInlineCompletionItems = (document: vscode.TextDocument, position: vscode.Position, context: vscode.InlineCompletionContext) =>
		{
			let prefix = document.lineAt(position).text.substr(0, position.character);

			if(prefix.endsWith('/') && !prefix.endsWith("</"))
			{
				const slashCompletionItemText = new vscode.InlineCompletionItem("lorem");
				const slashCompletionItemImage = new vscode.InlineCompletionItem("image");

				return [slashCompletionItemText, slashCompletionItemImage];
			}

			if(prefix.endsWith("/lorem p ") || prefix.endsWith("/lorem l ") || prefix.endsWith("/lorem w "))
			{
				const noPlaceholder = new vscode.InlineCompletionItem("" + Math.round(Math.random() * 21));

				return [noPlaceholder];
			}

			return [];
		}

		context.subscriptions.push(vscode.languages.registerInlineCompletionItemProvider(
			["html", 'php'], 
			{provideInlineCompletionItems}
		));

		const provideCompletionItems = (document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext) =>
		{
			let prefix = document.lineAt(position).text.substr(0, position.character);		

			if(prefix.endsWith("/lorem "))
			{
				const completionItems = 
				[
					new vscode.CompletionItem("p", vscode.CompletionItemKind.Text),
					new vscode.CompletionItem("l", vscode.CompletionItemKind.Text),
					new vscode.CompletionItem("w", vscode.CompletionItemKind.Text)
				];

				return completionItems;
			}

			return [];
		}

		context.subscriptions.push(vscode.languages.registerCompletionItemProvider(
			["html", 'php'], 
			{provideCompletionItems},
			' '
		));

		const decoration = vscode.window.createTextEditorDecorationType(
			{
				backgroundColor: 'rgba(100, 100, 100, 0.3)',
				borderRadius: '4px',
				borderSpacing: '2px',

				after:
				{
					contentText: " press Enter to replace with  Lorem Ipsum",
					fontStyle: 'ilatic',
					color: 'rgb(160, 160, 160)'
				}
			});

		vscode.workspace.onDidChangeTextDocument(async event =>
			{
				const editor = vscode.window.activeTextEditor;

				if(editor)
				{
					const doc = editor.document;
					const selection = editor.selection;

					let line = doc.lineAt(selection.active.line);
					let lineText = line.text;
					let character = lineText.charAt(selection.active.character);
					const pattern = /\/lorem\s(p|l|w)\s(\d+)/g;

					console.log(character);

					if(character === ' ')
					{
						var match;

						if((match = pattern.exec(lineText)) !== null)
						{							
							let start = doc.positionAt(match.index);
							let end = doc.positionAt(selection.active.character);

							editor.setDecorations(decoration, [new vscode.Range(start, end)]);
						}
					}
					if((event.contentChanges[0].text === '\n' || event.contentChanges[0].text === '\r\n') && (match = pattern.exec(lineText)) !== null)
					{
						let start = doc.positionAt(match.index);
						let end = doc.positionAt(selection.active.character);
						let loremText = await GenLorem(match[1], parseInt(match[2]));

						editor.edit(editBuilder =>
						{
							editBuilder.replace(new vscode.Range(start, end), loremText)
						});
						
						decoration.dispose();
					}
				}
			});
}

interface LoremApiResponse {
    feed: {
        lipsum: string;
    };
}

async function GenLorem(type: string, number: number): Promise<string> {
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

    return new Promise<string>((resolve, reject) => 
	{
        https.get(url, (response) => 
		{
            let data = '';

            response.on('data', (chunk) => 
			{
                data += chunk;
            });

            response.on('end', () => 
			{
                try 
				{
                    const jsonData: LoremApiResponse = JSON.parse(data);
                    if (jsonData && jsonData.feed && jsonData.feed.lipsum) 
					{
                        resolve(jsonData.feed.lipsum);
                    } 
					else 
					{
                        reject(new Error('Failed to generate Lorem Ipsum'));
                    }
                } 
				catch (error) 
				{
                    reject(error);
                }
            });
        }).on('error', (error) => 
		{
            reject(error);
        });
    });
}

// This method is called when your extension is deactivated
export function deactivate(){}
