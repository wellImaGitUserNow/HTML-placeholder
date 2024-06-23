// IMPORTant IMPORTS
import * as vscode from 'vscode';
import * as https from 'https';
import axios from 'axios';

// Google API info
const API_KEY = 'AIzaSyBxYSYMNrUJZ6y7cFQOWcyUK2E_bkadBWc';  		// Google API key
const CX = '9361567b5e3fd4d90';										// Google Search Engine ID

export function activate(context: vscode.ExtensionContext) {

	// debug prompt
	console.log('Congratulations, your extension "htmlipsum" is now active!');

	// initializing inline completion for text commands
	const provideInlineCompletionItems = (document: vscode.TextDocument, position: vscode.Position, context: vscode.InlineCompletionContext) =>
	{
		// getting a whole line to check it's last characters
		let prefix = document.lineAt(position).text.substr(0, position.character);

		// return "lorem" if shalsh and not closing tag
		if(prefix.endsWith('/') && !prefix.endsWith("</"))
		{
			const slashCompletionItemText = new vscode.InlineCompletionItem("lorem");

			return [slashCompletionItemText];
		}

		// if one of possible options typed suggest a random number between 7 and 57
		if(prefix.endsWith("/lorem p ") || prefix.endsWith("/lorem l ") || prefix.endsWith("/lorem w "))
		{
			const noPlaceholder = new vscode.InlineCompletionItem("" + Math.round(Math.random() * 57 + 7));

			return [noPlaceholder];
		}

		// if starting an image tag suggest a size 
		if(prefix.endsWith("<img"))
		{
			let size = GetRandomSize();
			const slashCompletionItemImage = new vscode.InlineCompletionItem(size);

			return [slashCompletionItemImage];
		}

		return [];
	}

	// declaration of language (and HTML -_-) which fit the extension 
	context.subscriptions.push(vscode.languages.registerInlineCompletionItemProvider(
		["html", 'php'], 
		{provideInlineCompletionItems}
	));

	// initializing list completion for text command /LOREM
	const provideCompletionItems = (document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext) =>
	{
		let prefix = document.lineAt(position).text.substr(0, position.character);		

		// if "/lorem" recognized suggest p(aragraphs)/l(ists)/w(ords)
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

	// declaration of language (and HTML -_-) which fit the extension 
	context.subscriptions.push(vscode.languages.registerCompletionItemProvider(
		["html", 'php'], 
		{provideCompletionItems},
		' '
	));

	var match;
	
	// empty decoration
	var decoration = vscode.window.createTextEditorDecorationType(
		{

		}
	);

	// every single change in document triggers all this stuff *_*
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
			const loremPattern = /\/lorem\s(p|l|w)\s(\d+)/g;
			const imagePattern = /\<img\s([a-zA-Z0-9]+)\s(\d+)x(\d+)\s([a-zA-Z]+)/g;

			if(character === ' ')
			{
				// lorem ipsum stuff below:
				while ((match = loremPattern.exec(lineText)) !== null) 
				{
					let start = new vscode.Position(line.lineNumber, line.range.start.character + match.index);
					let end = new vscode.Position(line.lineNumber, line.range.start.character + match.index + match[0].length);

					decoration = vscode.window.createTextEditorDecorationType(
					{
						backgroundColor: 'rgba(100, 100, 100, 0.3)',
						borderRadius: '4px',
						borderSpacing: '2px',
						
						after:
						{
							contentText: " press Enter to replace with Lorem Ipsum",
							fontStyle: 'ilatic',
							color: 'rgb(160, 160, 160)'
						}
					});
				
					editor.setDecorations(decoration, [new vscode.Range(start, end)]);
				}

				// image stuff below:
				while ((match = imagePattern.exec(lineText)) !== null)
				{
					console.log("image pattern found I guess");

					let start = new vscode.Position(line.lineNumber, line.range.start.character + match.index);
					let end = new vscode.Position(line.lineNumber, line.range.start.character + match.index + match[0].length);

					decoration = vscode.window.createTextEditorDecorationType(
						{
							backgroundColor: 'rgba(100, 100, 100, 0.3)',
							borderRadius: '4px',
							borderSpacing: '2px',
							
							after:
							{
								contentText: " press Enter to replace with an image",
								fontStyle: 'ilatic',
								color: 'rgb(160, 160, 160)'
							}
						});

						editor.setDecorations(decoration, [new vscode.Range(start, end)]);
				}
			}

			if((event.contentChanges[0].text === '\n' || event.contentChanges[0].text === '\r\n') && (match = loremPattern.exec(lineText)) !== null)
			{
				while (match !== null) 
				{
					let start = new vscode.Position(line.lineNumber, line.range.start.character + match.index);
					let end = new vscode.Position(line.lineNumber, line.range.start.character + match.index + match[0].length);
				
					let loremText = await GenLorem(match[1], parseInt(match[2]));
				
					editor.edit(editBuilder => 
					{
						editBuilder.replace(new vscode.Range(start, end), loremText);
					});

					match = loremPattern.exec(lineText);
				}
				decoration.dispose();
			}
		}
	});
}

function GetRandomSize()
{
	let rand = Math.round(Math.random() * 3 + 1);
	
	switch (rand)
	{
		default:
			return "";
	}
}

async function fetchImageUrl(query: string, resolution: string, color: string): Promise<string | null>
{
    const url = `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(query)}&cx=${CX}&searchType=image&imgSize=${resolution}&imgColorType=${color}&key=${API_KEY}`;

    try {
        const response = await axios.get(url);
        const items = response.data.items;
        if (items && items.length > 0) {
            return items[0].link;
        }
        return null;
    } catch (error) {
        console.error('Error fetching image URL:', error);
        return null;
    }
}

interface LoremApiResponse
{
    feed:
	{
        lipsum: string;
    };
}

async function GenLorem(type: string, number: number): Promise<string>
{
    let url = `https://lipsum.com/feed/json?amount=${number}&what=`;

    switch (type)
	{
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
