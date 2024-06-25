"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
// IMPORTant IMPORTS
const vscode = require("vscode");
const https = require("https");
const axios_1 = require("axios");
const child_process_1 = require("child_process");
function activate(context) {
    // debug prompt
    console.log('Congratulations, your extension "htmlipsum" is now active!');
    // initializing inline completion for text commands
    const provideInlineCompletionItems = (document, position, context) => {
        // getting a whole line to check it's last characters
        let prefix = document.lineAt(position).text.substr(0, position.character);
        // return "lorem" if shalsh and not closing tag
        if (prefix.endsWith('/') && !prefix.endsWith("</")) {
            const slashCompletionItemText = new vscode.InlineCompletionItem("lorem");
            return [slashCompletionItemText];
        }
        // if one of possible options typed suggest a random number between 7 and 57
        if (prefix.endsWith("/lorem p ") || prefix.endsWith("/lorem l ") || prefix.endsWith("/lorem w ")) {
            const noPlaceholder = new vscode.InlineCompletionItem("" + Math.round(Math.random() * 57 + 7));
            return [noPlaceholder];
        }
        // if starting an image tag suggest a size 
        if (prefix.endsWith("<img ")) {
            let theme = GetRandomTheme();
            const slashCompletionItemImage = new vscode.InlineCompletionItem(theme);
            return [slashCompletionItemImage];
        }
        return [];
    };
    // declaration of language (and HTML -_-) which fit the extension 
    context.subscriptions.push(vscode.languages.registerInlineCompletionItemProvider(["html", 'php'], { provideInlineCompletionItems }));
    // initializing list completion for text command /LOREM
    const provideCompletionItems = (document, position, token, context) => {
        let prefix = document.lineAt(position).text.substr(0, position.character);
        // if "/lorem" recognized suggest p(aragraphs)/l(ists)/w(ords)
        if (prefix.endsWith("/lorem ")) {
            const completionItemsLorem = [
                new vscode.CompletionItem("p", vscode.CompletionItemKind.Text),
                new vscode.CompletionItem("l", vscode.CompletionItemKind.Text),
                new vscode.CompletionItem("w", vscode.CompletionItemKind.Text)
            ];
            return completionItemsLorem;
        }
        // if "<img [QUERY]" recognized suggest a size 
        if (prefix.match(/^<img\s\".+\"(?=\s*$)/)) {
            const completionItemsImageSize = [
                new vscode.CompletionItem("any", vscode.CompletionItemKind.Text),
                new vscode.CompletionItem("small", vscode.CompletionItemKind.Text),
                new vscode.CompletionItem("medium", vscode.CompletionItemKind.Text),
                new vscode.CompletionItem("large", vscode.CompletionItemKind.Text)
            ];
            return completionItemsImageSize;
        }
        // if "<img [QUERY] [SIZE]" recognized suggest an orientation
        if (prefix.match(/^<img\s\".+\"\s(any|small|medium|large)\s$/)) {
            const completionItemsImageOrient = [
                new vscode.CompletionItem("any", vscode.CompletionItemKind.Text),
                new vscode.CompletionItem("landscape", vscode.CompletionItemKind.Text),
                new vscode.CompletionItem("portrait", vscode.CompletionItemKind.Text),
                new vscode.CompletionItem("square", vscode.CompletionItemKind.Text),
            ];
            return completionItemsImageOrient;
        }
        // if "<img [QUERY] [SIZE] [ORIENTATION]" recognized suggest a color
        if (prefix.match(/^<img\s\".+\"\s(any|small|medium|large)\s(any|landscape|portrait|square)\s$/)) {
            const hashCharacters = "0123456789abcdef";
            let colorHash = "#";
            for (let i = 0; i <= 5; i++) {
                let random = Math.floor(Math.random() * 16);
                colorHash += hashCharacters[random];
            }
            const completionItemsImageColor = [
                new vscode.CompletionItem("any", vscode.CompletionItemKind.Text),
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
                new vscode.CompletionItem(colorHash, vscode.CompletionItemKind.Color)
            ];
            return completionItemsImageColor;
        }
        return [];
    };
    // declaration of language (and HTML -_-) which fit the extension 
    context.subscriptions.push(vscode.languages.registerCompletionItemProvider(["html", 'php'], { provideCompletionItems }, ' '));
    var match;
    // empty decoration
    var decoration = vscode.window.createTextEditorDecorationType({});
    // every single change in document triggers all this stuff *_*
    vscode.workspace.onDidChangeTextDocument(async (event) => {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            const doc = editor.document;
            const selection = editor.selection;
            let line = doc.lineAt(selection.active.line);
            let lineText = line.text;
            let character = lineText.charAt(selection.active.character);
            const loremPattern = /\/lorem\s(p|l|w)\s(\d+)/g;
            const imagePattern = /^<img\s\".+\"\s(any|small|medium|large)\s(any|landscape|portrait|square)\s.+\s$/g;
            if (character === ' ') {
                // lorem ipsum stuff below:
                while ((match = loremPattern.exec(lineText)) !== null) {
                    let start = new vscode.Position(line.lineNumber, line.range.start.character + match.index);
                    let end = new vscode.Position(line.lineNumber, line.range.start.character + match.index + match[0].length);
                    decoration = vscode.window.createTextEditorDecorationType({
                        backgroundColor: 'rgba(100, 100, 100, 0.3)',
                        borderRadius: '4px',
                        borderSpacing: '2px',
                        after: {
                            contentText: " press Enter to replace with Lorem Ipsum",
                            fontStyle: 'ilatic',
                            color: 'rgb(160, 160, 160)'
                        }
                    });
                    editor.setDecorations(decoration, [new vscode.Range(start, end)]);
                }
                // image stuff below:
                while ((match = imagePattern.exec(lineText)) !== null) {
                    let start = new vscode.Position(line.lineNumber, line.range.start.character + match.index);
                    let end = new vscode.Position(line.lineNumber, line.range.start.character + match.index + match[0].length);
                    decoration = vscode.window.createTextEditorDecorationType({
                        backgroundColor: 'rgba(100, 100, 100, 0.3)',
                        borderRadius: '4px',
                        borderSpacing: '2px',
                        after: {
                            contentText: " press Enter to replace with an image",
                            fontStyle: 'ilatic',
                            color: 'rgb(160, 160, 160)'
                        }
                    });
                    editor.setDecorations(decoration, [new vscode.Range(start, end)]);
                }
            }
            // replacing with lorem ipsum and disposing decoration after that replacement
            if ((event.contentChanges[0].text === '\n' || event.contentChanges[0].text === '\r\n') && (match = loremPattern.exec(lineText)) !== null) {
                while (match !== null) {
                    let start = new vscode.Position(line.lineNumber, line.range.start.character + match.index);
                    let end = new vscode.Position(line.lineNumber, line.range.start.character + match.index + match[0].length);
                    let loremText = await GenLorem(match[1], parseInt(match[2]));
                    editor.edit(editBuilder => {
                        editBuilder.replace(new vscode.Range(start, end), loremText);
                    });
                    match = loremPattern.exec(lineText);
                }
                decoration.dispose();
            }
            // replacing with complete image tag and disposing decoration after thet replacement
            if ((event.contentChanges[0].text === "\n" || event.contentChanges[0].text === "\r\n") && (match = imagePattern.exec(lineText)) !== null) {
                while (match !== null) {
                    let start = new vscode.Position(line.lineNumber, line.range.start.character + match.index);
                    let end = new vscode.Position(line.lineNumber, line.range.start.character + match.index + match[0].length);
                    let query = getMatchParam(match[0], 0);
                    let size = getMatchParam(match[0], 1);
                    let orient = getMatchParam(match[0], 2);
                    let color = getMatchParam(match[0], 3);
                    let imageInfos = await GetImageData(query, size, orient, color);
                    editor.edit(editBuilder => {
                        editBuilder.replace(new vscode.Range(start, end), `<img src = "${imageInfos[0]}" alt = "'${imageInfos[1]}' by ${imageInfos[2]} @ Pexels®">`);
                    });
                    match = imagePattern.exec(lineText);
                }
                decoration.dispose();
            }
        }
    });
}
exports.activate = activate;
function getMatchParam(mainPattern, stuffToGet) {
    let allParams = mainPattern.split(/\"/)[2];
    allParams = allParams.trim().trim();
    let params = allParams.split(/\s/);
    switch (stuffToGet) {
        case 0:
            return mainPattern.split(/\"/)[1];
        case 1:
            return getEnumValue(params[0], imageSize);
        case 2:
            return getEnumValue(params[1], imageOrient);
        default:
            if (params[2].includes("#") && params[2].length === 6) {
                return params[2];
            }
            else {
                return getEnumValue(params[2], imageColor);
            }
    }
}
function getEnumValue(value, object) {
    if (Object.values(object).includes(value)) {
        return value;
    }
    return "";
}
function GetRandomTheme() {
    let rand = Math.round(Math.random() * 30);
    switch (rand) {
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
async function GetImageData(query, size, orient, color) {
    let APIqueryURL = "https://api.pexels.com/v1/search";
    const key2API = GrabAPIkey();
    try {
        let response = axios_1.default.get(APIqueryURL, {
            params: {
                query: query,
                size: size,
                orientation: orient,
                color: color,
                per_page: 50
            },
            headers: {
                'Authorization': key2API
            }
        });
        let images = (await response).data.photos;
        let random = Math.round(Math.random() * (images.length - 1));
        let image = images[random];
        console.log(`all photos: ${images.length}\nrandom photo: ${random}`);
        return [image.src.original, image.alt, image.photographer];
    }
    catch (error) {
        vscode.window.showErrorMessage(error);
    }
    return [];
}
function GrabAPIkey() {
    return new Promise((resolve, reject) => {
        (0, child_process_1.exec)('../../dataPasser', (error, stdout, stderr) => {
            if (error) {
                reject(`Error: ${error.message}`);
            }
            else if (stderr) {
                reject(`Stderr: ${stderr}`);
            }
            else {
                resolve(stdout.trim());
            }
        });
    });
}
var imageSize;
(function (imageSize) {
    imageSize["Small"] = "small";
    imageSize["Medium"] = "medium";
    imageSize["Large"] = "large";
})(imageSize || (imageSize = {}));
var imageOrient;
(function (imageOrient) {
    imageOrient["Landscape"] = "landscape";
    imageOrient["Portrait"] = "portrait";
    imageOrient["Square"] = "square";
})(imageOrient || (imageOrient = {}));
var imageColor;
(function (imageColor) {
    imageColor["Red"] = "red,";
    imageColor["Orange"] = "orange";
    imageColor["Yellow"] = "yellow";
    imageColor["Green"] = "green";
    imageColor["Turquoise"] = "turquoise";
    imageColor["Blue"] = "blue";
    imageColor["Violet"] = "violet";
    imageColor["Pink"] = "pink";
    imageColor["White"] = "white";
    imageColor["Gray"] = "gray";
    imageColor["Black"] = "black";
    imageColor["Brown"] = "brown";
})(imageColor || (imageColor = {}));
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