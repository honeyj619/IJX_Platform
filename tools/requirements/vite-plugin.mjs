import { RequirementStore } from './store.mjs';

const PUBLIC_ID = 'virtual:prototype-requirements';
const RESOLVED_ID = '\0virtual:prototype-requirements';
const API_PREFIX = '/__ijx/requirements';

export function prototypeRequirementsPlugin(rootDir) {
  const store = new RequirementStore(rootDir);
  let server;
  // 保存后的刷新保护窗口：窗口期内由保存链路统一触发一次延迟 full-reload
  let reloadDeferredUntil = 0;
  const RELOAD_DELAY_MS = 400;

  const sendFullReload = () => {
    server?.ws.send({ type: 'full-reload', path: '*' });
  };

  const refresh = () => {
    const module = server?.moduleGraph.getModuleById(RESOLVED_ID);
    if (module) server.moduleGraph.invalidateModule(module);
    sendFullReload();
  };

  return {
    name: 'ijx-prototype-requirements',
    enforce: 'pre',
    resolveId(id) {
      return id === PUBLIC_ID ? RESOLVED_ID : null;
    },
    async load(id) {
      if (id !== RESOLVED_ID) return null;
      const requirements = await store.read();
      return `export default ${JSON.stringify(requirements)};`;
    },
    configureServer(viteServer) {
      server = viteServer;
      // 包装 ws.send：保护窗口内的 full-reload 改为窗口结束后补发（vite watcher 检测到
      // 源码写入触发的重载可能抢在保存响应到达浏览器之前，中断 fetch 报 Failed to fetch）
      const originalSend = viteServer.ws.send.bind(viteServer.ws);
      viteServer.ws.send = (payload, ...rest) => {
        if (payload?.type === 'full-reload' && Date.now() < reloadDeferredUntil) {
          setTimeout(sendFullReload, RELOAD_DELAY_MS);
          return;
        }
        return originalSend(payload, ...rest);
      };
      viteServer.middlewares.use(async (request, response, next) => {
        const url = new URL(request.url ?? '/', 'http://localhost');
        if (!url.pathname.startsWith(API_PREFIX)) return next();
        try {
          assertLocalRequest(request);
          const requirements = await routeRequest(store, request, url.pathname);
          sendJson(response, 200, { requirements });
          // 开启保护窗口并延迟触发刷新：确保响应先到达浏览器
          if (request.method !== 'GET') {
            reloadDeferredUntil = Date.now() + RELOAD_DELAY_MS;
            setTimeout(refresh, RELOAD_DELAY_MS);
          }
        } catch (error) {
          const status = Number.isInteger(error?.statusCode) ? error.statusCode : 400;
          sendJson(response, status, { error: error instanceof Error ? error.message : '请求失败' });
        }
      });
    },
    async handleHotUpdate(context) {
      if (context.file === store.markdownPath) {
        const module = context.server.moduleGraph.getModuleById(RESOLVED_ID);
        if (module) context.server.moduleGraph.invalidateModule(module);
        // 保护窗口内不发（由保存链路统一补发），窗口外正常发
        if (Date.now() >= reloadDeferredUntil) sendFullReload();
        return [];
      }
      return undefined;
    },
  };
}

async function routeRequest(store, request, pathname) {
  if (request.method === 'GET' && pathname === API_PREFIX) return store.read();
  const body = request.method === 'GET' ? undefined : await readJsonBody(request);
  if (request.method === 'POST' && pathname === `${API_PREFIX}/create`) return store.create(body);
  if (request.method === 'POST' && pathname === `${API_PREFIX}/import-overrides`) return store.importOverrides(body);

  const match = pathname.match(/^\/__ijx\/requirements\/([^/]+)(?:\/(reorder|rebind))?$/);
  if (!match) throw methodNotAllowed();
  const id = decodeURIComponent(match[1]);
  const action = match[2];
  if (request.method === 'PUT' && !action) return store.update(id, body);
  if (request.method === 'DELETE' && !action) return store.delete(id);
  if (request.method === 'POST' && action === 'reorder') return store.reorder(id, body);
  if (request.method === 'POST' && action === 'rebind') return store.rebind(id, body);
  throw methodNotAllowed();
}

function assertLocalRequest(request) {
  const host = request.headers.host;
  if (!host) throw forbidden('缺少 Host');
  let hostUrl;
  try {
    hostUrl = new URL(`http://${host}`);
  } catch {
    throw forbidden('Host 无效');
  }
  if (!isLoopback(hostUrl.hostname)) throw forbidden('仅允许本机开发服务');

  const origin = request.headers.origin;
  if (!origin) return;
  let originUrl;
  try {
    originUrl = new URL(origin);
  } catch {
    throw forbidden('Origin 无效');
  }
  if (!isLoopback(originUrl.hostname) || originUrl.host !== hostUrl.host) {
    throw forbidden('Origin 与本机开发服务不匹配');
  }
}

function isLoopback(hostname) {
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '[::1]' || hostname === '::1';
}

async function readJsonBody(request) {
  let body = '';
  for await (const chunk of request) {
    body += chunk;
    if (Buffer.byteLength(body) > 1024 * 1024) {
      const error = new Error('请求体不能超过 1MB');
      error.statusCode = 413;
      throw error;
    }
  }
  if (!body.trim()) return {};
  try {
    return JSON.parse(body);
  } catch {
    throw new Error('请求体必须是 JSON');
  }
}

function sendJson(response, statusCode, value) {
  response.statusCode = statusCode;
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.setHeader('Cache-Control', 'no-store');
  response.end(JSON.stringify(value));
}

function forbidden(message) {
  const error = new Error(message);
  error.statusCode = 403;
  return error;
}

function methodNotAllowed() {
  const error = new Error('接口不存在或请求方法不受支持');
  error.statusCode = 405;
  return error;
}
