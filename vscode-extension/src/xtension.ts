// vscode-extension/src/extension.ts
import * as vscode from 'vscode';
import { CodeWeaverProvider } from './providers/CodeWeaverProvider';
import { CodeWeaverCodeActionProvider } from './providers/CodeActionProvider';
import { CodeWeaverCompletionProvider } from './providers/CompletionProvider';
import { CodeWeaverHoverProvider } from './providers/HoverProvider';
import { CodeWeaverTreeDataProvider } from './providers/TreeDataProvider';
import { CodeWeaverTerminal } from './terminal/CodeWeaverTerminal';
import { CodeWeaverWebviewProvider } from './webview/WebviewProvider';
import { CodeWeaverClient } from './client/CodeWeaverClient';

export function activate(context: vscode.ExtensionContext) {
    console.log('CodeWeaver extension is now active!');
    
    // Initialize CodeWeaver client
    const client = new CodeWeaverClient(context);
    
    // Register commands
    registerCommands(context, client);
    
    // Register providers
    registerProviders(context, client);
    
    // Register views
    registerViews(context, client);
    
    // Show welcome message
    vscode.window.showInformationMessage('CodeWeaver AI Assistant is ready!');
}

function registerCommands(context: vscode.ExtensionContext, client: CodeWeaverClient) {
    // Generate new code
    context.subscriptions.push(
        vscode.commands.registerCommand('codeweaver.new', async () => {
            const task = await vscode.window.showInputBox({
                prompt: 'What would you like to create?',
                placeHolder: 'e.g., REST API endpoint for user authentication'
            });
            
            if (!task) return;
            
            const fileName = await vscode.window.showInputBox({
                prompt: 'File name:',
                placeHolder: 'e.g., auth_service.py'
            });
            
            if (!fileName) return;
            
            await generateNewCode(client, task, fileName);
        })
    );
    
    // Refactor selected code
    context.subscriptions.push(
        vscode.commands.registerCommand('codeweaver.refactor', async () => {
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                vscode.window.showErrorMessage('No active editor!');
                return;
            }
            
            const selection = editor.document.getText(editor.selection);
            if (!selection) {
                vscode.window.showErrorMessage('Please select code to refactor!');
                return;
            }
            
            const task = await vscode.window.showInputBox({
                prompt: 'How would you like to refactor this code?',
                placeHolder: 'e.g., Add error handling, improve performance'
            });
            
            if (!task) return;
            
            await refactorCode(client, editor, selection, task);
        })
    );
    
    // Heal project
    context.subscriptions.push(
        vscode.commands.registerCommand('codeweaver.heal', async () => {
            const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
            if (!workspaceFolder) {
                vscode.window.showErrorMessage('No workspace folder open!');
                return;
            }
            
            await healProject(client, workspaceFolder.uri.fsPath);
        })
    );
    
    // Natural language query
    context.subscriptions.push(
        vscode.commands.registerCommand('codeweaver.ask', async () => {
            const question = await vscode.window.showInputBox({
                prompt: 'Ask anything about your codebase:',
                placeHolder: 'e.g., Where is the user authentication logic?'
            });
            
            if (!question) return;
            
            await askQuestion(client, question);
        })
    );
    
    // Show AI panel
    context.subscriptions.push(
        vscode.commands.registerCommand('codeweaver.showPanel', () => {
            CodeWeaverWebviewProvider.createOrShow(context.extensionUri, client);
        })
    );
    
    // Quick fix from code action
    context.subscriptions.push(
        vscode.commands.registerCommand('codeweaver.quickFix', async (document: vscode.TextDocument, range: vscode.Range, diagnostic: vscode.Diagnostic) => {
            await applyQuickFix(client, document, range, diagnostic);
        })
    );
}

function registerProviders(context: vscode.ExtensionContext, client: CodeWeaverClient) {
    // Code Action Provider (Quick Fixes)
    const codeActionProvider = new CodeWeaverCodeActionProvider(client);
    context.subscriptions.push(
        vscode.languages.registerCodeActionsProvider(
            ['javascript', 'typescript', 'python', 'go', 'rust', 'java'],
            codeActionProvider,
            {
                providedCodeActionKinds: [
                    vscode.CodeActionKind.QuickFix,
                    vscode.CodeActionKind.Refactor,
                    vscode.CodeActionKind.RefactorRewrite
                ]
            }
        )
    );
    
    // Completion Provider (IntelliSense)
    const completionProvider = new CodeWeaverCompletionProvider(client);
    context.subscriptions.push(
        vscode.languages.registerCompletionItemProvider(
            ['javascript', 'typescript', 'python', 'go', 'rust', 'java'],
            completionProvider,
            '.', ' '
        )
    );
    
    // Hover Provider
    const hoverProvider = new CodeWeaverHoverProvider(client);
    context.subscriptions.push(
        vscode.languages.registerHoverProvider(
            ['javascript', 'typescript', 'python', 'go', 'rust', 'java'],
            hoverProvider
        )
    );
}

