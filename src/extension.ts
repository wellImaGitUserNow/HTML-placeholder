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

		// if "<img [QUERY] [ORIENTATION] [CATEGORY]" recognized suggest a minimal width
		if(prefix.match(/^<img\s\".+\"\s(horizontal|vertical|all)\s[a-zA-Z]+\s$/))
		{
			let rand = Math.round(Math.random() * 5000 + 50);
			const imageMinWidth = new vscode.InlineCompletionItem(rand.toString());

			return [imageMinWidth];
		}

		// if "<img [QUERY] [ORIENTATION] [CATEGORY] [MIN_WIDTH]" recognized suggest a minimal height
		if(prefix.match(/^<img\s\".+\"\s(horizontal|vertical|all)\s[a-zA-Z]+\s\d+\s$/))
		{
			let rand = Math.round(Math.random() * 5000 + 50);
			const imageMinHeight = new vscode.InlineCompletionItem(rand.toString());

			return [imageMinHeight];
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

		// if "<img [QUERY]" recognized suggest an orientation 
		if(prefix.match(/^<img\s\".+\"(?=\s*$)/))
		{
			const completionItemsImageOrient =
			[
				new vscode.CompletionItem("horizontal", vscode.CompletionItemKind.Text),
				new vscode.CompletionItem("vertical", vscode.CompletionItemKind.Text),
				new vscode.CompletionItem("all", vscode.CompletionItemKind.Text)
			];

			return completionItemsImageOrient;
		}

		// if "<img [QUERY] [ORIENTATION]" recognized suggest a category
		if(prefix.match(/^<img\s\".+\"\s(horizontal|vertical|all)\s$/))
		{
			const completionItemsImageCat = 
			[
				new vscode.CompletionItem('backgrounds', vscode.CompletionItemKind.Text),
  			  	new vscode.CompletionItem('fashion', vscode.CompletionItemKind.Text),
    			new vscode.CompletionItem('nature', vscode.CompletionItemKind.Text),
    			new vscode.CompletionItem('science', vscode.CompletionItemKind.Text),
    			new vscode.CompletionItem('education', vscode.CompletionItemKind.Text),
    			new vscode.CompletionItem('feelings', vscode.CompletionItemKind.Text),
    			new vscode.CompletionItem('health', vscode.CompletionItemKind.Text),
    			new vscode.CompletionItem('people', vscode.CompletionItemKind.Text),
    			new vscode.CompletionItem('religion', vscode.CompletionItemKind.Text),
    			new vscode.CompletionItem('places', vscode.CompletionItemKind.Text),
    			new vscode.CompletionItem('animals', vscode.CompletionItemKind.Text),
    			new vscode.CompletionItem('industry', vscode.CompletionItemKind.Text),
    			new vscode.CompletionItem('computer', vscode.CompletionItemKind.Text),
    			new vscode.CompletionItem('food', vscode.CompletionItemKind.Text),
    			new vscode.CompletionItem('sports', vscode.CompletionItemKind.Text),
    			new vscode.CompletionItem('transportation', vscode.CompletionItemKind.Text),
    			new vscode.CompletionItem('travel', vscode.CompletionItemKind.Text),
    			new vscode.CompletionItem('buildings', vscode.CompletionItemKind.Text),
    			new vscode.CompletionItem('business', vscode.CompletionItemKind.Text),
    			new vscode.CompletionItem('music', vscode.CompletionItemKind.Text)
			];

			return completionItemsImageCat;
		}

		// if "<img [QUERY] [ORIENTATION] [CATEGORY] [MIN_WIDTH] [MIN_HEIGHT]" recognized suggest a color
		if(prefix.match(/^<img\s\".+\"\s(horizontal|vertical|all)\s[a-zA-Z]+\s\d+\s\d+\s$/))
		{
			const completionItemsImageColor =
			[
				new vscode.CompletionItem('grayscale', vscode.CompletionItemKind.Text),
				new vscode.CompletionItem('transparent', vscode.CompletionItemKind.Text),
				new vscode.CompletionItem('red', vscode.CompletionItemKind.Text),
				new vscode.CompletionItem('orange', vscode.CompletionItemKind.Text),
				new vscode.CompletionItem('yellow', vscode.CompletionItemKind.Text),
				new vscode.CompletionItem('green', vscode.CompletionItemKind.Text),
				new vscode.CompletionItem('turquoise', vscode.CompletionItemKind.Text),
				new vscode.CompletionItem('blue', vscode.CompletionItemKind.Text),
				new vscode.CompletionItem('lilac', vscode.CompletionItemKind.Text),
				new vscode.CompletionItem('pink', vscode.CompletionItemKind.Text),
				new vscode.CompletionItem('white', vscode.CompletionItemKind.Text),
				new vscode.CompletionItem('gray', vscode.CompletionItemKind.Text),
				new vscode.CompletionItem('black', vscode.CompletionItemKind.Text),
				new vscode.CompletionItem('brown', vscode.CompletionItemKind.Text)
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
			const imagePattern = /^<img\s\".+\"\s(horizontal|vertical|all)\s[a-zA-Z]+\s\d+\s\d+\s[a-zA-Z]+\s$/g;

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

					let query = getMatchParam(match[0], 1);
					let orientation = getMatchParam(match[0], 2);
					let category = getMatchParam(match[0], 3);
					let minWidth = parseInt(getMatchParam(match[0], 4));
					let minHeight = parseInt(getMatchParam(match[0], 5));
					let color = getMatchParam(match[0], 6);

					let imageInfos = await GetImageURL(query, orientation, category, minWidth, minHeight, color);

					console.log(imageInfos);

					editor.edit(editBuilder =>
						{
							editBuilder.replace(new vscode.Range(start, end), `<img src = "${imageInfos[0]}" alt = "placeholder image by ${imageInfos[1]}">`);
						});

					match = imagePattern.exec(lineText);
				}
				decoration.dispose();
			}
		}
	});
}

function getMatchParam(mainPattern: string, stuffToGet: number)
{
	if(stuffToGet === 1)
	{
		return mainPattern.split(/\"/)[1];
	}
	else
	{
		let allParams = mainPattern.split(/\"/)[2];
		let params = allParams.split(/\s/);
		
		return params[stuffToGet - 1];
	}
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

async function GetImageURL(query: string, orientation: string, category: string, min_width: number, min_height: number, color: string): Promise<string[]>
{
	let url = `https://pixabay.com/api/?key=${PIX_API_KEY}&q=${encodeURIComponent(query)}&orientation=${orientation}&category=${category}&min_width=${min_width}&min_height=${min_height}&color=${color}&safesearch=true&image_type=photo`;

	try
	{
		let response = await axios.get<PixabayApiResponse>(url);
		let data = response.data;

		let rand = Math.round(Math.random() * (data.totalHits - 1));

		console.log(data.hits[0]);

		let feedback = [data.hits[0].imageURL, data.hits[0].user];

		return feedback;
	}
	catch(error)
	{
		vscode.window.showErrorMessage(error as string);
		console.error("STH WENT BAD WITH API", error);
	}
	
	return [];
}

/*
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
*/

interface PixabayApiResponseHit
{
	id: number;
    pageURL: string;
    type: string;
    tags: string;
    previewURL: string;
    previewWidth: number;
    previewHeight: number;
    webformatURL: string;
    webformatWidth: number;
    webformatHeight: number;
    largeImageURL: string;
    fullHDURL: string;
    imageURL: string;
    imageWidth: number;
    imageHeight: number;
    imageSize: number;
    views: number;
    downloads: number;
    likes: number;
    comments: number;
    user_id: number;
    user: string;
    userImageURL: string;
}

interface PixabayApiResponse
{
	total: number;
	totalHits: number;
	hits: PixabayApiResponseHit[];
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
