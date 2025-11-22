require("dotenv").config();
const fs = require("fs");
const fetch = require("node-fetch");

const GITHUB_TOKEN = process.env.GH_TOKEN; // GitHub token
const REPO_OWNER = "MohFahmiMc"; // owner repo
const REPO_NAME = "MyDiscordBot"; // nama repo
const UPDATES_FILE = "./data/updates.json"; // simpan updates

async function fetchCommits() {
    try {
        const res = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/commits`, {
            headers: {
                "Authorization": `token ${GITHUB_TOKEN}`,
                "Accept": "application/vnd.github.v3+json",
            },
        });

        if (!res.ok) throw new Error(`GitHub API Error: ${res.status}`);

        const data = await res.json();
        return data.map(commit => ({
            sha: commit.sha,
            message: commit.commit.message,
            author: commit.commit.author.name,
            date: commit.commit.author.date,
            url: commit.html_url,
        }));
    } catch (err) {
        console.error("Failed to fetch commits:", err);
        return [];
    }
}

async function saveUpdates() {
    const commits = await fetchCommits();
    if (commits.length === 0) return;

    let updates = [];
    if (fs.existsSync(UPDATES_FILE)) {
        updates = JSON.parse(fs.readFileSync(UPDATES_FILE));
    }

    commits.forEach(commit => {
        if (!updates.find(u => u.sha === commit.sha)) {
            updates.unshift(commit); // tambahkan di depan
        }
    });

    fs.writeFileSync(UPDATES_FILE, JSON.stringify(updates, null, 2));
    console.log(`✅ Updates saved: ${updates.length} commits`);
}

// Jalankan tiap kali ingin update local file
saveUpdates();
