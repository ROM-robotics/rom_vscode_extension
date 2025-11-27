// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { exec, spawn } from 'child_process';
import * as fs from 'fs';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	console.log('Robot Code Sync extension is now active!');

	// Create status bar item
	const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
	statusBarItem.command = 'robot-code-sync.syncToRobot';
	statusBarItem.text = '$(cloud-upload) Sync to Robot';
	statusBarItem.tooltip = 'Click to sync code to robot';
	
	const config = vscode.workspace.getConfiguration('robotCodeSync');
	if (config.get('showStatusBar', true)) {
		statusBarItem.show();
	}
	context.subscriptions.push(statusBarItem);

	// Register the sync command
	const syncCommand = vscode.commands.registerCommand('robot-code-sync.syncToRobot', async () => {
		const config = vscode.workspace.getConfiguration('robotCodeSync');
		let sourcePath = config.get<string>('sourcePath', '/home/mr_robot/Desktop/Git/rom_robotics/rom_nav2_ws');
		let destinationPath = config.get<string>('destinationPath', '/home/mr_robot/Desktop/Git/rom_robotics/rom_nav2_ws');
		const robotHost = config.get<string>('robotHost', 'robot@192.168.1.100');
		const robotPassword = config.get<string>('robotPassword', '');
		const excludePatterns = config.get<string[]>('excludePatterns', ['.git', 'node_modules']);

		// Validate source path
		if (!fs.existsSync(sourcePath)) {
			const newSource = await vscode.window.showInputBox({
				prompt: 'Source path does not exist. Enter valid source path:',
				value: sourcePath,
				validateInput: (value) => {
					return fs.existsSync(value) ? null : 'Path does not exist';
				}
			});
			if (!newSource) {
				return;
			}
			sourcePath = newSource;
			await config.update('sourcePath', sourcePath, vscode.ConfigurationTarget.Global);
		}

		// Confirm sync
		const answer = await vscode.window.showInformationMessage(
			`Sync from:\n${sourcePath}\n\nTo:\n${robotHost}:${destinationPath}`,
			'Yes',
			'No'
		);

		if (answer !== 'Yes') {
			return;
		}

		// Build rsync command
		if (!sourcePath.endsWith('/')) {
			sourcePath += '/';
		}
		const excludeArgs = excludePatterns.map(pattern => `--exclude='${pattern}'`).join(' ');
		
		let rsyncCommand: string;
		if (robotPassword) {
			// Use sshpass for password authentication
			rsyncCommand = `sshpass -p '${robotPassword}' rsync -avz --delete ${excludeArgs} "${sourcePath}" ${robotHost}:"${destinationPath}"`;
		} else {
			// Use SSH keys
			rsyncCommand = `rsync -avz --delete ${excludeArgs} "${sourcePath}" ${robotHost}:"${destinationPath}"`;
		}

		// Show progress
		vscode.window.withProgress({
			location: vscode.ProgressLocation.Notification,
			title: 'Syncing to robot...',
			cancellable: false
		}, async (progress) => {
			return new Promise<void>((resolve, reject) => {
				exec(rsyncCommand, (error, stdout, stderr) => {
					if (error) {
						vscode.window.showErrorMessage(`Sync failed: ${error.message}`);
						const channel = vscode.window.createOutputChannel('Robot Code Sync');
						channel.appendLine('Error:');
						channel.appendLine(error.message);
						if (stderr) {
							channel.appendLine('\nStderr:');
							channel.appendLine(stderr);
						}
						channel.appendLine('\nCommand:');
						channel.appendLine(rsyncCommand.replace(robotPassword, '***'));
						channel.show();
						reject(error);
						return;
					}

					vscode.window.showInformationMessage('✅ Code synced to robot successfully!');
					
					// Show output if verbose
					if (stdout) {
						const channel = vscode.window.createOutputChannel('Robot Code Sync');
						channel.appendLine('Sync completed:');
						channel.appendLine(stdout);
					}
					
					resolve();
				});
			});
		});
	});

	// Register SSH terminal command
	const sshCommand = vscode.commands.registerCommand('robot-code-sync.openSSH', async () => {
		const config = vscode.workspace.getConfiguration('robotCodeSync');
		const robotHost = config.get<string>('robotHost', 'robot@192.168.1.100');
		const robotPassword = config.get<string>('robotPassword', '');

		const terminal = vscode.window.createTerminal({
			name: `SSH: ${robotHost}`,
			shellPath: '/bin/bash'
		});

		if (robotPassword) {
			// Use sshpass for password authentication
			terminal.sendText(`sshpass -p '${robotPassword}' ssh ${robotHost}`);
		} else {
			// Use SSH keys
			terminal.sendText(`ssh ${robotHost}`);
		}
		
		terminal.show();
	});

	context.subscriptions.push(syncCommand);
	context.subscriptions.push(sshCommand);
}

// This method is called when your extension is deactivated
export function deactivate() {}
