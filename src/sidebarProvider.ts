import * as vscode from 'vscode';
import { getNonce } from './getNonce';



const command = {
       init:'stackpocket.pocket.init'
};







function getName(context:vscode.ExtensionContext){

	  let username = context?.globalState.get('username', '');

	  return username;
	  

}



export class SidebarProvider implements vscode.WebviewViewProvider {
	_view?: vscode.WebviewView;
	_doc?: vscode.TextDocument;

	constructor(private readonly _extensionUri: vscode.Uri)  {
	
		
	}

	public async resolveWebviewView(webviewView: vscode.WebviewView) {
		this._view = webviewView;

		webviewView.webview.options = {
			// Allow scripts in the webview
			enableScripts: true,
			localResourceRoots: [this._extensionUri],
		};

		
	     webviewView.webview.html = await this._getHtmlForWebview(webviewView.webview);


		

		webviewView.webview.onDidReceiveMessage(async (data) => {
			switch (data.type) {
				case 'details':{
					
					break;
				}
                case 'do': {
					vscode.commands.executeCommand(command.init);
					break;
				}
				case 'onInfo': {
					if (!data.value) {
						return;
					}
					// vscode.window.showInformationMessage(data.value);
					break;
				}
				case 'onError': {
					if (!data.value) {
						return;
					}
					// vscode.window.showErrorMessage(data.value);
					break;
				}
			}
		});
	}

	public revive(panel: vscode.WebviewView) {
		this._view = panel;
	}

	private async  _getHtmlForWebview(webview: vscode.Webview) {

   
        let username:any = await vscode.commands.executeCommand('stackpocket.pocket.getName');
        


		const styleResetUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, '/src/media', 'reset.css'));
		const styleVSCodeUri = webview.asWebviewUri(
			vscode.Uri.joinPath(this._extensionUri, '/src/media', 'vscode.css')
		);
		const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, '/src/media', 'main.js'));
		const image = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, '/src/assets', 'a.png'));

		// Use a nonce to only allow a specific script to be run.
		const nonce = getNonce();

		
        


		return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
                <meta http-equiv="Content-Security-Policy" content="" img-src https: data:; style-src 'unsafe-inline' ${webview.cspSource}; script-src 'nonce-${nonce}';">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<link href="${styleResetUri}" rel="stylesheet">
				<link href="${styleVSCodeUri}" rel="stylesheet">      
			</head>
             <body style='padding:20px;'>
                <center>
				<img src="${image}" style="height:10vh;width:10vh;"/>
                <h2><span>Stack<span style='font-weight:bold;'>Pocket</span></span></h2>
                <p>reinventing resuable codes and code sharing</p>
                </center>

			   <div class='name'>
			   ${username !== ''?username:'If you dont have an account with stackPocket visit www.stackpocket.com to register or click on the initate button to login'}
			   </div>

                <button style="" id='fetch'>Initiate</button>

			



                <script  src='${scriptUri}'></script>
			 </body>
			</html>`;
	}
}
