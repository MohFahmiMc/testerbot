const { Octokit } = require("@octokit/rest");
require("dotenv").config();

const octokit = new Octokit({
    auth: process.env.GH_TOKEN
});

const owner = process.env.GH_USER; // username GitHub
const repo = process.env.GH_REPO; // repository
const branch = "main"; // atau master

async function pushFile(path, content, message) {
    // Cek apakah file ada di repo
    try {
        const { data: fileData } = await octokit.repos.getContent({
            owner,
            repo,
            path,
            ref: branch
        });

        await octokit.repos.createOrUpdateFileContents({
            owner,
            repo,
            path,
            message,
            content: Buffer.from(content).toString("base64"),
            sha: fileData.sha,
            branch
        });
    } catch (err) {
        if (err.status === 404) {
            // Kalau belum ada, buat baru
            await octokit.repos.createOrUpdateFileContents({
                owner,
                repo,
                path,
                message,
                content: Buffer.from(content).toString("base64"),
                branch
            });
        } else {
            throw err;
        }
    }
}

module.exports = { pushFile };
