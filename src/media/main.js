/* eslint-disable @typescript-eslint/naming-convention */
const vscode = acquireVsCodeApi();

let fe = document.getElementById('fetch');



fe.addEventListener('click',()=>{
   
    vscode.postMessage({type: 'do'});

});





