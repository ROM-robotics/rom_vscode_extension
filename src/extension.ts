// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { exec } from 'child_process';
import * as fs from 'fs';

// Generic sync function
async function performSync(sourcePathKey: string, destinationPathKey: string, workspaceName: string) {
	const config = vscode.workspace.getConfiguration('robotCodeSync');
	let sourcePath = config.get<string>(sourcePathKey, '');
	let destinationPath = config.get<string>(destinationPathKey, '');
	const robotHost = config.get<string>('robotHost', 'robot@192.168.1.100');
	const robotPassword = config.get<string>('robotPassword', '');
	const excludePatterns = config.get<string[]>('excludePatterns', ['.git', 'node_modules']);

	// Validate source path
	if (!fs.existsSync(sourcePath)) {
		vscode.window.showErrorMessage(`Source path does not exist: ${sourcePath}`);
		return;
	}

	// Confirm sync
	const answer = await vscode.window.showInformationMessage(
		`Sync ${workspaceName}\nFrom: ${sourcePath}\nTo: ${robotHost}:${destinationPath}`,
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
		rsyncCommand = `sshpass -p '${robotPassword}' rsync -avz --delete ${excludeArgs} "${sourcePath}" ${robotHost}:"${destinationPath}"`;
	} else {
		rsyncCommand = `rsync -avz --delete ${excludeArgs} "${sourcePath}" ${robotHost}:"${destinationPath}"`;
	}

	// Show progress
	vscode.window.withProgress({
		location: vscode.ProgressLocation.Notification,
		title: `Syncing ${workspaceName} to robot...`,
		cancellable: false
	}, async (progress) => {
		return new Promise<void>((resolve, reject) => {
			exec(rsyncCommand, { maxBuffer: 1024 * 1024 * 10 }, (error, stdout, stderr) => {
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

				vscode.window.showInformationMessage(`✅ ${workspaceName} synced to robot successfully!`);
				
				if (stdout) {
					const channel = vscode.window.createOutputChannel('Robot Code Sync');
					channel.appendLine(`Sync completed for ${workspaceName}:`);
					channel.appendLine(stdout);
				}
				
				resolve();
			});
		});
	});
}

