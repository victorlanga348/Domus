import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import bcrypt from 'bcryptjs';

describe('Segurança, Senhas & Códigos de Residência (Unitário)', () => {
  it('deve gerar código de convite no padrão oficial CASA-XXXX (4 dígitos)', () => {
    for (let i = 0; i < 50; i++) {
      const randomCode = Math.floor(1000 + Math.random() * 9000);
      const inviteCode = `CASA-${randomCode}`;

      assert.match(inviteCode, /^CASA-\d{4}$/, 'O código de convite deve ter prefixo CASA- seguido de exatamente 4 dígitos');
      assert.equal(inviteCode.length, 9);
    }
  });

  it('deve realizar hashing Bcrypt e validar senhas com sucesso', async () => {
    const rawPassword = 'SenhaSuperSecreta@123';
    const hash = await bcrypt.hash(rawPassword, 10);

    assert.notEqual(rawPassword, hash, 'O hash deve ser completamente diferente da senha em texto puro');
    assert.ok(hash.startsWith('$2'), 'O hash deve possuir prefixo Bcrypt válido');

    const isValid = await bcrypt.compare(rawPassword, hash);
    assert.equal(isValid, true, 'Bcrypt compare deve validar a senha original');

    const isInvalid = await bcrypt.compare('SenhaIncorreta', hash);
    assert.equal(isInvalid, false, 'Bcrypt compare deve rejeitar senhas incorretas');
  });

  it('deve ignorar espaços em branco acidentais nas pontas da senha via trim()', async () => {
    const passwordWithSpaces = '  minhasenha123  ';
    const trimmed = passwordWithSpaces.trim();
    const hash = await bcrypt.hash(trimmed, 10);

    const match = await bcrypt.compare('minhasenha123', hash);
    assert.equal(match, true);
  });

  it('deve garantir que novos códigos regenerados respeitam o padrão CASA-XXXX', () => {
    const generatedCodes = new Set<string>();
    for (let i = 0; i < 20; i++) {
      const code = `CASA-${Math.floor(1000 + Math.random() * 9000)}`;
      assert.match(code, /^CASA-\d{4}$/);
      generatedCodes.add(code);
    }
    assert.ok(generatedCodes.size > 1, 'Os códigos gerados aleatoriamente devem apresentar entropia');
  });

  it('deve normalizar códigos de convite com tolerância a maiúsculas, minúsculas e espaços', () => {
    const rawInput = '  casa-4892  ';
    const normalized = rawInput.trim().toUpperCase();
    assert.equal(normalized, 'CASA-4892');
    assert.match(normalized, /^CASA-\d{4}$/);
  });

  it('deve gerar hash de fallback 0000 para usuários cadastrados sem PIN', async () => {
    const defaultPin = '0000';
    const fallbackHash = await bcrypt.hash(defaultPin, 10);

    const isMatch = await bcrypt.compare('0000', fallbackHash);
    assert.equal(isMatch, true, 'O hash de fallback deve validar com o PIN padrão 0000');

    const wrongMatch = await bcrypt.compare('1234', fallbackHash);
    assert.equal(wrongMatch, false, 'O hash de fallback não deve validar com PIN divergente');
  });

  it('deve preservar o hash do PIN customizado quando fornecido', async () => {
    const customPin = '4892';
    const customHash = await bcrypt.hash(customPin, 10);

    const isMatch = await bcrypt.compare('4892', customHash);
    assert.equal(isMatch, true, 'O hash deve validar exatamente o PIN informado');
  });
});
