import subprocess
import os
import sys
import time
import json

# ANSI color codes
class colors:
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKCYAN = '\033[96m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'

def run(cmd, show=True):
    if show:
        print(f"{colors.OKCYAN}>>> Running: {cmd}{colors.ENDC}")
    return subprocess.check_output(cmd, shell=True, text=True, stderr=subprocess.STDOUT).strip()

def progress(message, duration=0.5):
    print(f"{colors.OKBLUE}{message}{colors.ENDC}")
    if duration > 0:
        time.sleep(duration)

try:
    # Change to ~/zephyr
    os.chdir(os.path.expanduser("~/zephyr"))
    progress("📁 Changed directory to ~/zephyr")

    # Get git status
    status = run("git status --porcelain")
    if not status:
        print(f"{colors.WARNING}No changes to commit.{colors.ENDC}")
        sys.exit()

    # Prepare commit message
    commit_lines = []
    for line in status.split("\n"):
        code = line[:2].strip()
        file = line[3:].strip()
        if code == "M":
            commit_lines.append(f"Modified: {file}")
        elif code in ("A", "??"):
            commit_lines.append(f"New file: {file}")

    commit_message = "Update Zephyr Bot:\n" + "\n".join(commit_lines)
    print(f"\n{colors.BOLD}Commit message preview:{colors.ENDC}\n{commit_message}\n{'-'*40}")

    # Git add
    progress("📌 Adding changes...")
    run("git add .")

    # Git commit
    progress("📝 Committing changes...")
    run(f'git commit -m "{commit_message}"')

    # Git push
    progress("🚀 Pushing to GitHub...")
    run("git push")

    # Deploy global commands
    progress("🔧 Deploying global commands...")
    deploy_output = run("node deploy-global-command.js")
    print(deploy_output)

    # Count deployed commands (assuming deploy-global-command.js prints JSON of commands)
    try:
        deployed = json.loads(deploy_output)
        num_commands = len(deployed)
        progress(f"{colors.OKGREEN}✅ Successfully deployed {num_commands} commands!{colors.ENDC}")
    except Exception:
        progress(f"{colors.OKGREEN}✅ Deployment completed!{colors.ENDC}")

except subprocess.CalledProcessError as e:
    print(f"{colors.FAIL}❌ An error occurred:{colors.ENDC}")
    print(e.output)
except Exception as e:
    print(f"{colors.FAIL}❌ Unexpected error: {e}{colors.ENDC}")
