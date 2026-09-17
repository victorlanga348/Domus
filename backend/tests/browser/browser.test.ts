import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createServer, Server as HttpServer } from 'http';
import { spawn, ChildProcess } from 'child_process';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { app } from '../../src/app.js';
import { initSocketServer } from '../../src/shared/socket/socketServer.js';
import { prisma } from '../../src/database/prisma.js';

describe('Testes de Navegador E2E (Chromium Headless / CDP)', () => {
  let backendServer: HttpServer;
  let frontendServer: HttpServer;
  let chromeProcess: ChildProcess;
  let cdpWs: WebSocket;
  let cdpMsgId = 1;
  const pendingCdpResolvers = new Map<number, (res: any) => void>();
  let tempProfileDir: string = '';

  const BACKEND_PORT = 3333;
  const FRONTEND_PORT = 3002;
  const CDP_PORT = 9240;

  const timestamp = Date.now();
  const testUserEmail = `browser_test_${timestamp}@domus.test`;
  const testUserName = 'Carlos Browser';
  const testPassword = 'Password123!';
  const testHouseName = `República Teste ${timestamp}`;

  let createdHouseId: string = '';

  function sendCdp(method: string, params: any = {}): Promise<any> {
    return new Promise((resolve) => {
      const id = cdpMsgId++;
      pendingCdpResolvers.set(id, resolve);
      cdpWs.send(JSON.stringify({ id, method, params }));
    });
  }

  async function evaluate(expression: string): Promise<any> {
    const res = await sendCdp('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });
    if (res?.result?.exceptionDetails) {
      throw new Error(JSON.stringify(res.result.exceptionDetails));
    }
    return res?.result?.result?.value;
  }

  async function waitForCondition(
    fnExpression: string,
    timeoutMs = 9000,
    intervalMs = 150
  ): Promise<any> {
    const startTime = Date.now();
    while (Date.now() - startTime < timeoutMs) {
      try {
        const val = await evaluate(fnExpression);
        if (val) return val;
      } catch {}
      await new Promise((r) => setTimeout(r, intervalMs));
    }
    throw new Error(`Timeout esperando condição: ${fnExpression}`);
  }

  before(async () => {
    // 1. Iniciar Servidor Backend na porta 3333
    backendServer = createServer(app);
    initSocketServer(backendServer);
    await new Promise<void>((resolve) => {
      backendServer.listen(BACKEND_PORT, '127.0.0.1', () => resolve());
    });

    // 2. Iniciar Servidor de Arquivos Estáticos para frontend/dist na porta 3002
    const distPath = path.resolve(process.cwd(), '../frontend/dist');
    assert.ok(fs.existsSync(distPath), 'Diretório frontend/dist deve existir');

    frontendServer = createServer((req, res) => {
      const rawUrl = req.url?.split('?')[0] || '/';
      let filePath = path.join(distPath, rawUrl === '/' ? 'index.html' : rawUrl);
      if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
        filePath = path.join(distPath, 'index.html');
      }

      const ext = path.extname(filePath);
      const contentTypes: Record<string, string> = {
        '.html': 'text/html; charset=utf-8',
        '.js': 'application/javascript; charset=utf-8',
        '.css': 'text/css; charset=utf-8',
        '.svg': 'image/svg+xml',
        '.json': 'application/json',
        '.png': 'image/png',
        '.ico': 'image/x-icon',
      };

      try {
        const data = fs.readFileSync(filePath);
        res.writeHead(200, { 'Content-Type': contentTypes[ext] || 'application/octet-stream' });
        res.end(data);
      } catch {
        res.writeHead(404);
        res.end('Not found');
      }
    });

    await new Promise<void>((resolve) => {
      frontendServer.listen(FRONTEND_PORT, '127.0.0.1', () => resolve());
    });

    // 3. Criar perfil temporário isolado para Chromium
    tempProfileDir = path.join(os.tmpdir(), `domus_browser_test_${Date.now()}`);
    fs.mkdirSync(tempProfileDir, { recursive: true });

    const chromePath = fs.existsSync('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe')
      ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
      : 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

    chromeProcess = spawn(chromePath, [
      '--headless=new',
      `--remote-debugging-port=${CDP_PORT}`,
      `--user-data-dir=${tempProfileDir}`,
      '--disable-gpu',
      '--no-sandbox',
      '--disable-extensions',
      'about:blank',
    ]);

    // 4. Conectar ao WebSocket do alvo 'page'
    let wsDebuggerUrl = '';
    for (let i = 0; i < 25; i++) {
      try {
        const resp = await fetch(`http://127.0.0.1:${CDP_PORT}/json/list`);
        const pages = await resp.json();
        const pageTarget = pages.find((p: any) => p.type === 'page');
        if (pageTarget?.webSocketDebuggerUrl) {
          wsDebuggerUrl = pageTarget.webSocketDebuggerUrl;
          break;
        }
      } catch {}
      await new Promise((r) => setTimeout(r, 200));
    }
    assert.ok(wsDebuggerUrl, 'CDP WebSocket URL de página deve ser obtida com sucesso');

    cdpWs = new WebSocket(wsDebuggerUrl);
    await new Promise<void>((resolve, reject) => {
      cdpWs.onopen = () => resolve();
      cdpWs.onerror = (err) => reject(err);
    });

    cdpWs.onmessage = (evt) => {
      try {
        const msg = JSON.parse(evt.data.toString());
        if (msg.id && pendingCdpResolvers.has(msg.id)) {
          const resolve = pendingCdpResolvers.get(msg.id)!;
          pendingCdpResolvers.delete(msg.id);
          resolve(msg);
        }
      } catch {}
    };

    await sendCdp('Page.enable');
    await sendCdp('Runtime.enable');
  });

  after(async () => {
    try {
      if (cdpWs) cdpWs.close();
      if (chromeProcess) chromeProcess.kill();
      if (frontendServer) await new Promise<void>((r) => frontendServer.close(() => r()));
      if (backendServer) await new Promise<void>((r) => backendServer.close(() => r()));

      await new Promise((r) => setTimeout(r, 400));
      if (tempProfileDir && fs.existsSync(tempProfileDir)) {
        try {
          fs.rmSync(tempProfileDir, { recursive: true, force: true });
        } catch {}
      }

      if (createdHouseId) {
        await prisma.activityLog.deleteMany({ where: { house_id: createdHouseId } });
        await prisma.houseMember.deleteMany({ where: { house_id: createdHouseId } });
        await prisma.task.deleteMany({ where: { house_id: createdHouseId } });
        await prisma.house.deleteMany({ where: { id: createdHouseId } });
      }
      await prisma.user.deleteMany({ where: { email: testUserEmail } });
    } catch (err) {
      console.warn('Aviso no cleanup de testes de navegador:', err);
    }
  });

  it('1. Carregamento do Shell & Zero-Latency FCP: Valida tags assíncronas e render inicial sem tela branca', async () => {
    await sendCdp('Page.navigate', { url: `http://127.0.0.1:${FRONTEND_PORT}/` });

    // Aguardar página carregar
    await waitForCondition(`document.readyState === 'complete'`, 10000);

    // Validar carregamento assíncrono de CSS no <head> para evitar render-blocking
    const hasAsyncFonts = await evaluate(`
      Array.from(document.querySelectorAll('link[rel="stylesheet"]')).some(l => 
        l.href.includes('fonts.googleapis.com') || l.getAttribute('media') === 'all'
      )
    `);
    assert.ok(hasAsyncFonts, 'Fontes externas devem conter configuração de carregamento não-bloqueante');

    // Validar que o elemento #root existe e renderizou conteúdo
    const rootHasContent = await waitForCondition(
      `Boolean(document.getElementById('root')?.innerHTML.length > 50)`,
      6000
    );
    assert.ok(rootHasContent, '#root deve renderizar conteúdo sem travar em tela branca');
  });

  it('2. Fluxo de Autenticação / Registro no Navegador: Cria morador e sessão JWT', async () => {
    // Alternar para aba de Criar Conta
    await evaluate(`
      const tabs = Array.from(document.querySelectorAll('button'));
      const registerTab = tabs.find(b => b.textContent && b.textContent.trim() === 'Criar Conta');
      if (registerTab) registerTab.click();
    `);

    await new Promise((r) => setTimeout(r, 400));

    // Preencher campos de registro no formulário utilizando setter nativo do React
    await evaluate(`
      function setReactInput(input, val) {
        const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        setter.call(input, val);
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }

      const nameInput = document.querySelector('input[placeholder*="Victor Langa"]') || document.querySelector('input[type="text"]');
      const emailInput = document.querySelector('input[type="email"]');
      const passInput = document.querySelector('input[type="password"]');

      if (nameInput) setReactInput(nameInput, '${testUserName}');
      if (emailInput) setReactInput(emailInput, '${testUserEmail}');
      if (passInput) setReactInput(passInput, '${testPassword}');
    `);

    await new Promise((r) => setTimeout(r, 200));

    // Clicar no botão de submissão do formulário
    await evaluate(`
      const submitBtn = document.querySelector('button[type="submit"]') || 
        Array.from(document.querySelectorAll('button')).find(b => b.textContent?.includes('Criar Conta'));
      if (submitBtn) submitBtn.click();
    `);

    // Aguardar transição para a tela de Seleção / Criação de Residência
    const navigatedToHouseSelection = await waitForCondition(`
      document.body.innerText.includes('Escolha uma Residência') || 
      document.body.innerText.includes('Criar Nova Residência') ||
      Boolean(localStorage.getItem('domus_auth_token'))
    `, 9000);

    assert.ok(navigatedToHouseSelection, 'Navegador deve concluir autenticação e navegar para HouseSelectionView');
  });

  it('3. Criação de Residência: Funda a residência e entra no Dashboard/Mural de Recados', async () => {
    // Preencher formulário de criação de residência
    await evaluate(`
      function setReactInput(input, val) {
        const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        setter.call(input, val);
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }
      const houseInput = document.querySelector('input[placeholder*="Alameda"]') || document.querySelector('input[placeholder*="ex:"]');
      if (houseInput) {
        setReactInput(houseInput, '${testHouseName}');
      }
    `);

    await new Promise((r) => setTimeout(r, 200));

    // Clicar no botão de Criar Residência
    await evaluate(`
      const createBtn = Array.from(document.querySelectorAll('button')).find(b => 
        b.textContent?.includes('Criar Residência')
      );
      if (createBtn) createBtn.click();
    `);

    // Aguardar renderização do Dashboard principal da casa
    const onDashboard = await waitForCondition(`
      document.body.innerText.includes('Mural de Recados') || 
      document.body.innerText.includes('Total de Moradores')
    `, 9000);

    assert.ok(onDashboard, 'Usuário deve ser redirecionado para o Dashboard com Mural de Recados');

    // Salvar ID da residência atual criada para limpeza posterior
    const houseDataJson = await evaluate(`localStorage.getItem('domus_auth_house')`);
    if (houseDataJson) {
      const parsed = JSON.parse(houseDataJson);
      createdHouseId = parsed.id;
    }
  });

  it('4. Troca de Casa pelo Botão do Prédio (Página de Recados): Não deve piscar de volta e deve abrir HouseSelectionView', async () => {
    // Confirmar que está na página de recados
    const onRecados = await evaluate(`
      document.body.innerText.includes('Mural de Recados')
    `);
    assert.ok(onRecados, 'Usuário deve estar na página de recados');

    // Localizar e clicar no botão de trocar residência (ícone "apartment") no Header
    const clickedApartmentButton = await evaluate(`
      (() => {
        const aptBtn = document.querySelector('button[title*="Trocar"]') || 
                       Array.from(document.querySelectorAll('button')).find(b => b.innerHTML.includes('apartment'));
        if (aptBtn) {
          aptBtn.click();
          return true;
        }
        return false;
      })()
    `);
    assert.ok(clickedApartmentButton, 'Botão com ícone de prédio no cabeçalho deve ser clicável');

    // Aguardar e verificar que navegou para HouseSelectionView
    const inHouseSelection = await waitForCondition(`
      document.body.innerText.includes('Escolha uma Residência') || 
      document.body.innerText.includes('Criar Nova Residência')
    `, 5000);
    assert.ok(inHouseSelection, 'Deve navegar imediatamente para HouseSelectionView');

    // Ponto Crítico da Validação: Aguardar 1.5s e confirmar que NÃO ocorreu o "piscar de volta" para o Dashboard
    await new Promise((r) => setTimeout(r, 1500));

    const stillInHouseSelection = await evaluate(`
      document.body.innerText.includes('Escolha uma Residência') || 
      document.body.innerText.includes('Criar Nova Residência')
    `);
    assert.ok(stillInHouseSelection, 'Interface NÃO deve ressuscitar a residência anterior nem retornar indevidamente para o Dashboard');
  });

  it('5. Alternância Suave de Abas & Troca de Casa pelas Configurações', async () => {
    // Re-acessar a residência atual através do card de Minhas Residências
    await evaluate(`
      const accessBtn = Array.from(document.querySelectorAll('button')).find(b => 
        b.textContent?.includes('Continuar') || b.textContent?.includes('Acessar')
      );
      if (accessBtn) accessBtn.click();
    `);

    await waitForCondition(`document.body.innerText.includes('Mural de Recados')`, 6000);

    // Navegar para a aba de Configurações via Sidebar
    await evaluate(`
      const settingsNav = Array.from(document.querySelectorAll('button, a')).find(el => 
        el.textContent?.includes('Configurações')
      );
      if (settingsNav) settingsNav.click();
    `);

    // Validar chegada à tela de Configurações
    const onSettings = await waitForCondition(`
      document.body.innerText.includes('Regras da Residência') || 
      document.body.innerText.includes('Trocar Residência')
    `, 6000);
    assert.ok(onSettings, 'Navegação para Configurações deve ocorrer de forma suave');

    // Clicar no botão "Trocar Residência" nas Configurações
    await evaluate(`
      const switchBtn = Array.from(document.querySelectorAll('button')).find(b => 
        b.textContent?.includes('Trocar Residência')
      );
      if (switchBtn) switchBtn.click();
    `);

    // Validar retorno consistente a HouseSelectionView
    const backInHouseSelection = await waitForCondition(`
      document.body.innerText.includes('Escolha uma Residência') || 
      document.body.innerText.includes('Criar Nova Residência')
    `, 6000);
    assert.ok(backInHouseSelection, 'Botão de troca de residência nas Configurações deve navegar com sucesso');
  });
});
