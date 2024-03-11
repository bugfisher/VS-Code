import * as vscode from 'vscode';

const regex = /^[a-zA-Z]:\\\\(?:[^<>:"/\\|?*]+\\\\)*[^<>:"/\\|?*]+(\\\\build\\\\|$)/;
export function activate(context: vscode.ExtensionContext) {
    // Register the command to show the panel
    let disposable = vscode.commands.registerCommand('extension.createWorkspace', () => {
        // Prompt user for workspace name
        vscode.window.showInputBox({ prompt: 'Enter workspace name:' }).then((workspaceName) => {
            if (workspaceName) {
                // Create and add a new workspace to the Activity Bar
                addWorkspaceToActivityBar(workspaceName);
            }
        });
    });

    // Add a button to the Activity Bar
    context.subscriptions.push(
        vscode.commands.registerCommand('extension.showWorkspaceButton', () => {
            vscode.window.createTreeView('myExtensionWorkspaceView', { treeDataProvider: new WorkspaceProvider() });
        })
    );

    context.subscriptions.push(disposable);
}

class WorkspaceProvider implements vscode.TreeDataProvider<WorkspaceItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<WorkspaceItem | undefined> = new vscode.EventEmitter<WorkspaceItem | undefined>();
    readonly onDidChangeTreeData: vscode.Event<WorkspaceItem | undefined> = this._onDidChangeTreeData.event;

    getTreeItem(element: WorkspaceItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: WorkspaceItem): Thenable<WorkspaceItem[]> {
        const workspaces: WorkspaceItem[] = [];

        // Logic to fetch existing workspaces goes here

        return Promise.resolve(workspaces);
    }

    refresh(): void {
        this._onDidChangeTreeData.fire(undefined);
    }
}

class WorkspaceItem extends vscode.TreeItem {
    constructor(public readonly label: string) {
        super(label);
    }
}

function addWorkspaceToActivityBar(workspaceName: string) {
    const workspaceItem = new WorkspaceItem(workspaceName);
    vscode.window.registerTreeDataProvider('myExtensionWorkspaceView', new WorkspaceProvider());
    vscode.commands.executeCommand('workbench.view.extension.myExtensionWorkspaceView');
    vscode.window.showInformationMessage(`Workspace '${workspaceName}' created and added to the Activity Bar.`);
}




import * as vscode from 'vscode';
import * as path from 'path';

export class FileTreeDataProvider implements vscode.TreeDataProvider<FileItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<FileItem | undefined> = new vscode.EventEmitter<FileItem | undefined>();
    readonly onDidChangeTreeData: vscode.Event<FileItem | undefined> = this._onDidChangeTreeData.event;

    refresh(): void {
        this._onDidChangeTreeData.fire(undefined);
    }

    getTreeItem(element: FileItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
        return element;
    }

    getChildren(element?: FileItem | undefined): vscode.ProviderResult<FileItem[]> {
        // Get all the workspace folders
        const workspaceFolders = vscode.workspace.workspaceFolders;

        if (workspaceFolders) {
            const files: FileItem[] = [];
            workspaceFolders.forEach(folder => {
                const folderPath = folder.uri.fsPath;
                const filesInFolder = vscode.workspace.fs.readDirectory(vscode.Uri.file(folderPath));
                filesInFolder.then((items) => {
                    items.forEach(([name, type]) => {
                        const filePath = path.join(folderPath, name);
                        const fileItem = new FileItem(name, type, filePath);
                        files.push(fileItem);
                    });
                });
            });
            return files;
        }

        return [];
    }
}

class FileItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly type: vscode.FileType,
        public readonly resourceUri: vscode.Uri
    ) {
        super(label, vscode.TreeItemCollapsibleState.None);
    }

    iconPath = {
        light: path.join(__filename, '..', '..', 'resources', 'light', 'green-file-icon.svg'),
        dark: path.join(__filename, '..', '..', 'resources', 'dark', 'green-file-icon.svg')
    };

    contextValue = 'file';
}


