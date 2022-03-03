module.exports = {
  branches: ["master"],
  plugins: [
    [
      "@semantic-release/commit-analyzer",
      {
        preset: "conventionalcommits",
      },
    ],
    "@semantic-release/release-notes-generator",
    "@semantic-release/changelog",
    [
      "@semantic-release/npm",
      {
        npmPublish: false,
      },
    ],
    "@semantic-release/git",
    [
      "@semantic-release/exec",
      {
        prepareCmd:
          "echo \"VERSION=${nextRelease.version}\" > .env.production.local && pnpm build",
      },
    ],
    [
      "@semantic-release/exec",
      {
        prepareCmd:
          "zip -qq -r logseq-plugin-my-highlights-${nextRelease.version}.zip dist docs icon.svg readme.md LICENSE package.json",
      },
    ],
    [
      "@semantic-release/github",
      {
        assets: "logseq-plugin-my-highlights-*.zip",
      },
    ],
  ],
};
