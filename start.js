#!/usr/bin/env node

/**
 * Cross-platform startup script for TapIn Admin Dashboard
 * Runs both backend and frontend servers concurrently
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkCommand(command) {
  try {
    require('child_process').execSync(`which ${command}`, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function checkPort(port) {
  return new Promise((resolve) => {
    const net = require('net');
    const server = net.createServer();
    server.listen(port, () => {
      server.once('close', () => resolve(false));
      server.close();
    });
    server.on('error', () => resolve(true));
  });
}

// Cleanup function
let processes = [];

function cleanup() {
  log('\nShutting down services...', 'yellow');
  processes.forEach((proc) => {
    try {
      proc.kill('SIGTERM');
    } catch (e) {
      // Ignore errors
    }
  });
  setTimeout(() => {
    processes.forEach((proc) => {
      try {
        proc.kill('SIGKILL');
      } catch (e) {
        // Ignore errors
      }
    });
    process.exit(0);
  }, 2000);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

async function main() {
  log('========================================', 'blue');
  log('  TapIn Admin Dashboard - Startup', 'blue');
  log('========================================', 'blue');
  console.log('');

  // Check prerequisites
  log('Checking prerequisites...', 'yellow');

  if (!checkCommand('node')) {
    log('✗ Node.js is not installed. Please install Node.js first.', 'red');
    process.exit(1);
  }
  log(`✓ Node.js found: ${process.version}`, 'green');

  if (!checkCommand('python3')) {
    log('✗ Python 3 is not installed. Please install Python 3 first.', 'red');
    process.exit(1);
  }
  log(`✓ Python found`, 'green');

  console.log('');

  // Check ports
  const backendPortInUse = await checkPort(8001);
  const frontendPortInUse = await checkPort(3000);

  if (backendPortInUse) {
    log('⚠ Port 8001 is already in use. Backend may not start correctly.', 'yellow');
  }

  if (frontendPortInUse) {
    log('⚠ Port 3000 is already in use. Frontend may not start correctly.', 'yellow');
  }

  console.log('');

  // Start Backend
  log('Starting Backend Server...', 'blue');
  const backendDir = path.join(__dirname, 'backend');

  // Check virtual environment
  const venvPath = path.join(backendDir, 'venv');
  if (!fs.existsSync(venvPath)) {
    log('⚠ Virtual environment not found. Creating one...', 'yellow');
    const venvProc = spawn('python3', ['-m', 'venv', 'venv'], {
      cwd: backendDir,
      stdio: 'inherit',
    });
    await new Promise((resolve) => venvProc.on('close', resolve));
    log('✓ Virtual environment created', 'green');
  }

  // Check dependencies
  const uvicornPath = path.join(venvPath, 'bin', 'uvicorn');
  if (!fs.existsSync(uvicornPath)) {
    log('⚠ Dependencies not installed. Installing...', 'yellow');
    const pipProc = spawn(
      path.join(venvPath, 'bin', 'pip'),
      ['install', '-r', 'requirements.txt'],
      {
        cwd: backendDir,
        stdio: 'inherit',
      }
    );
    await new Promise((resolve) => pipProc.on('close', resolve));
    log('✓ Dependencies installed', 'green');
  }

  // Check .env file
  const backendEnvPath = path.join(backendDir, '.env');
  if (fs.existsSync(backendEnvPath)) {
    log('✓ Found backend/.env file', 'green');
  } else {
    log('⚠ No backend/.env file found. Using default values.', 'yellow');
    log('  Copy backend/.env.example to backend/.env and configure it.', 'yellow');
  }

  // Start backend
  const backendScript = process.platform === 'win32' 
    ? path.join(venvPath, 'Scripts', 'uvicorn.exe')
    : path.join(venvPath, 'bin', 'uvicorn');

  const backendProc = spawn(backendScript, ['server:app', '--reload', '--host', '0.0.0.0', '--port', '8001'], {
    cwd: backendDir,
    stdio: 'inherit',
    shell: false,
  });

  processes.push(backendProc);
  log(`✓ Backend started (PID: ${backendProc.pid})`, 'green');
  console.log('');

  // Wait a bit for backend to start
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Start Frontend
  log('Starting Frontend Server...', 'blue');
  const frontendDir = path.join(__dirname, 'frontend');

  // Check node_modules
  const nodeModulesPath = path.join(frontendDir, 'node_modules');
  if (!fs.existsSync(nodeModulesPath)) {
    log('⚠ Dependencies not installed. Installing...', 'yellow');
    const npmProc = spawn('npm', ['install'], {
      cwd: frontendDir,
      stdio: 'inherit',
    });
    await new Promise((resolve) => npmProc.on('close', resolve));
    log('✓ Dependencies installed', 'green');
  }

  // Check .env file
  const frontendEnvPath = path.join(frontendDir, '.env');
  if (fs.existsSync(frontendEnvPath)) {
    log('✓ Found frontend/.env file', 'green');
  } else {
    log('⚠ No frontend/.env file found. Using default values.', 'yellow');
    log('  Copy frontend/.env.example to frontend/.env and configure it.', 'yellow');
  }

  // Start frontend
  const frontendProc = spawn('npm', ['start'], {
    cwd: frontendDir,
    stdio: 'inherit',
    shell: true,
  });

  processes.push(frontendProc);
  log(`✓ Frontend started (PID: ${frontendProc.pid})`, 'green');
  console.log('');

  // Wait a bit for frontend to start
  await new Promise((resolve) => setTimeout(resolve, 3000));

  console.log('');
  log('========================================', 'green');
  log('  Services are starting up!', 'green');
  log('========================================', 'green');
  console.log('');
  log('Backend:  http://localhost:8001', 'blue');
  log('Frontend: http://localhost:3000', 'blue');
  log('API Docs: http://localhost:8001/docs', 'blue');
  console.log('');
  log('Press Ctrl+C to stop all services', 'yellow');
  console.log('');

  // Keep the script running
  await new Promise(() => {});
}

main().catch((error) => {
  log(`Error: ${error.message}`, 'red');
  cleanup();
  process.exit(1);
});

