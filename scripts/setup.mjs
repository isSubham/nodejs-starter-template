#!/usr/bin/env node
// One-time setup for a project generated from this template: renames the
// package, retargets README/LICENSE to the new owner, then deletes itself.

import { createInterface } from 'node:readline';
import { readFileSync, writeFileSync, unlinkSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, basename } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const OLD_OWNER_REPO = 'isSubham/nodejs-starter-template';
const OLD_REPO_NAME = 'nodejs-starter-template';

function slugify(input) {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function toTitleCase(slug) {
  return slug
    .split('-')
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(' ');
}

function applyChanges({ projectName, description, authorName, githubUser }) {
  const ownerRepo = `${githubUser}/${projectName}`;

  // package.json
  const pkgPath = join(root, 'package.json');
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
  pkg.name = projectName;
  pkg.description = description;
  if (authorName) pkg.author = authorName;
  delete pkg.scripts.setup;
  writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');

  // README.md
  const readmePath = join(root, 'README.md');
  let readme = readFileSync(readmePath, 'utf8');
  readme = readme.split(OLD_OWNER_REPO).join(ownerRepo);
  readme = readme.split(OLD_REPO_NAME).join(projectName);
  readme = readme.replace(/^# Node\.js Starter Template$/m, `# ${toTitleCase(projectName)}`);
  if (authorName) {
    readme = readme.replace(
      /## Author\n\n\*\*.*?\*\*\n\n(\[!\[.*?\]\(.*?\)\]\(.*?\)\n)+/,
      `## Author\n\n**${authorName}**\n\n` +
        `[![GitHub](https://img.shields.io/badge/GitHub-${githubUser}-181717?style=flat&logo=github)](https://github.com/${githubUser})\n\n`,
    );
  }
  writeFileSync(readmePath, readme);

  // LICENSE
  if (authorName) {
    const licensePath = join(root, 'LICENSE');
    const license = readFileSync(licensePath, 'utf8').replace(
      /Copyright \(c\) \d{4} .+/,
      `Copyright (c) ${new Date().getFullYear()} ${authorName}`,
    );
    writeFileSync(licensePath, license);
  }

  // Remove this script now that it's done its job
  unlinkSync(fileURLToPath(import.meta.url));

  console.log('\nDone. Next steps:');
  console.log('  1. cp .env.example .env   # fill in DATABASE_URL, JWT secrets');
  console.log('  2. npm run db:migrate && npm run db:seed');
  console.log('  3. npm run dev');
}

console.log('Setting up your project from nodejs-starter-template.\n');

const rl = createInterface({ input: process.stdin, output: process.stdout });
const answers = {};
const defaultName = slugify(basename(root));

// A recursive callback chain (rather than async/await over rl.question)
// because piped/non-interactive stdin can emit its 'close' event between
// awaited questions, silently aborting the remaining prompts.
const steps = [
  { key: 'projectName', prompt: `Project name (${defaultName}): `, fallback: defaultName, transform: slugify },
  {
    key: 'description',
    prompt: 'Short description (Production-grade Node.js + TypeScript + Prisma + JWT REST API): ',
    fallback: 'Production-grade Node.js + TypeScript + Prisma + JWT REST API',
  },
  { key: 'authorName', prompt: 'Author name: ', fallback: '' },
  { key: 'githubUser', prompt: 'GitHub username or org (your-username): ', fallback: 'your-username' },
];

function next(i) {
  if (i >= steps.length) {
    rl.close();
    applyChanges(answers);
    return;
  }
  const step = steps[i];
  rl.question(step.prompt, (raw) => {
    const value = raw.trim() || step.fallback;
    answers[step.key] = step.transform ? step.transform(value) || step.fallback : value;
    next(i + 1);
  });
}

next(0);
