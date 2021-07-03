/* eslint-disable @typescript-eslint/naming-convention */

import * as vscode from "vscode";
import { SidebarProvider } from "./sidebarProvider";
import config from "./config";
import axios from "axios";

// let editor : = vscode.window.activeTextEditor;


// const text = editor.document.getText(editor.selection);


interface CommandLine<T> {
  label: T;
  detail: T;
  command: T;
  description: T;
}

const commands: CommandLine<string>[] = [
  {
    label: "Fetch",
    detail: "Fecth stacks from pocket",
    command: "stackpocket.pocket.fetch",
    description: " - all public and private stacks at your disposal",
  },
  {
    label: "LogOut",
    detail: "logout from your current account",
    command: "stackpocket.pocket.logout",
    description: " - logout",
  },
];






const initiateMenu = async () => {
  let value = await vscode.window.showQuickPick(commands);
  if (value) {
    vscode.commands.executeCommand(value.command);
  }
};





export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "stackpocket" is now active!');


  

 

  let email = context.globalState.get("email", "");
  let password = context.globalState.get("password", "");
  let username = context.globalState.get("username", "");








  const sidebarProvider = new SidebarProvider(context.extensionUri);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      "stackpocket-sidebar",
      sidebarProvider
    )
  );









  let disposable = vscode.commands.registerCommand("stackpocket.pocket.init",async () => {
      
	
	
	if (email === "" && password === "" && username === "") {
        vscode.window.showInformationMessage("If you havent sign up yet visit http://www/stackpocket.me to sign up ",
            "SignUp"
          )
          .then((selection) => {
             vscode.env.openExternal(vscode.Uri.parse('https://stackpocket.me'));
          });





        const uname = await vscode.window.showInputBox({
          prompt: "Label:",
          placeHolder: "Enter your email...",
        });




        if (uname) {
          const pass = await vscode.window.showInputBox({
            prompt: "Label:",
            placeHolder: "Enter your password #################",
          });
          if (pass) {
            Login(uname, pass, context);
          }
        }
      } else {
        console.log(email, password);
        initiateMenu();
      }
    }
  );

  let fetchData = vscode.commands.registerCommand("stackpocket.pocket.fetch",async () => {
      fetchUser(email, password);
    }
  );

  let Getname = vscode.commands.registerCommand("stackpocket.pocket.getName",async () => {
      return username;
    }
  );


  let saveCodes = vscode.commands.registerCommand("stackpocket.pocket.savecode",async () => {

	if(vscode.window.activeTextEditor === undefined || 
		vscode.window.activeTextEditor.document === undefined){
		  return;
	  }
	  let Text = vscode.window.activeTextEditor.document.getText(vscode.window.activeTextEditor.selection);


	  const Description = await vscode.window.showInputBox({
		prompt: "Label:",
		placeHolder: "Enter Label / description ... ",
	  });

	  if(Description){

		const Extension = await vscode.window.showInputBox({
			prompt: "Label:",
			placeHolder: "Enter file extension ex.(js,txt,md,py,java,html,json ,etc....)",
		  });

		  if (Extension) {
		      
			saveCode(Text,email,password,Description,Extension);
		  }

	  }
  });






  let Sendto = vscode.commands.registerCommand("stackpocket.pocket.sendto",async () => {

    if(vscode.window.activeTextEditor === undefined || 
      vscode.window.activeTextEditor.document === undefined){
        return;
      }
      let Text = vscode.window.activeTextEditor.document.getText(vscode.window.activeTextEditor.selection);
  
      
      fetchConnections(email,password,Text);



    });





  let logOut = vscode.commands.registerCommand("stackpocket.pocket.logout",async () => {

	  context.globalState.update('email','');
    context.globalState.update('password','');
    context.globalState.update('username','');

	  vscode.commands.executeCommand("workbench.action.reloadWindow");

  });

  context.subscriptions.push(disposable);
  context.subscriptions.push(fetchData);
  context.subscriptions.push(Getname);
  context.subscriptions.push(saveCodes);
  context.subscriptions.push(logOut);
  context.subscriptions.push(Sendto);


}











