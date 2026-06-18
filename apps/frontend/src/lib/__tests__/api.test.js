import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { api } from '../api';

function mockFetchOnce(status, body, ok = status >= 200 && status < 300) {
  global.fetch = jest.fn().mockResolvedValue({
    ok,
    status,
    statusText: ok ? 'OK' : 'Error',
    json: async () => body,
  });
}

describe('api lib', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('GET inclui o caminho correcto e sem corpo', async () => {
    mockFetchOnce(200, { ok: true });
    await api.get('/categories');

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/categories',
      expect.objectContaining({ headers: expect.objectContaining({ 'Content-Type': 'application/json' }) })
    );
  });

  it('inclui o cabeçalho Authorization quando há token guardado', async () => {
    localStorage.setItem('quiz_token', 'meu-token-123');
    mockFetchOnce(200, { ok: true });

    await api.get('/leaderboard');

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/leaderboard',
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: 'Bearer meu-token-123' }),
      })
    );
  });

  it('não inclui Authorization quando não há token', async () => {
    mockFetchOnce(200, { ok: true });
    await api.get('/leaderboard');

    const [, options] = global.fetch.mock.calls[0];
    expect(options.headers.Authorization).toBeUndefined();
  });

  it('POST envia o corpo como JSON com o método correcto', async () => {
    mockFetchOnce(201, { id: 1 });
    await api.post('/scores', { score: 8, total: 10, category: 'geral' });

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/scores',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ score: 8, total: 10, category: 'geral' }),
      })
    );
  });

  it('resolve com o JSON da resposta quando o pedido tem sucesso', async () => {
    mockFetchOnce(200, { hello: 'world' });
    const result = await api.get('/anything');
    expect(result).toEqual({ hello: 'world' });
  });

  it('rejeita com o erro vindo do corpo da resposta quando falha', async () => {
    mockFetchOnce(401, { error: 'Credenciais inválidas.' });
    await expect(api.post('/auth/login', {})).rejects.toThrow('Credenciais inválidas.');
  });

  it('rejeita com o statusText quando o corpo não é JSON válido', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      json: async () => { throw new Error('not json'); },
    });
    await expect(api.get('/broken')).rejects.toThrow('Internal Server Error');
  });

  it('devolve null para respostas 204 No Content', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 204,
      json: async () => { throw new Error('should not be called'); },
    });
    const result = await api.del('/scores/1');
    expect(result).toBeNull();
  });
});
