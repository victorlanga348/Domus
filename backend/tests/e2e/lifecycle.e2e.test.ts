import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createServer, Server as HttpServer } from 'http';
import type { AddressInfo } from 'net';
import { app } from '../../src/app.js';
import { initSocketServer } from '../../src/shared/socket/socketServer.js';
import { prisma } from '../../src/database/prisma.js';

describe('Ciclo de Vida Completo da Aplicação (E2E)', () => {
  let httpServer: HttpServer;
  let baseUrl: string;
  let socketUrl: string;

  const timestamp = Date.now();
  const aliceEmail = `test_alice_${timestamp}@domus.test`;
  const bobEmail = `test_bob_${timestamp}@domus.test`;
  const rawPassword = 'Password123!';
  const housePassword = 'senhaSegura123';

  let aliceId: string;
  let aliceToken: string;
  let bobId: string;
  let bobToken: string;
  let houseId: string;
  let inviteCode: string;
  let taskId: string;

  before(async () => {
    httpServer = createServer(app);
    initSocketServer(httpServer);

    await new Promise<void>((resolve) => {
      httpServer.listen(0, '127.0.0.1', () => {
        const address = httpServer.address() as AddressInfo;
        baseUrl = `http://127.0.0.1:${address.port}/api`;
        socketUrl = `http://127.0.0.1:${address.port}`;
        resolve();
      });
    });
  });

  after(async () => {
    // 1. Fechar servidor HTTP
    await new Promise<void>((resolve) => httpServer.close(() => resolve()));

    // 2. Limpeza segura dos registros de teste no banco de dados
    try {
      if (houseId) {
        await prisma.activityLog.deleteMany({ where: { house_id: houseId } });
        await prisma.taskParticipant.deleteMany({
          where: { task: { house_id: houseId } },
        });
        await prisma.task.deleteMany({ where: { house_id: houseId } });
      }

      await prisma.user.deleteMany({
        where: { email: { in: [aliceEmail, bobEmail] } },
      });

      if (houseId) {
        await prisma.house.deleteMany({ where: { id: houseId } });
      }
    } catch (err) {
      console.warn('Aviso na limpeza de dados de teste E2E:', err);
    }
  });

  it('1. Cadastro de Moradores: Deve registrar Alice e Bob e rejeitar e-mail duplicado', async () => {
    // Cadastro de Alice
    const resAlice = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Alice Silva',
        email: aliceEmail,
        password: rawPassword,
        pin: '1234',
      }),
    });
    assert.equal(resAlice.status, 201, 'Cadastro de Alice deve retornar 201');
    const dataAlice = await resAlice.json();
    assert.ok(dataAlice.data.user.id);
    assert.ok(dataAlice.data.token);
    assert.equal(dataAlice.data.user.email, aliceEmail);
    aliceId = dataAlice.data.user.id;
    aliceToken = dataAlice.data.token;

    // Cadastro de Bob
    const resBob = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Bob Santos',
        email: bobEmail,
        password: rawPassword,
        pin: '5678',
      }),
    });
    assert.equal(resBob.status, 201, 'Cadastro de Bob deve retornar 201');
    const dataBob = await resBob.json();
    bobId = dataBob.data.user.id;
    bobToken = dataBob.data.token;

    // Tentativa de duplicidade com e-mail de Alice
    const resDup = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Alice Clone',
        email: aliceEmail,
        password: rawPassword,
        pin: '9999',
      }),
    });
    assert.equal(resDup.status, 409, 'Cadastro duplicado deve retornar 409 Conflict');
  });

  it('2. Login & Autenticação: Deve rejeitar senha errada e autenticar com senha correta', async () => {
    // Senha errada
    const resWrong = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: aliceEmail, password: 'SenhaIncorreta' }),
    });
    assert.equal(resWrong.status, 401, 'Senha incorreta deve retornar 401');

    // Senha correta
    const resLogin = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: aliceEmail, password: rawPassword }),
    });
    assert.equal(resLogin.status, 200, 'Login correto deve retornar 200');
    const loginData = await resLogin.json();
    assert.ok(loginData.data.token);
    assert.equal(loginData.data.user.id, aliceId);
  });

  it('3. Criação de Residência: Alice funda a casa e torna-se Arquiteta Principal (ADMIN)', async () => {
    const resCreate = await fetch(`${baseUrl}/house/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${aliceToken}`,
        'x-user-id': aliceId,
      },
      body: JSON.stringify({
        houseName: `Mansão DOMUS E2E ${timestamp}`,
        housePassword,
        user_id: aliceId,
      }),
    });

    assert.equal(resCreate.status, 201, 'Criação de casa deve retornar 201');
    const createData = await resCreate.json();
    assert.ok(createData.data.house.id);
    assert.match(createData.data.house.invite_code, /^CASA-\d{4}$/);
    assert.equal(createData.data.user.role, 'ADMIN');

    houseId = createData.data.house.id;
    inviteCode = createData.data.house.invite_code;
  });

  it('4. Ingresso em Residência: Bob tenta senha errada e depois entra como MEMBER', async () => {
    // Senha incorreta
    const resWrong = await fetch(`${baseUrl}/house/join`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${bobToken}`,
        'x-user-id': bobId,
      },
      body: JSON.stringify({
        houseName: `Mansão DOMUS E2E ${timestamp}`,
        housePassword: 'senhaErrada',
        user_id: bobId,
      }),
    });
    assert.equal(resWrong.status, 401, 'Senha de casa incorreta deve retornar 401');

    // Senha correta
    const resJoin = await fetch(`${baseUrl}/house/join`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${bobToken}`,
        'x-user-id': bobId,
      },
      body: JSON.stringify({
        houseName: `Mansão DOMUS E2E ${timestamp}`,
        housePassword,
        user_id: bobId,
      }),
    });
    assert.equal(resJoin.status, 200, 'Ingresso na casa deve retornar 200');
    const joinData = await resJoin.json();
    assert.equal(joinData.data.house.id, houseId);
    assert.equal(joinData.data.user.role, 'MEMBER');
    assert.equal(joinData.data.user.house_id, houseId);
  });

  it('5. BFF Dashboard: Deve retornar estado agregado com contagem de moradores e turno', async () => {
    const resDash = await fetch(`${baseUrl}/dashboard?houseId=${houseId}`, {
      headers: {
        Authorization: `Bearer ${aliceToken}`,
        'x-user-id': aliceId,
      },
    });

    assert.equal(resDash.status, 200);
    const dash = await resDash.json();
    assert.ok(dash.data.house);
    assert.equal(dash.data.house.id, houseId);
    assert.ok(dash.data.shift_info.current_shift);
    assert.equal(dash.data.summary.members_count, 2, 'Residência deve consolidar Alice e Bob');
    assert.equal(dash.data.members.length, 2);
  });

  it('6. Concorrência & Locks: Lock exclusivo e bloqueio de concorrência com HTTP 409', async () => {
    // 6.1 Criar tarefa na residência via API
    const resCreateTask = await fetch(`${baseUrl}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${aliceToken}`,
        'x-user-id': aliceId,
      },
      body: JSON.stringify({
        title: 'Higienizar Cozinha',
        shift: 'NIGHT',
        creator_id: aliceId,
        house_id: houseId,
        participant_ids: [aliceId, bobId],
      }),
    });
    assert.equal(resCreateTask.status, 201, 'Criação de tarefa via API deve retornar 201');
    const taskData = await resCreateTask.json();
    taskId = taskData.data.id;

    // 6.2 Alice bloqueia exclusivamente a tarefa
    const resLockAlice = await fetch(`${baseUrl}/tasks/${taskId}/lock`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${aliceToken}`,
        'x-user-id': aliceId,
      },
      body: JSON.stringify({ user_id: aliceId }),
    });
    assert.equal(resLockAlice.status, 200, 'Alice deve conseguir o lock com sucesso');

    // 6.3 Bob tenta adquirir lock concorrente na mesma tarefa simultaneamente
    const resLockBob = await fetch(`${baseUrl}/tasks/${taskId}/lock`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${bobToken}`,
        'x-user-id': bobId,
      },
      body: JSON.stringify({ user_id: bobId }),
    });
    assert.equal(resLockBob.status, 409, 'Lock concorrente na mesma tarefa deve retornar 409 Conflict');

    // 6.4 Alice conclui a tarefa fornecendo seu PIN de segurança
    const resComplete = await fetch(`${baseUrl}/tasks/${taskId}/complete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${aliceToken}`,
        'x-user-id': aliceId,
      },
      body: JSON.stringify({ user_id: aliceId, pin: '1234' }),
    });
    assert.equal(resComplete.status, 200, 'Alice deve concluir a tarefa com 200');
    const completeData = await resComplete.json();
    assert.ok(completeData.data.nextAssignee, 'Deve retornar o próximo responsável da fila de rodízio');

    // Validação de persistência no Prisma: status rotacionado para OPEN e lock liberado
    const rotatedTask = await prisma.task.findUnique({ where: { id: taskId } });
    assert.equal(rotatedTask?.status, 'OPEN', 'Tarefa deve retornar para OPEN pronta para o próximo turno');
    assert.equal(rotatedTask?.locked_by_id, null, 'Lock deve ter sido liberado após conclusão');

    // Validação de registro no feed de atividades
    const activity = await prisma.activityLog.findFirst({
      where: { task_id: taskId, action_type: 'COMPLETED' },
    });
    assert.ok(activity, 'Deve existir registro no ActivityLog comprovando a conclusão');
  });

  it('7. WebSockets & Presença Real-Time: Deve conectar cliente e transmitir evento house:presence', async () => {
    const { io: ClientIO } = await import(
      '../../../frontend/node_modules/socket.io-client/build/esm/index.js' as any
    );

    const clientSocket = ClientIO(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnection: false,
    });

    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        clientSocket.disconnect();
        reject(new Error('Timeout aguardando evento house:presence do WebSocket'));
      }, 5000);

      clientSocket.on('connect', () => {
        // Enviar evento de entrada na casa com usuário identificado
        clientSocket.emit('house:join', {
          houseId,
          user: {
            id: aliceId,
            name: 'Alice Silva',
          },
        });
      });

      clientSocket.on('house:presence', (presenceData: any) => {
        try {
          assert.equal(presenceData.houseId, houseId);
          assert.ok(presenceData.onlineCount >= 1, 'onlineCount deve ser de pelo menos 1');
          assert.ok(presenceData.onlineUserIds.includes(aliceId));
          clearTimeout(timeout);
          clientSocket.disconnect();
          resolve();
        } catch (e) {
          clearTimeout(timeout);
          clientSocket.disconnect();
          reject(e);
        }
      });
    });
  });

  it('8. Sucessão Obrigatória de Admin Geral: Alice não pode sair sem sucessor, mas conclui ao nomear Bob', async () => {
    // 8.1 Alice (Admin Geral) tenta sair sem indicar sucessor -> Deve falhar com 400 ADMIN_TRANSFER_REQUIRED
    const resFail = await fetch(`${baseUrl}/house/leave`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${aliceToken}`,
        'x-user-id': aliceId,
      },
      body: JSON.stringify({ userId: aliceId }),
    });
    assert.equal(resFail.status, 400, 'Saída sem sucessor deve retornar 400');
    const failData = await resFail.json();
    assert.match(failData.message, /Administrador Geral/);

    // 8.2 Alice sai nomeando Bob como novo Admin Geral
    const resSuccess = await fetch(`${baseUrl}/house/leave`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${aliceToken}`,
        'x-user-id': aliceId,
      },
      body: JSON.stringify({ userId: aliceId, newAdminId: bobId }),
    });
    assert.equal(resSuccess.status, 200, 'Saída com sucessor válido deve retornar 200');

    // 8.3 Validação no banco: Bob foi promovido a ADMIN e Alice está sem residência
    const updatedBob = await prisma.user.findUnique({ where: { id: bobId } });
    assert.equal(updatedBob?.role, 'ADMIN', 'Bob deve ter sido promovido a Admin Geral');
    assert.equal(updatedBob?.house_id, houseId);

    const updatedAlice = await prisma.user.findUnique({ where: { id: aliceId } });
    assert.equal(updatedAlice?.house_id, null, 'Alice deve ter seu vínculo com a casa removido');
    assert.equal(updatedAlice?.role, 'MEMBER');

    // 8.4 Validação no banco: Bob agora é o único morador na residência e pode sair sem sucessor
    const resBobLeave = await fetch(`${baseUrl}/house/leave`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${bobToken}`,
        'x-user-id': bobId,
      },
      body: JSON.stringify({ userId: bobId }),
    });
    assert.equal(resBobLeave.status, 200, 'Único morador restante deve conseguir sair diretamente');
    const finalBob = await prisma.user.findUnique({ where: { id: bobId } });
    assert.equal(finalBob?.house_id, null);
  });
});