const fetchConnections  = (email:string,password:string,Text:string)=>{

  axios
  .post(config.URL + "/route.php?route=fetchConnections", {
    email: email,
    password: password,
  })
  .then( async function (response: any) {

    if (response.data === "" || undefined) {

      vscode.window.showErrorMessage("You currently have no connections yet");
      
    } else {


     


      let value : any = await vscode.window.showQuickPick(response.data);

        console.log(response.data);

       // function to add two numbers

      


      if (value) {

          console.log(parseInt(value.description));

           const id  = parseInt(value.description);

           const label = await vscode.window.showInputBox({
            prompt: "Label:",
            placeHolder: "Enter code label",
          });

          if (label) {
            
            const extension = await vscode.window.showInputBox({
              prompt: "Label:",
              placeHolder: "Enter file extension ex.(js,txt,md,py,java,html,json ,etc....)",
            });

            if (extension) {

              SendCodeToUser(label,id,extension,Text);
            
            }
          }

         

      }
        
    }
  })
  .catch(function (error: string) {
    // handle error
    console.log(error);
    vscode.window.showWarningMessage(
      "Oops unable to send check your connection and try again"
    );
  })
  .then(function () {
    // always executed
  });


};














const SendCodeToUser = (label:string,id:number,extension:string,codes:string) =>{


  axios
  .post(config.URL + "/route.php?route=SendCodetoUser", {
    label:label,
    extension:extension,
    id:id,
    codes:codes
  })
  .then(function (response: any) {

    console.log(response.data);
  

     if (response.data === 'done') {

      vscode.window.showInformationMessage("Code sent succefully ");

     }else{

      vscode.window.showWarningMessage("Oops could not send code to stackpocket check your connection");

     }
    
        
    
  })
  .catch(function (error: string) {
    // handle error
    console.log(error);
    vscode.window.showWarningMessage(
      "Oops unable to send code to user check your internet connection and try agin"
    );
  })
  .then(function () {
    // always executed
  });


};



const Login = (email: string,password: string,context: vscode.ExtensionContext) => {
  axios
    .post(config.URL + "/route.php?route=fetchuserDeta", {
      email: email,
      password: password,
    })
    .then(function (response: any) {
      if (response.data === "" || undefined) {
        vscode.window
          .showInformationMessage(
            "Please there is no account with this username and password ,If you havent sign up yet visit http://www/stacpocket.com to sign up ",
            "SignUp",
            "cancel"
          )
          .then((selection) => {
            console.log(selection);
          });
      } else {
        console.log(response.data);
        context.globalState.update("email", email);
        context.globalState.update("password", password);
        context.globalState.update("username", response.data);




        vscode.window
          .showInformationMessage(
            "Login Succesfull click continue to proceed ..",
            "Continue"
          )
          .then((selection) => {
            if (selection) {
              vscode.commands.executeCommand("workbench.action.reloadWindow");
            }
          });
      }
    })
    .catch(function (error: string) {
      // handle error
      console.log(error);
      vscode.window.showWarningMessage(
        "Oops unable to Login incorrect email or password"
      );
    })
    .then(function () {
      // always executed
    });
};




const fetchUser = async (email: string, password: string) => {
  axios
    .post(config.URL + "/route.php?route=GetuserDeta", {
      email: email,
      password: password,
    })
    .then(async function (response: any) {
      console.log(response.data);

      let results: any = await vscode.window.showQuickPick(response.data);

      if (results) {
        let data = results.detail;

        var setting: vscode.Uri = vscode.Uri.parse(
          "untitled:" +
            `C:pocket-${results.label}${
              results.extension.split("")[0] !== "."
                ? "." + results.extension
                : results.extension
            }`
        );
        vscode.workspace.openTextDocument(setting).then(
          (a: vscode.TextDocument) => {
            vscode.window.showTextDocument(a, 1, false).then((e) => {
              e.edit((edit) => {
                edit.insert(new vscode.Position(0, 0), data);
              });
            });
          },
          (error: any) => {
            console.error(error);
            debugger;
          }
        );
      }
    })
    .catch(function (error) {
      console.log(error);
      vscode.window.showWarningMessage(
        "Oops unable to fetch pockets server error check your connection and try again"
      );
    });
};






const saveCode = (text:string,email:string,password:string,description:string,extension:string)=>{


	axios.post(config.URL + "/route.php?route=SaveCode", {
      email: email,
      password: password,
	  code:text,
	  description:description,
	  extension:extension
    })
    .then(async function (response: any) {

      console.log(response.data);
	  if(response.data === undefined || response.data === ''){

		vscode.window.showWarningMessage(
			"Oops unable to save error check your connection or try to login first "
		  );

	  }else{

	    vscode.window.showInformationMessage("Code has been saved successfully !!");

	  }

	}).catch(function (error){
		console.log(error);
		vscode.window.showWarningMessage(
		  "Oops unable to save error check your connection and try again !!"
		);
	});

};




export function deactivate() {}