// This method is called when your extension is activated
export function activate(context: vscode.ExtensionContext) {

	console.log('Robot Code Sync extension is now active!');

	// Create status bar item
	const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
	statusBarItem.command = 'robot-code-sync.syncNav2WsToRobot';
	statusBarItem.text = '$(cloud-upload) Sync to Robot';
	statusBarItem.tooltip = 'Click to sync code to robot';
	
	const config = vscode.workspace.getConfiguration('robotCodeSync');
	if (config.get('showStatusBar', true)) {
		statusBarItem.show();
	}
	context.subscriptions.push(statusBarItem);

	// Register all sync commands
	context.subscriptions.push(vscode.commands.registerCommand('robot-code-sync.syncNav2WsToRobot', () => 
		performSync('rom_nav2_ws_sourcePath', 'rom_nav2_ws_destinationPath', 'nav2_ws')));
	
	context.subscriptions.push(vscode.commands.registerCommand('robot-code-sync.syncDataToRobot', () => 
		performSync('data_sourcePath', 'data_destinationPath', '~/data')));
	
	context.subscriptions.push(vscode.commands.registerCommand('robot-code-sync.syncMytmuxToRobot', () => 
		performSync('mytmux_sourcePath', 'mytmux_destinationPath', 'mytmux')));
	
	context.subscriptions.push(vscode.commands.registerCommand('robot-code-sync.syncSdkWsToRobot', () => 
		performSync('rom_sdk_ws_sourcePath', 'rom_sdk_ws_destinationPath', 'rom_sdk_ws')));
	
	context.subscriptions.push(vscode.commands.registerCommand('robot-code-sync.syncDriversWsToRobot', () => 
		performSync('rom_drivers_ws_sourcePath', 'rom_drivers_ws_destinationPath', 'rom_drivers_ws')));
	
	context.subscriptions.push(vscode.commands.registerCommand('robot-code-sync.syncThirdpartyDriversWsToRobot', () => 
		performSync('thirdparty_drivers_ws_sourcePath', 'thirdparty_drivers_ws_destinationPath', 'thirdparty_drivers_ws')));
	
	context.subscriptions.push(vscode.commands.registerCommand('robot-code-sync.syncAllToRobot', () => 
		performSync('all_sourcePath', 'all_destinationPath', 'All')));

	// Generic build function
	const createBuildCommand = (workspace: string, displayName: string) => {
		return vscode.commands.registerCommand(`robot-code-sync.build${workspace}`, async () => {
			const config = vscode.workspace.getConfiguration('robotCodeSync');
			const robotHost = config.get<string>('robotHost', 'robot@192.168.1.100');
			const robotPassword = config.get<string>('robotPassword', '');

			const terminal = vscode.window.createTerminal({
				name: `Build ${displayName}`,
				shellPath: '/bin/bash'
			});

			if (robotPassword) {
				terminal.sendText(`sshpass -p '${robotPassword}' ssh -t ${robotHost} "cd ~/${displayName} && colcon build"`);
			} else {
				terminal.sendText(`ssh -t ${robotHost} "cd ~/${displayName} && colcon build"`);
			}
			
			terminal.show();
		});
	};

	// Register build commands
	const buildSdkCommand = createBuildCommand('RomSdkWs', 'rom_sdk_ws');
	const buildNav2Command = createBuildCommand('RomNav2Ws', 'rom_nav2_ws');
	const buildDriversCommand = createBuildCommand('RomDriversWs', 'rom_drivers_ws');
	const buildThirdpartyCommand = createBuildCommand('ThirdpartyDriversWs', 'thirdparty_drivers_ws');

	// Register Build All command
	const buildAllCommand = vscode.commands.registerCommand('robot-code-sync.buildAll', async () => {
		const config = vscode.workspace.getConfiguration('robotCodeSync');
		const robotHost = config.get<string>('robotHost', 'robot@192.168.1.100');
		const robotPassword = config.get<string>('robotPassword', '');

		const terminal = vscode.window.createTerminal({
			name: 'Build All',
			shellPath: '/bin/bash'
		});

		const buildCommand = 'cd ~/rom_sdk_ws && colcon build && cd ~/rom_drivers_ws && colcon build && cd ~/rom_nav2_ws && colcon build';

		if (robotPassword) {
			terminal.sendText(`sshpass -p '${robotPassword}' ssh -t ${robotHost} "${buildCommand}"`);
		} else {
			terminal.sendText(`ssh -t ${robotHost} "${buildCommand}"`);
		}
		
		terminal.show();
	});

	// Register Run GUI command
	const runGuiCommand = vscode.commands.registerCommand('robot-code-sync.runGui', async () => {
		const config = vscode.workspace.getConfiguration('robotCodeSync');
		const appImagePath = config.get<string>('appImagePath', '/home/mr_robot/Desktop/Git/rom_robotics/data/app/rom_dynamics_multi_robots_gui-linux-linux-v0.0.1.AppImage');

		if (!fs.existsSync(appImagePath)) {
			vscode.window.showErrorMessage(`AppImage not found: ${appImagePath}`);
			return;
		}

		const terminal = vscode.window.createTerminal({
			name: 'ROM GUI',
			shellPath: '/bin/bash'
		});

		// Make executable then run (safer in case permissions are missing)
		terminal.sendText(`chmod +x "${appImagePath}" && "${appImagePath}"`);
		terminal.show();
		vscode.window.showInformationMessage('ROM GUI launched!');
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
			terminal.sendText(`sshpass -p '${robotPassword}' ssh ${robotHost}`);
		} else {
			terminal.sendText(`ssh ${robotHost}`);
		}
		
		terminal.show();
	});

	// Register open settings command
	const settingsCommand = vscode.commands.registerCommand('robot-code-sync.openSettings', () => {
		vscode.commands.executeCommand('workbench.action.openSettings', '@ext:rom-robotics-llc.robot-code-sync');
	});

	context.subscriptions.push(buildSdkCommand);
	context.subscriptions.push(buildNav2Command);
	context.subscriptions.push(buildDriversCommand);
	context.subscriptions.push(buildThirdpartyCommand);
	context.subscriptions.push(buildAllCommand);
	context.subscriptions.push(runGuiCommand);
	context.subscriptions.push(sshCommand);
	context.subscriptions.push(settingsCommand);
}

// This method is called when your extension is deactivated
export function deactivate() {}
