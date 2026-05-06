const client = require('@nemerosa/ontrack-github-actions-module-install');

async function runAction({ core, client: clientDep }) {
    let url = core.getInput('url');
    if (!url) {
        url = process.env.YONTRACK_URL;
    }
    let token = core.getInput('token');
    if (!token) {
        token = process.env.YONTRACK_TOKEN;
    }

    const { version, dir } = await clientDep.install({
        version: core.getInput('version'),
        githubToken: core.getInput('github-token'),
        acceptDraft: false,
        logging: true,
        yontrackUrl: url,
        yontrackToken: token,
        yontrackUser: core.getInput('cli-config'),
        connRetryCount: core.getInput('conn-retry-count'),
        connRetryWait: core.getInput('conn-retry-wait'),
    });

    core.setOutput('installed', version);
    core.addPath(dir);
    core.info(`Yontrack CLI version ${version} installed`);
}

module.exports = { runAction };

if (process.env.NODE_ENV !== 'test') {
    (async () => {
        const core = await import('@actions/core');
        try {
            await runAction({ core, client });
        } catch (error) {
            core.setFailed(error.message);
        }
    })();
}
