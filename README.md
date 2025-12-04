# Robot Code Sync

**Robot Code Sync** သည် VS Code extension တစ်ခုဖြစ်ပြီး၊ သင့် code တွေကို robot ဆီကို rsync ကိုသုံးပြီး လွယ်ကူမြန်ဆန်စွာ sync လုပ်နိုင်ပါတယ်။ Status bar မှာ ခလုတ်တစ်ခုနှိပ်လိုက်တာနဲ့ code တွေ robot ဆီကို ပို့လို့ရပါတယ်။

## Features

- ✨ Status bar button တစ်ခုနှိပ်လိုက်တာနဲ့ sync လုပ်နိုင်တယ်
- 🚀 rsync သုံးထားတဲ့အတွက် မြန်ဆန်ပြီး reliable
- ⚙️ Configurable settings - robot IP, path, exclude patterns စတာတွေ customize လုပ်လို့ရတယ်
- 📊 Progress indicator နဲ့ notification တွေပါတယ်
- 🔍 Output channel မှာ detailed sync logs ကြည့်လို့ရတယ်

## Keyboard Shortcuts

| Command | Shortcut (Windows/Linux) | Shortcut (Mac) | Description |
|---------|-------------------------|----------------|-------------|
| **Sync All to Robot** | `Ctrl+Shift+R` | `Cmd+Shift+R` | အားလုံး robot ကို sync လုပ်မယ် |
| **Build All** | `Ctrl+Shift+B` | `Cmd+Shift+B` | Workspaces အားလုံး build လုပ်မယ် |
| **Run GUI** | `Ctrl+Shift+G` | `Cmd+Shift+G` | ROM GUI AppImage ကို run မယ် |
| **Run Tuning App** | `Ctrl+Shift+T` | `Cmd+Shift+T` | Tuning App ကို run မယ် |

## Installation

### Method 1: Install from VSIX File (Recommended)

1. Download the `robot-code-sync-0.0.1.vsix` file
2. VS Code ကို ဖွင့်ပါ
3. Extensions sidebar ကိုဖွင့်ပါ (`Ctrl+Shift+X` or `Cmd+Shift+X`)
4. "..." (More Actions) menu ကို နှိပ်ပါ
5. **"Install from VSIX..."** ကို ရွေးပါ
6. `robot-code-sync-0.0.1.vsix` file ကို ရွေးပြီး install လုပ်ပါ
7. VS Code ကို reload လုပ်ပါ

### Method 2: Install via Command Line

```bash
code --install-extension /path/to/robot-code-sync-0.0.1.vsix
```

### Method 3: Development Mode

Extension ကို develop လုပ်ချင်ရင် သို့မဟုတ် test လုပ်ချင်ရင်:

1. Clone or download the extension source code
2. VS Code မှာ extension folder ကို ဖွင့်ပါ
3. `npm install` run ပါ
4. **F5** နှိပ်ပါ (Extension Development Host window ပွင့်လာပါလိမ့်မယ်)

## Requirements

- **rsync** installed on your system (Linux/Mac တွေမှာ default ပါတယ်)
- **sshpass** installed (password authentication အတွက်လိုအပ်ရင်: `sudo apt install sshpass`)
- SSH access to your robot
- VS Code version 1.106.0 or higher

## Extension Settings

Extension ကို အောက်ပါ settings တွေနဲ့ configure လုပ်နိုင်ပါတယ်:

* `robotCodeSync.sourcePath`: Local computer ရဲ့ source directory path (default: `/home/mr_robot/Desktop/Git/rom_robotics/rom_nav2_ws`)
* `robotCodeSync.destinationPath`: Robot ပေါ်က destination directory path (default: `/home/mr_robot/Desktop/Git/rom_robotics/rom_nav2_ws`)
* `robotCodeSync.robotHost`: Robot SSH host (ဥပမာ: `robot@192.168.1.100`)
* `robotCodeSync.robotPassword`: Robot SSH password (empty ဖြစ်ရင် SSH keys သုံးပါလိမ့်မယ်)
* `robotCodeSync.excludePatterns`: Sync လုပ်တဲ့အခါ exclude လုပ်မယ့် patterns (default: `.git`, `node_modules`, `.vscode`, `dist`, `out`, `build`, `install`, `log`, `*.pyc`, `__pycache__`)
* `robotCodeSync.showStatusBar`: Status bar button ကို ပြမလား မပြဘူးလား (default: `true`)

