// IMPORTant IMPORTS
import * as vscode from 'vscode';
import * as https from 'https';
import * as path from 'path';
import axios from 'axios';

// global key to API
var key2API: string;

// function to async setting API key;
async function SetAPIkey()
{
	key2API = (await GrabAPIkey()).toString();
}

// on start of extension
export function activate(context: vscode.ExtensionContext)
{
	// setting API key once
	SetAPIkey();

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

			completionItemsLorem[0].detail = "paragraph(s)";
			completionItemsLorem[1].detail = "list(s)";
			completionItemsLorem[2].detail = "word(s)";

			return completionItemsLorem;
		}

		// if "<img [QUERY]" recognized suggest a size or an orientation
		if(prefix.match(/<img\s\".+\"(?=\s*$)/))
		{
			const completionItemsImageSizeOrient =
			[
				// any size or orientation
				new vscode.CompletionItem("any", vscode.CompletionItemKind.Enum),

				// possible sizes
				new vscode.CompletionItem("tiny", vscode.CompletionItemKind.Unit),
				new vscode.CompletionItem("small", vscode.CompletionItemKind.Unit),
				new vscode.CompletionItem("medium", vscode.CompletionItemKind.Unit),
				new vscode.CompletionItem("large", vscode.CompletionItemKind.Unit),
				new vscode.CompletionItem("xlarge", vscode.CompletionItemKind.Unit),

				// possible orientations
				new vscode.CompletionItem("landscape", vscode.CompletionItemKind.EnumMember),
				new vscode.CompletionItem("portrait", vscode.CompletionItemKind.EnumMember)
			];

			const completionItemsOrder : { [key: number]: string } = 
			{
				[vscode.CompletionItemKind.Enum] : "1",	
				[vscode.CompletionItemKind.Unit] : "2",
				[vscode.CompletionItemKind.EnumMember] : "3"
			}

			let sortIndex = 0;
			completionItemsImageSizeOrient.forEach(item =>
				{
					if(item.kind !== undefined && completionItemsOrder.hasOwnProperty(item.kind))
					{
						item.sortText = completionItemsOrder[item.kind] + sortIndex.toString();
						sortIndex++;
					}
				}
			);

			return completionItemsImageSizeOrient;
		}

		// if "<img [QUERY] [SIZE | ORIENTATION]" recognized suggest a color
		if(prefix.match(/<img\s\".+\"\s(any|tiny|small|medium|large|xlarge|landscape|portrait)\s$/))
		{
			
			let colorHash = GetRandomColor();

			const colorMap: { [key: string]: string } = {
				red: '#ff0000',
				orange: '#ffa500',
				yellow: '#ffff00',
				green: '#008000',
				turquoise: '#40e0d0',
				blue: '#0000ff',
				violet: '#ee82ee',
				pink: '#ffc0cb',
				white: '#ffffff',
				gray: '#808080',
				black: '#000000',
				brown: '#a52a2a',
				any: 'any color'
			};

			const completionItemsImageColor =
			[
				new vscode.CompletionItem('any', vscode.CompletionItemKind.Color),
				new vscode.CompletionItem('red', vscode.CompletionItemKind.Color),
				new vscode.CompletionItem('orange', vscode.CompletionItemKind.Color),
				new vscode.CompletionItem('yellow', vscode.CompletionItemKind.Color),
				new vscode.CompletionItem('green', vscode.CompletionItemKind.Color),
				new vscode.CompletionItem('turquoise', vscode.CompletionItemKind.Color),
				new vscode.CompletionItem('blue', vscode.CompletionItemKind.Color),
				new vscode.CompletionItem('violet', vscode.CompletionItemKind.Color),
				new vscode.CompletionItem('pink', vscode.CompletionItemKind.Color),
				new vscode.CompletionItem('white', vscode.CompletionItemKind.Color),
				new vscode.CompletionItem('gray', vscode.CompletionItemKind.Color),
				new vscode.CompletionItem('black', vscode.CompletionItemKind.Color),
				new vscode.CompletionItem('brown', vscode.CompletionItemKind.Color),
			];

			completionItemsImageColor.forEach(colorItem =>
				{
					colorItem.detail = GetFromColorMap(colorMap, colorItem.label.toString());
				}
			);

			completionItemsImageColor.push(new vscode.CompletionItem(colorHash, vscode.CompletionItemKind.Color));

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

	// global variable to store patterns recognition
	var match;
	
	// empty global decoration
	var decoration = vscode.window.createTextEditorDecorationType({});

	// every single change in document triggers all this stuff *_*
	vscode.workspace.onDidChangeTextDocument(async event =>
	{
		const editor = vscode.window.activeTextEditor;

		if(editor)
		{
			const doc = editor.document;
			const selection = editor.selection;

			const line = doc.lineAt(selection.active.line);
			const lineText = line.text;
			const character = lineText.charAt(selection.active.character);

			const loremPattern = /\/lorem\s(p|l|w)\s(\d+)/g;
			const imagePattern = /<img\s\".+\"\s(any|tiny|small|medium|large|xlarge|landscape|portrait)\s.+\s/g;

			if(character === ' ')
			{
				// lorem ipsum stuff below:
				while ((match = loremPattern.exec(lineText)) !== null) 
				{
					let start = new vscode.Position(line.lineNumber, line.range.start.character + match.index);
					let end = new vscode.Position(line.lineNumber, line.range.start.character + match.index + match[0].length);

					decoration = SetDecorationProperties(true);
				
					editor.setDecorations(decoration, [new vscode.Range(start, end)]);
				}

				// image stuff below:
				while ((match = imagePattern.exec(lineText)) !== null)
				{
					let start = new vscode.Position(line.lineNumber, line.range.start.character + match.index);
					let end = new vscode.Position(line.lineNumber, line.range.start.character + match.index + match[0].length);

					decoration = SetDecorationProperties(false);

						editor.setDecorations(decoration, [new vscode.Range(start, end)]);
				}
			}

			const loremMatch = ((match = loremPattern.exec(lineText)) !== null);

			// replacing with lorem ipsum and disposing decoration after that replacement
			if((event.contentChanges[0].text.startsWith('\n') || event.contentChanges[0].text.startsWith('\r\n')) && loremMatch)
			{
				while (match !== null) 
				{
					let start = new vscode.Position(line.lineNumber, line.range.start.character + match.index);
					let end = new vscode.Position(line.lineNumber, line.range.start.character + match.index + match[0].length);
				
					let loremText = await GenLorem(match[1], parseInt(match[2]));
				
					editor.edit(editBuilder => 
						{
							editBuilder.replace(new vscode.Range(start, end), loremText);
						}
					);

					match = loremPattern.exec(lineText);
				}
				decoration.dispose();
			}

			const imageMatch = (match = imagePattern.exec(lineText)) !== null;

			// replacing with complete image tag and disposing decoration after thet replacement
			if((event.contentChanges[0].text.startsWith('\n') || event.contentChanges[0].text.startsWith('\r\n')) && imageMatch)
			{
				while (match !== null)
				{
					let start = new vscode.Position(line.lineNumber, line.range.start.character + match.index);
					let end = new vscode.Position(line.lineNumber, line.range.start.character + match.index + match[0].length);

					let query = GetMatchParam(match[0], 0);
					let sizeOrOrient = GetMatchParam(match[0], 1);
					let color = GetMatchParam(match[0], 2);

					let imageInfos = await GetImageData(query, sizeOrOrient, color);

					editor.edit(editBuilder =>
						{
							editBuilder.replace(new vscode.Range(start, end), `<img src = "${imageInfos[0]}" alt = "'${imageInfos[1]}' by ${imageInfos[2]} @ Pexels®">`);
						}
					);
					
					match = imagePattern.exec(lineText);
				}
				decoration.dispose();
			}

			// dispose decoration if pattern not accepted by Enter
			// if last change is not ' ' nor '\n' nor '\r\n' and any pattern exists dispose the decoration
			// actually doesn't work
			if(!(event.contentChanges[0].text.startsWith(' ') || event.contentChanges[0].text.startsWith('\n') || event.contentChanges[0].text.startsWith('\r\n')) && (imageMatch || loremMatch))
			{
				decoration.dispose();
			}
		}
	});
}

function SetDecorationProperties(isLorem: boolean): vscode.TextEditorDecorationType
{
	let decoration: vscode.TextEditorDecorationType;

	if(isLorem)
	{
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
	}
	else
	{
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
	}

	return decoration;
}

// random color hex code generation
function GetRandomColor(): string
{
	const hashCharacters = "0123456789abcdef";
	let randomColor = "#";

	for(let i = 0; i <= 5; i++)
	{
		let random = Math.floor(Math.random() * 16);
		randomColor += hashCharacters[random];
	}


	return randomColor;
}

// get a color hex value by label from color map
function GetFromColorMap(object: {[key: string] : string}, label: string): string
{
	let value = "";

	for(const [key, hashColor] of Object.entries(object))
	{
		if(label.toLocaleLowerCase() === key.toLocaleLowerCase())
		{
			value = hashColor;
		}
	}

	return value;
}

// get single options out of recognized pattern
function GetMatchParam(mainPattern: string, stuffToGet: number): string
{
	let allParams = mainPattern.split(/\"/)[2];
	allParams = allParams.trim().trim();
	let params = allParams.split(/\s/);

	switch(stuffToGet)
	{
		case 0:
			return mainPattern.split(/\"/)[1];

		case 1:	
			if(getEnumValue(params[0], imageSize) !== "")
			{
				if(getEnumValue(params[0], imageSize) === "xlarge")
					{
						return "large2x";
					}
				return getEnumValue(params[0], imageSize);
			}
			else if(getEnumValue(params[0], imageOrient) !== "")
			{
				return getEnumValue(params[0], imageOrient);
			}
			else
			{
				return "";
			}

		default:
			if(params[1].includes("#") && params[1].length === 7)
			{
				return params[1];
			}
			else
			{
				return getEnumValue(params[1], imageColor);
			}	
	}
}

// get value of enum based on a key
function getEnumValue(value: string, object: any): string
{
	if(Object.values(object).includes(value))
	{
		return value;
	}

	return "";
}

// get random query suggestion
function GetRandomTheme()
{
	let rand = Math.round(Math.random() * 30);
	
	switch (rand)
	{
        case 0:
            return '"flowers"';

        case 1:
            return '"cars"';

        case 2:
            return '"buildings"';

        case 3:
            return '"nature"';

        case 4:
            return '"animals"';

        case 5:
            return '"landscapes"';

        case 6:
            return '"cityscapes"';

        case 7:
            return '"people"';

        case 8:
            return '"technology"';

        case 9:
            return '"food"';

        case 10:
            return '"sports"';

        case 11:
            return '"travel"';

        case 12:
            return '"space"';

        case 13:
            return '"abstract"';

        case 14:
            return '"music"';

        case 15:
            return '"art"';

        case 16:
            return '"fashion"';

        case 17:
            return '"interiors"';

        case 18:
            return '"health"';

        case 19:
            return '"fitness"';

        case 20:
            return '"wildlife"';

        case 21:
            return '"ocean"';

        case 22:
            return '"mountains"';

        case 23:
            return '"forests"';

        case 24:
            return '"deserts"';

        case 25:
            return '"gardens"';

        case 26:
            return '"architecture"';

        case 27:
            return '"nightlife"';

        case 28:
            return '"vehicles"';

        case 29:
            return '"pets"';

        default:
            return 'unknown';
    }
}

// send API request specified with query, size, orientation and color
// request authorized by key2API 
async function GetImageData(query: string, sizeOrOrient: string, color: string): Promise<string[]>
{
	let APIqueryURL = "https://api.pexels.com/v1/search";
	try
	{
		let imageData: Array<string> = [];
		let response;

		if(sizeOrOrient === "landscape" || sizeOrOrient === "portrait" || sizeOrOrient === "square")
		{
			response = axios.get<PexelsAPI>(APIqueryURL, {
				params:
				{
					query: query,
					orientation: sizeOrOrient,
					color: color,
					per_page: 50 
				},
				headers:
				{
					'Authorization': key2API
				}
			});
		}
		else
		{
			response = axios.get<PexelsAPI>(APIqueryURL, {
				params:
				{
					query: query,
					orientation: sizeOrOrient,
					color: color,
					per_page: 50 
				},
				headers:
				{
					'Authorization': key2API
				}
			});
		}

		let images = (await response).data.photos;

		let random = Math.round(Math.random() * (images.length - 1));
		let image = images[random];

		switch(sizeOrOrient)
		{
			case 'tiny':
				imageData.push(image.src.tiny, image.alt, image.photographer);
				break;

			case 'small':
				imageData.push(image.src.small, image.alt, image.photographer);
				break;

			case 'medium':
				imageData.push(image.src.medium, image.alt, image.photographer);
				break;
			
			case 'large':
				imageData.push(image.src.large, image.alt, image.photographer);
				break;

			case 'xlarge':
				imageData.push(image.src.large2x, image.alt, image.photographer);
				break;

			case 'landscape':
				imageData.push(image.src.landscape, image.alt, image.photographer);
				break;

			case 'portriat':
				imageData.push(image.src.portrait, image.alt, image.photographer);
				break;

			case 'square':
				imageData.push(image.src.original, image.alt, image.photographer);
				break;

			default:
				return [image.src.original, image.alt, image.photographer];
		}

		return imageData;
		
	}
	catch(error)
	{
		vscode.window.showErrorMessage("Image replacement failed.\nTry less specified query.");
	}

	return [];
}

// run C++ addon to get API key from configuration file
async function GrabAPIkey(): Promise<string>
{
	const addonPath = path.resolve(__dirname, "../", '../', 'decryption addon', 'build', 'Release', 'addon.node');
	const addon = require(addonPath);
	try
	{
		const configFilePath = path.resolve(__dirname, "../", "../", "placeholder.conf");
		const key2API = addon.readAPIKey(configFilePath);
		return key2API;
	}
	catch(error)
	{
		throw error;
	}
}

// possible image sizes
enum imageSize
{
	Tiny = "tiny",
	Small = "small",
	Medium = "medium",
	Large = "large",
	Xlarge = "xlarge"
}

// possible image orientations
enum imageOrient
{
	Landscape = "landscape",
	Portrait = "portrait",
}

// possible image colors
enum imageColor
{
	Red = "red,",
	Orange = "orange",
	Yellow = "yellow",
	Green = "green",
	Turquoise = "turquoise",
	Blue = "blue",
	Violet = "violet",
	Pink = "pink",
	White = "white",
	Gray = "gray",
	Black = "black",
	Brown = "brown"
}

// interface to handle sources of photos
// provided by Pexels®
interface PexelsPhotoSource
{
	original: string;
    large2x: string;
    large: string;
    medium: string;
    small: string;
    portrait: string;
    landscape: string;
    tiny: string;
}

// interface to handle photos arrtibutes
// provided by Pexels®
interface PexelsPhoto
{
	id: number;
	width: number;
	height: number;
	url: string;
	photographer: string;
	photographer_url: string;
	photographer_id: number;
	avg_color: string;
	src: PexelsPhotoSource;
	liked: boolean;
	alt: string;
}

// interface to handle Pexels® API responses
interface PexelsAPI
{
	total_results: number;
	page: number;
	per_page: number;
	photos: PexelsPhoto[];
	next_page: string;
}

// interface to handle Lorem API responses
interface LoremApiResponse
{
    feed:
	{
        lipsum: string;
    };
}

// Lorem Ipsum generation based on type and number
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

// Removing API key from memory on extension exit
export function deactivate()
{
	key2API = "c4nn07r34d17N0W";
}