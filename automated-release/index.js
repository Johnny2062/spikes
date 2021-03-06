const Github = require('github-release')
const Artifacts = require('artifact-collect')
const GitBranch = require('git-branch')
const fs = require('fs-extra')

const GITHUB_TOKEN = '1234'
const CLONE_PATH = __dirname + '/tmp/'
const ARTIFACTS_PATH = __dirname + '/outputs/'

const repoOptions = {
    owner: 'novoda',
    name: 'spikes'
}

const branches = {
    fromBranch: 'master',
    intoBranch: 'demo-production'
}

const prOptions = {
    title: 'my awesome release PR',
    body: 'Here\'s all the changes in the release',
    fromBranch: branches.fromBranch,
    intoBranch: branches.intoBranch
}

const releaseOptions = {
    tag: 'v1',
    target: branches.fromBranch,
    title: 'super cool release',
    body: 'this is the release body wooo',
    isDraft: false,
    isPreRelease: false
}

const checkoutOptions = {
    baseBranch: branches.fromBranch,
    newBranch: branches.intoBranch,
    githubToken: GITHUB_TOKEN,
    path: CLONE_PATH,
    repoUrl: `https://github.com/${repoOptions.owner}/${repoOptions.name}.git`
}

const pushOptions = {
    githubToken: GITHUB_TOKEN,
    remote: 'origin',
    commit: {
        authorName: 'mario',
        authorEmail: 'test@novoda.com',
        message: 'upping versions for release'
    }
}

const doRelease = async () => {
    const git = new GitBranch()
    const branchRef = await git.checkout(checkoutOptions)

    // build artifacts and make modifications
    const artifacts = [
        Artifacts.collectFile('./artifacts/single-file/testfile.zip', ARTIFACTS_PATH, 'test-file-1234.zip'),
        Artifacts.collectDirectory('./artifacts/mappings', ARTIFACTS_PATH, 'mappings.zip')
    ]
    fs.writeFileSync('./tmp/testfile.txt', "hello world, release commit content")

    await git.push(branchRef, pushOptions)

    const github = new GithubRelease(GITHUB_TOKEN)
    github.performRelease(repoOptions, prOptions, releaseOptions, artifacts)

    fs.removeSync(CLONE_PATH)
    fs.removeSync(ARTIFACTS_PATH)
}

doRelease.then(console.log).catch(console.log)
