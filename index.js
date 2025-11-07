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

    // Installing and configuring the CLI
    const {version, dir} = await client.install({
        version: core.getInput('version'),
        githubToken: core.getInput('github-token'),
        acceptDraft: false,
        logging: true,
        yontrackUrl: core.getInput('url'),
        yontrackToken: core.getInput('token'),
        connRetryCount: core.getInput('conn-retry-count'),
        connRetryWait: core.getInput('conn-retry-wait'),
    })

    core.setOutput('installed', version);
    core.addPath(dir)
    core.info(`Yontrack CLI version ${version} installed`);
}
