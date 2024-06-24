// IMPORTant IMPORTS
import * as vscode from 'vscode';
import * as https from 'https';
import axios from 'axios';

// Google API info
const API_KEY = 'AIzaSyBxYSYMNrUJZ6y7cFQOWcyUK2E_bkadBWc';  		// Google API key
const CX = '9361567b5e3fd4d90';										// Google Search Engine ID

// Pixabay API info
const PIX_API_KEY = "44556434-3fff7e0927ad4acb5f1a4eba8";

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
		if(prefix.endsWith("<img "))
		{
			let theme = GetRandomTheme();
			const slashCompletionItemImage = new vscode.InlineCompletionItem(theme);

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
			const completionItemsLorem = 
			[
				new vscode.CompletionItem("p", vscode.CompletionItemKind.Text),
				new vscode.CompletionItem("l", vscode.CompletionItemKind.Text),
				new vscode.CompletionItem("w", vscode.CompletionItemKind.Text)
			];

			return completionItemsLorem;
		}

		if(prefix.match(/^<img\s[a-zA-Z]+(?=\s*$)/))
		{
			const completionItemsImageSize =
			[
				new vscode.CompletionItem("icon", vscode.CompletionItemKind.Text),
				new vscode.CompletionItem("small", vscode.CompletionItemKind.Text),
				new vscode.CompletionItem("medium", vscode.CompletionItemKind.Text),
				new vscode.CompletionItem("large", vscode.CompletionItemKind.Text),
				new vscode.CompletionItem("xlarge", vscode.CompletionItemKind.Text),
				new vscode.CompletionItem("xxlarge", vscode.CompletionItemKind.Text),
				new vscode.CompletionItem("huge", vscode.CompletionItemKind.Text)
			];

			return completionItemsImageSize;
		}

		if(prefix.match(/^<img\s[a-zA-Z]+\s(icon|small|medium|large|xlarge|xxlarge|huge)\s$/))
		{
			const completionItemsImageColor = 
			[
				new vscode.CompletionItem("color", vscode.CompletionItemKind.Text),
				new vscode.CompletionItem("gray", vscode.CompletionItemKind.Text),
				new vscode.CompletionItem("mono", vscode.CompletionItemKind.Text),
				new vscode.CompletionItem("trans", vscode.CompletionItemKind.Text)
			];

			return completionItemsImageColor;
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
			const imagePattern = /\<img\s([a-zA-Z0-9]+)\s([a-zA-Z]+)\s([a-zA-Z]+)/g;

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

			// replacing with lorem ipsum and disposing decoration after that replacement
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

			// replacing with complete image tag: HELLA WORK LEFT HERE!!!
			if((event.contentChanges[0].text === "\n" || event.contentChanges[0].text === "\r\n") && (match = imagePattern.exec(lineText)) !== null)
			{
				while (match !== null)
				{
					let start = new vscode.Position(line.lineNumber, line.range.start.character + match.index);
					let end = new vscode.Position(line.lineNumber, line.range.start.character + match.index + match[0].length);

					console.log("matches:\n" + match[1] + "; " + match[2] + "; " + match[3]);

					let imageLink = await fetchImageUrl(match[1], match[2], match[3]);

					console.log(imageLink);

					editor.edit(editBuilder =>
						{
							editBuilder.replace(new vscode.Range(start, end), `<img src = "${imageLink}" alt = "placeholder image">`);
						});

					match = imagePattern.exec(lineText);
				}
				decoration.dispose();
			}
		}
	});
}

function GetRandomTheme()
{
	let rand = Math.round(Math.random() * 30);
	
	switch (rand)
	{
        case 0:
            return 'flowers';

        case 1:
            return 'cars';

        case 2:
            return 'buildings';

        case 3:
            return 'nature';

        case 4:
            return 'animals';

        case 5:
            return 'landscapes';

        case 6:
            return 'cityscapes';

        case 7:
            return 'people';

        case 8:
            return 'technology';

        case 9:
            return 'food';

        case 10:
            return 'sports';

        case 11:
            return 'travel';

        case 12:
            return 'space';

        case 13:
            return 'abstract';

        case 14:
            return 'music';

        case 15:
            return 'art';

        case 16:
            return 'fashion';

        case 17:
            return 'interiors';

        case 18:
            return 'health';

        case 19:
            return 'fitness';

        case 20:
            return 'wildlife';

        case 21:
            return 'ocean';

        case 22:
            return 'mountains';

        case 23:
            return 'forests';

        case 24:
            return 'deserts';

        case 25:
            return 'gardens';

        case 26:
            return 'architecture';

        case 27:
            return 'nightlife';

        case 28:
            return 'vehicles';

        case 29:
            return 'pets';

        default:
            return 'unknown';
    }
}

async function GetImageURL(query: string, orientation: string, category: string, min_width: number, min_height: number, color: string): Promise<string | null>
{
	let url = `https://pixabay.com/api/?key=${PIX_API_KEY}&q=${query}&orientation=${orientation}&category=${category}&min_width=${min_width}&min_height=${min_height}&color=${color}&image_type=photo`;

	try
	{
		let response = await axios.get(url);
		let items = response.data.items;

		if(items && items.length > 0)
		{
			return items[0].link;
		}
	}
	catch(error)
	{
		vscode.window.showErrorMessage(error as string);
		console.error("STH WENT BAD WITH API", error);
	}
	

	return null;
}

async function fetchImageUrl(query: string, resolution: string, color: string): Promise<string | null>
{
    const url = `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(query)}&cx=${CX}&searchType=image&imgSize=${resolution}&imgColorType=${color}&key=${API_KEY}`;
	console.log(url);

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