### Settings Configuration

VS Code Settings (`Ctrl+,` or `Cmd+,`) မှာ သွားပြီး configure လုပ်နိုင်ပါတယ်:

```json
{
  "robotCodeSync.sourcePath": "/home/mr_robot/Desktop/Git/rom_robotics/rom_nav2_ws",
  "robotCodeSync.destinationPath": "/home/mr_robot/Desktop/Git/rom_robotics/rom_nav2_ws",
  "robotCodeSync.robotHost": "robot@192.168.1.100",
  "robotCodeSync.robotPassword": "",
  "robotCodeSync.excludePatterns": [
    ".git",
    "node_modules",
    ".vscode",
    "build",
    "install",
    "log"
  ],
  "robotCodeSync.showStatusBar": true
}
```

## Usage

### 🔄 Code Sync to Robot

1. Settings (`Ctrl+,`) မှာ source path, destination path, robot host နဲ့ password ကို configure လုပ်ပါ
2. Status bar ရဲ့ ညာဘက်ထောင့်မှာ **"🔄 Sync to Robot"** button ကို နှိပ်ပါ
3. Source နဲ့ destination paths တွေကို confirm လုပ်ပါ
4. "Yes" ကို နှိပ်ရင် rsync က local source directory ကနေ robot destination directory ကို sync လုပ်ပါလိမ့်မယ်
5. Progress notification ကို စောင့်ပါ
6. ပြီးသွားရင် success message တက်ပါလိမ့်မယ်

**Alternative:** Command Palette (`Ctrl+Shift+P` or `Cmd+Shift+P`) ကနေ `Robot Code Sync: Sync to Robot` ကို ရှာပြီး run လို့လည်း ရပါတယ်။

### 🖥️ SSH Terminal to Robot

1. Command Palette (`Ctrl+Shift+P`) ကို ဖွင့်ပါ
2. **"Robot Code Sync: Open SSH Terminal"** ကို ရှာပါ
3. Terminal window မှာ robot သို့ SSH connection ဖွင့်ပေးပါလိမ့်မယ်
4. Password configure လုပ်ထားရင် အလိုအလျောက် login ဝင်ပါလိမ့်မယ်

## Setup SSH Key-based Authentication (Recommended)

Password မမေးစေဖို့ SSH key-based authentication setup လုပ်ဖို့ အကြံပြုပါတယ်:

\`\`\`bash
# Generate SSH key (if you don't have one)
ssh-keygen -t rsa -b 4096

# Copy public key to robot
ssh-copy-id robot@192.168.1.100

# Test connection
ssh robot@192.168.1.100
\`\`\`

## Troubleshooting

**Problem:** "Sync failed" error တက်တယ်
- Robot ကို network ကနေ reach လုပ်လို့ရလား စစ်ပါ (\`ping 192.168.1.100\`)
- SSH connection ကောင်းလား စစ်ပါ (\`ssh robot@192.168.1.100\`)
- rsync installed ရှိလား စစ်ပါ (\`which rsync\`)

**Problem:** Password အမြဲမေးနေတယ်
- SSH key-based authentication setup လုပ်ပါ (အပေါ်က Setup section ကိုကြည့်ပါ)

**Problem:** Some files are not syncing
- \`excludePatterns\` settings ကို စစ်ပါ
- Output channel ("Robot Code Sync") မှာ detailed logs ကိုကြည့်ပါ

## Development

Extension ကို local မှာ test လုပ်ချင်ရင်:

1. Clone the repository
2. \`npm install\` run ပါ
3. \`F5\` နှိပ်ပြီး extension development host ဖွင့်ပါ

## License

MIT

## Author

Created for robot development workflow မြန်ဆန်လွယ်ကူအောင် ရည်ရွယ်ပြီး ရေးထားပါတယ်။

---

**Enjoy coding with robots! 🤖**
