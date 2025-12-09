import subprocess

def run(cmd):
    return subprocess.check_output(cmd, shell=True, text=True).strip()

try:
    # Ambil status git dalam format mudah dibaca
    status = run("git status --porcelain")

    if not status:
        print("Tidak ada perubahan yang perlu di-commit.")
        exit()

    # Format mirip yang kamu mau: "modified: file" atau "new file: file"
    commit_lines = []
    for line in status.split("\n"):
        code = line[:2].strip()
        file = line[3:].strip()

        if code == "M":
            commit_lines.append(f"modified:   {file}")
        elif code == "A":
            commit_lines.append(f"new file:   {file}")
        elif code == "??":
            commit_lines.append(f"new file:   {file}")

    commit_message = "\n".join(commit_lines)

    print("Commit message:")
    print(commit_message)
    print("-" * 40)

    # Jalankan git add .
    print("Menjalankan: git add .")
    run("git add .")

    # Commit
    print("Menjalankan git commit ...")
    run(f'git commit -m "{commit_message}"')

    # Push
    print("Push ke GitHub...")
    run("git push")

    # Deploy global commands
    print("Menjalankan node deploy-global-command.js ...")
    run("node deploy-global-command.js")

    print("\nSUKSES 🚀 Semua proses selesai.")
except subprocess.CalledProcessError as e:
    print("Terjadi error:")
    print(e.output)
