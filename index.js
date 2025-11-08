const core = require('@actions/core');
const client = require('@nemerosa/ontrack-github-actions-module-install');

(async () => {
    try {
        await setup();
    } catch (error) {
        core.setFailed(error.message);
    }
})();

async function setup() {

    let url = core.getInput('url');
    if (!url) {
        url = process.env.YONTRACK_URL;
    }
    let token = core.getInput('token');
    if (!token) {
        token = process.env.YONTRACK_TOKEN;
    }

    // Installing and configuring the CLI
    const {version, dir} = await client.install({
        version: core.getInput('version'),
        githubToken: core.getInput('github-token'),
        acceptDraft: false,
        logging: true,
        yontrackUrl: url,
        yontrackToken: token,
        yontrackUser: core.getInput('cli-config'),
        connRetryCount: core.getInput('conn-retry-count'),
        connRetryWait: core.getInput('conn-retry-wait'),
    })

    core.setOutput('installed', version);
    core.addPath(dir)
    core.info(`Yontrack CLI version ${version} installed`);
}
