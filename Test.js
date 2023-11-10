import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand('extension.createWorkspace', () => {
        // Create and show a new webview
        const panel = vscode.window.createWebviewPanel(
            'createWorkspace', // Identifies the type of the webview. Used internally
            'Create Workspace', // Title of the panel displayed to the user
            vscode.ViewColumn.One, // Editor column to show the new webview panel in
            {}
        );

        // Set the webview's HTML content
        panel.webview.html = getWebviewContent();

        // Handle messages from the webview
        panel.webview.onDidReceiveMessage(
            message => {
                switch (message.command) {
                    case 'createWorkspace':
                        // Call a function to create a workspace with the provided details
                        createWorkspace(message.folderName);
                        // Close the webview
                        panel.dispose();
                        return;
                }
            },
            undefined,
            context.subscriptions
        );
    });

    context.subscriptions.push(disposable);
}

function createWorkspace(folderName: string) {
    // Logic to create a workspace with the provided folderName
    vscode.workspace.updateWorkspaceFolders(vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders.length : 0, null, { uri: vscode.Uri.file(folderName) });
}

function getWebviewContent() {
    return `
        <html>
        <body>
            <h2>Create Workspace</h2>
            <label for="folderName">Folder Name:</label>
            <input type="text" id="folderName" name="folderName"><br><br>
            <button onclick="createWorkspace()">Create Workspace</button>

            <script>
                function createWorkspace() {
                    const folderName = document.getElementById('folderName').value;
                    vscode.postMessage({ command: 'createWorkspace', folderName });
                }
            </script>
        </body>
        </html>
    `;
}

