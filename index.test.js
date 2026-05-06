jest.mock('@nemerosa/ontrack-github-actions-module-install', () => ({
    install: jest.fn(),
}));

const { runAction } = require('./index');
const moduleInstall = require('@nemerosa/ontrack-github-actions-module-install');

function makeCore(inputs = {}) {
    return {
        getInput: jest.fn((name) => (name in inputs ? inputs[name] : '')),
        setOutput: jest.fn(),
        addPath: jest.fn(),
        info: jest.fn(),
        setFailed: jest.fn(),
    };
}

function makeClient({ version = '5.0.0', dir = '/tmp/yt' } = {}) {
    return { install: jest.fn().mockResolvedValue({ version, dir }) };
}

beforeEach(() => {
    delete process.env.YONTRACK_URL;
    delete process.env.YONTRACK_TOKEN;
    moduleInstall.install.mockReset();
});

describe('runAction — input handling', () => {
    test('passes url/token inputs to client.install', async () => {
        const core = makeCore({ url: 'https://yt.example', token: 'tok123' });
        const client = makeClient();
        await runAction({ core, client });
        expect(client.install).toHaveBeenCalledWith(expect.objectContaining({
            yontrackUrl: 'https://yt.example',
            yontrackToken: 'tok123',
        }));
    });

    test('falls back to YONTRACK_URL/YONTRACK_TOKEN env when inputs are empty', async () => {
        process.env.YONTRACK_URL = 'https://yt.env';
        process.env.YONTRACK_TOKEN = 'env-tok';
        const core = makeCore();
        const client = makeClient();
        await runAction({ core, client });
        expect(client.install).toHaveBeenCalledWith(expect.objectContaining({
            yontrackUrl: 'https://yt.env',
            yontrackToken: 'env-tok',
        }));
    });

    test('input url/token take precedence over env vars', async () => {
        process.env.YONTRACK_URL = 'https://yt.env';
        process.env.YONTRACK_TOKEN = 'env-tok';
        const core = makeCore({ url: 'https://yt.input', token: 'input-tok' });
        const client = makeClient();
        await runAction({ core, client });
        expect(client.install).toHaveBeenCalledWith(expect.objectContaining({
            yontrackUrl: 'https://yt.input',
            yontrackToken: 'input-tok',
        }));
    });

    test('passes version/githubToken/cli-config/connRetry* to client.install', async () => {
        const core = makeCore({
            version: '5.0.0',
            'github-token': 'gh',
            'cli-config': 'admin',
            'conn-retry-count': '5',
            'conn-retry-wait': '10',
        });
        const client = makeClient();
        await runAction({ core, client });
        expect(client.install).toHaveBeenCalledWith(expect.objectContaining({
            version: '5.0.0',
            githubToken: 'gh',
            yontrackUser: 'admin',
            connRetryCount: '5',
            connRetryWait: '10',
            acceptDraft: false,
            logging: true,
        }));
    });
});

describe('runAction — outputs and PATH', () => {
    test('sets installed output to the version returned by client', async () => {
        const core = makeCore();
        const client = makeClient({ version: '5.2.1' });
        await runAction({ core, client });
        expect(core.setOutput).toHaveBeenCalledWith('installed', '5.2.1');
    });

    test('adds dir to PATH', async () => {
        const core = makeCore();
        const client = makeClient({ dir: '/custom/yt-dir' });
        await runAction({ core, client });
        expect(core.addPath).toHaveBeenCalledWith('/custom/yt-dir');
    });

    test('logs the installed version', async () => {
        const core = makeCore();
        const client = makeClient({ version: '5.3.0' });
        await runAction({ core, client });
        expect(core.info).toHaveBeenCalledWith(expect.stringContaining('5.3.0'));
    });
});
