#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

const isWindows = process.platform === 'win32';
const npmCmd = isWindows ? 'npm.cmd' : 'npm';

const services = [
  {
    name: '2/6] Product Service',
    path: 'services/product-service',
    deps: ['@nestjs/common', '@nestjs/core', '@nestjs/platform-express', '@nestjs/config', '@nestjs/typeorm', 'typeorm', 'pg', '@nestjs/swagger', 'swagger-ui-express', 'class-validator', 'class-transformer', 'reflect-metadata', 'rxjs', '@nestjs/axios', 'axios'],
    devDeps: ['@nestjs/cli', 'typescript', '@types/node', 'ts-node']
  },
  {
    name: '[3/6] Order Service',
    path: 'services/order-service',
    deps: ['@nestjs/common', '@nestjs/core', '@nestjs/platform-express', '@nestjs/config', '@nestjs/typeorm', 'typeorm', 'pg', '@nestjs/axios', 'axios', 'class-validator', 'class-transformer', 'reflect-metadata', 'rxjs'],
    devDeps: ['@nestjs/cli', 'typescript', '@types/node', 'ts-node']
  },
  {
    name: '[4/6] Admin Service',
    path: 'services/admin-service',
    deps: ['@nestjs/common', '@nestjs/core', '@nestjs/platform-express', '@nestjs/config', '@nestjs/typeorm', 'typeorm', 'pg', '@nestjs/swagger', 'swagger-ui-express', 'class-validator', 'class-transformer', 'reflect-metadata', 'rxjs'],
    devDeps: ['@nestjs/cli', 'typescript', '@types/node', 'ts-node']
  },
  {
    name: '[5/6] Customer Service',
    path: 'services/customer-service',
    deps: ['@nestjs/common', '@nestjs/core', '@nestjs/platform-express', '@nestjs/config', '@nestjs/typeorm', 'typeorm', 'pg', '@nestjs/swagger', 'swagger-ui-express', 'class-validator', 'class-transformer', 'bcrypt', 'reflect-metadata', 'rxjs'],
    devDeps: ['@nestjs/cli', 'typescript', '@types/node', 'ts-node', '@types/bcrypt']
  },
  {
    name: '[6/6] Notification Service',
    path: 'services/notification-service',
    deps: ['@nestjs/common', '@nestjs/core', '@nestjs/platform-express', '@nestjs/config', '@nestjs/typeorm', 'typeorm', 'pg', '@nestjs/swagger', 'swagger-ui-express', 'class-validator', 'class-transformer', 'nodemailer', 'twilio', 'web-push', 'reflect-metadata', 'rxjs'],
    devDeps: ['@nestjs/cli', 'typescript', '@types/node', 'ts-node', '@types/nodemailer', '@types/web-push']
  }
];

// Build shared first
console.log('[1/6] Building Shared Library...');
execSync(`${npmCmd} install`, { cwd: 'shared', stdio: 'inherit' });
execSync(`${npmCmd} run build`, { cwd: 'shared', stdio: 'inherit' });

// Install all services
for (const service of services) {
  console.log(`\n[${service.name}] Setting up...`);
  const fullPath = path.join(__dirname, service.path);
  
  execSync(`${npmCmd} install ${service.deps.join(' ')}`, { cwd: fullPath, stdio: 'inherit' });
  execSync(`${npmCmd} install -D ${service.devDeps.join(' ')}`, { cwd: fullPath, stdio: 'inherit' });
  execSync(`${npmCmd} install ../../shared`, { cwd: fullPath, stdio: 'inherit' });
  
  console.log(`[OK] ${service.name} ready`);
}

console.log('\n✅ All 6 services installed successfully!');