function registerViews(context: vscode.ExtensionContext, client: CodeWeaverClient) {
    // Sidebar tree view
    const treeDataProvider = new CodeWeaverTreeDataProvider(client);
    vscode.window.createTreeView('codeweaver-sidebar', {
        treeDataProvider,
        showCollapseAll: true
    });
    
    // Webview provider for AI chat
    const webviewProvider = new CodeWeaverWebviewProvider(context.extensionUri, client);
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(
            'codeweaver-chat',
            webviewProvider
        )
    );
}

// Command implementations
async function generateNewCode(client: CodeWeaverClient, task: string, fileName: string) {
    const progressOptions = {
        location: vscode.ProgressLocation.Notification,
        title: 'CodeWeaver',
        cancellable: false
    };
    
    vscode.window.withProgress(progressOptions, async (progress) => {
        progress.report({ message: 'Generating code...' });
        
        try {
            const result = await client.generate({
                task,
                fileName,
                context: {
                    workspace: vscode.workspace.workspaceFolders?.[0]?.uri.fsPath,
                    language: getLanguageFromFileName(fileName)
                }
            });
            
            // Create new document with generated code
            const document = await vscode.workspace.openTextDocument({
                content: result.code,
                language: getLanguageFromFileName(fileName)
            });
            
            await vscode.window.showTextDocument(document);
            
            // Show suggestions
            if (result.suggestions.length > 0) {
                const selected = await vscode.window.showQuickPick(result.suggestions, {
                    placeHolder: 'Next steps:'
                });
                
                if (selected) {
                    vscode.commands.executeCommand('codeweaver.new', selected);
                }
            }
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to generate code: ${error}`);
        }
    });
}

async function refactorCode(client: CodeWeaverClient, editor: vscode.TextEditor, code: string, task: string) {
    vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: 'Refactoring code...'
    }, async () => {
        try {
            const result = await client.refactor({
                code,
                task,
                language: editor.document.languageId,
                filePath: editor.document.fileName
            });
            
            // Show diff
            const originalUri = editor.document.uri;
            const refactoredUri = originalUri.with({ scheme: 'codeweaver-refactored' });
            
            // Register content provider for diff
            const disposable = vscode.workspace.registerTextDocumentContentProvider('codeweaver-refactored', {
                provideTextDocumentContent: () => result.refactoredCode
            });
            
            await vscode.commands.executeCommand(
                'vscode.diff',
                originalUri,
                refactoredUri,
                'Original ↔ Refactored'
            );
            
            // Clean up
            setTimeout(() => disposable.dispose(), 60000);
            
            // Ask to apply changes
            const action = await vscode.window.showInformationMessage(
                'Apply refactoring?',
                'Yes',
                'No'
            );
            
            if (action === 'Yes') {
                const edit = new vscode.WorkspaceEdit();
                const fullRange = new vscode.Range(
                    editor.document.positionAt(0),
                    editor.document.positionAt(editor.document.getText().length)
                );
                edit.replace(originalUri, editor.selection.isEmpty ? fullRange : editor.selection, result.refactoredCode);
                await vscode.workspace.applyEdit(edit);
            }
        } catch (error) {
            vscode.window.showErrorMessage(`Refactoring failed: ${error}`);
        }
    });
}

async function healProject(client: CodeWeaverClient, projectPath: string) {
    const terminal = vscode.window.createTerminal('CodeWeaver Heal');
    terminal.show();
    
    // Create output channel for detailed results
    const outputChannel = vscode.window.createOutputChannel('CodeWeaver Heal Results');
    
    vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: 'Analyzing project health...',
        cancellable: true
    }, async (progress, token) => {
        try {
            const report = await client.healProject(projectPath, {
                onProgress: (message) => {
                    progress.report({ message });
                },
                cancellationToken: token
            });
            
            // Display results in output channel
            outputChannel.clear();
            outputChannel.appendLine('🔍 Project Health Report');
            outputChannel.appendLine('========================\n');
            
            // Critical issues
            if (report.criticalIssues.length > 0) {
                outputChannel.appendLine('🔴 Critical Issues:');
                report.criticalIssues.forEach((issue, index) => {
                    outputChannel.appendLine(`${index + 1}. ${issue.description}`);
                    outputChannel.appendLine(`   File: ${issue.file}:${issue.line}`);
                    outputChannel.appendLine(`   Fix: ${issue.solution}\n`);
                });
            }
            
            // Show quick fixes
            const quickFixes = report.criticalIssues.map(issue => ({
                label: issue.description,
                detail: issue.solution,
                command: issue.command
            }));
            
            if (quickFixes.length > 0) {
                const selected = await vscode.window.showQuickPick(quickFixes, {
                    placeHolder: 'Select an issue to fix',
                    canPickMany: true
                });
                
                if (selected) {
                    for (const fix of selected) {
                        terminal.sendText(fix.command);
                    }
                }
            }
            
            outputChannel.show();
        } catch (error) {
            vscode.window.showErrorMessage(`Project analysis failed: ${error}`);
        }
    });
}

async function askQuestion(client: CodeWeaverClient, question: string) {
    const panel = vscode.window.createWebviewPanel(
        'codeweaver-answer',
        'CodeWeaver Answer',
        vscode.ViewColumn.Two,
        { enableScripts: true }
    );
    
    panel.webview.html = getLoadingHtml();
    
    try {
        const answer = await client.ask(question, {
            workspace: vscode.workspace.workspaceFolders?.[0]?.uri.fsPath
        });
        
        panel.webview.html = getAnswerHtml(question, answer);
        
        // Handle navigation to files
        panel.webview.onDidReceiveMessage(async (message) => {
            if (message.command === 'openFile') {
                const document = await vscode.workspace.openTextDocument(message.file);
                const editor = await vscode.window.showTextDocument(document);
                
                if (message.line) {
                    const position = new vscode.Position(message.line - 1, 0);
                    editor.selection = new vscode.Selection(position, position);
                    editor.revealRange(new vscode.Range(position, position));
                }
            }
        });
    } catch (error) {
        panel.webview.html = getErrorHtml(error);
    }
}

// Utility functions
function getLanguageFromFileName(fileName: string): string {
    const ext = fileName.split('.').pop()?.toLowerCase();
    const languageMap: Record<string, string> = {
        'js': 'javascript',
        'jsx': 'javascript',
        'ts': 'typescript',
        'tsx': 'typescript',
        'py': 'python',
        'go': 'go',
        'rs': 'rust',
        'java': 'java',
        'rb': 'ruby',
        'php': 'php'
    };
    return languageMap[ext || ''] || 'plaintext';
}

function getLoadingHtml(): string {
    return `<!DOCTYPE html>
    <html>
    <head>
        <style>
            body { 
                font-family: var(--vscode-font-family);
                padding: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                height: 100vh;
            }
            .loader {
                border: 4px solid #f3f3f3;
                border-top: 4px solid var(--vscode-progressBar-background);
                border-radius: 50%;
                width: 40px;
                height: 40px;
                animation: spin 1s linear infinite;
            }
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        </style>
    </head>
    <body>
        <div class="loader"></div>
    </body>
    </html>`;
}

function getAnswerHtml(question: string, answer: any): string {
    return `<!DOCTYPE html>
    <html>
    <head>
        <style>
            body { 
                font-family: var(--vscode-font-family);
                padding: 20px;
                color: var(--vscode-foreground);
            }
            h2 { color: var(--vscode-titleBar-activeForeground); }
            .file-link {
                color: var(--vscode-textLink-foreground);
                cursor: pointer;
                text-decoration: underline;
            }
            .file-link:hover {
                color: var(--vscode-textLink-activeForeground);
            }
            pre {
                background: var(--vscode-textBlockQuote-background);
                padding: 10px;
                border-radius: 4px;
                overflow-x: auto;
            }
        </style>
    </head>
    <body>
        <h2>Question: ${question}</h2>
        <div id="answer">${formatAnswer(answer)}</div>
        <script>
            const vscode = acquireVsCodeApi();
            document.querySelectorAll('.file-link').forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    vscode.postMessage({
                        command: 'openFile',
                        file: e.target.dataset.file,
                        line: parseInt(e.target.dataset.line)
                    });
                });
            });
        </script>
    </body>
    </html>`;
}

function formatAnswer(answer: any): string {
    // Format the answer with clickable file links
    let html = answer.explanation;
    
    if (answer.locations) {
        html += '<h3>📍 Relevant Locations:</h3><ul>';
        answer.locations.forEach((loc: any) => {
            html += `<li><span class="file-link" data-file="${loc.file}" data-line="${loc.line}">${loc.file}:${loc.line}</span> - ${loc.description}</li>`;
        });
        html += '</ul>';
    }
    
    if (answer.suggestions) {
        html += '<h3>💡 Suggestions:</h3><ul>';
        answer.suggestions.forEach((suggestion: string) => {
            html += `<li>${suggestion}</li>`;
        });
        html += '</ul>';
    }
    
    return html;
}

function getErrorHtml(error: any): string {
    return `<!DOCTYPE html>
    <html>
    <head>
        <style>
            body { 
                font-family: var(--vscode-font-family);
                padding: 20px;
                color: var(--vscode-errorForeground);
            }
        </style>
    </head>
    <body>
        <h2>Error</h2>
        <p>${error.message || error}</p>
    </body>
    </html>`;
}

export function deactivate() {
    console.log('CodeWeaver extension deactivated');
}