#!/usr/bin/env node

import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, resolve, relative } from 'path';
import { existsSync, readFileSync } from 'fs';

// Simulate __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get current working dir (where pnpm command was called)
const cwd = process.cwd();
const root = resolve(__dirname, '..');

const configPath = `${cwd}/.infisical.json`;

const isExists = existsSync(configPath);
const projectPath = isExists ? relative(root, cwd) : root;

if (!isExists) {
  console.error('No .infisical.json file found');
  process.exit(0);
}

const infisicalConfig = JSON.parse(
  readFileSync(`${cwd}/.infisical.json`, 'utf-8')
);

const VAULT_DOMAIN = infisicalConfig.domain;
const PROJECT_ID = infisicalConfig.workspaceId;

const COMMAND = process.argv.slice(2).join(' ');
const ENV = process.env.APP_ENV || 'dev';

if (!COMMAND) {
  console.error('No command provided to infisical-wrapper');
  process.exit(1);
}

const relativePath = relative(root, cwd);

console.log(`🔐 Injecting secrets for: ${relativePath}`);
console.log(`> Command: ${COMMAND}`);
console.log(`> Env: ${ENV}`);
console.log(`> Project Path: ${projectPath}`);

execSync(
  `infisical run --path=/${relativePath} --env=${ENV} --projectId=${PROJECT_ID} --domain=${VAULT_DOMAIN} -- pnpm ${COMMAND}`,
  { stdio: 'inherit', cwd }
);
