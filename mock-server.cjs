/**
 * mock-server.cjs  -  a tiny FAKE backend for the DEV HELP (LibreChat v0.8.0-rc3) frontend.
 *
 * No packages needed. Run it with:   node mock-server.cjs
 * It listens on port 3080, which is where client/vite.config.ts proxies /api to,
 * so the frontend needs no code changes for the network calls.
 *
 * What it does
 *  - pretends you are logged in (fake user + fake token)
 *  - returns empty lists / safe defaults for everything the UI asks for on startup
 *  - keeps conversations + messages in memory (they reset when you stop this script)
 *  - answers chat messages with a canned, streamed reply (POST /api/agents/chat/:endpoint)
 *
 * Every request that is NOT mocked is printed as
 *   UNMOCKED GET /api/something
 * so you can see exactly which calls are left.
 */
const http = require('http');
const crypto = require('crypto');

const PORT = 3080;
const ENDPOINT_NAME = 'Dev Help';
const MODEL_NAME = 'dev-help-1';
const NO_PARENT = '00000000-0000-0000-0000-000000000000';

// ---- fake logged-in user + a JWT-shaped token that never expires -------------
const b64 = (o) => Buffer.from(JSON.stringify(o)).toString('base64url');
const TOKEN = `${b64({ alg: 'none', typ: 'JWT' })}.${b64({ id: 'local-user', exp: 4102444800 })}.mock`;

const USER = {
  id: 'local-user',
  _id: 'local-user',
  name: 'Dev',
  username: 'dev',
  email: 'dev@local.test',
  avatar: '',
  role: 'USER',
  provider: 'local',
  emailVerified: true,
  plugins: [],
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

// ---- in-memory "database" ------------------------------------------------------
const convos = new Map(); // conversationId -> conversation
const messages = new Map(); // conversationId -> message[]

const now = () => new Date().toISOString();
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function readBody(req) {
  return new Promise((resolve) => {
    let raw = '';
    req.on('data', (c) => (raw += c));
    req.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch (_) {
        resolve({});
      }
    });
  });
}

function sendJson(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(body === undefined ? '' : JSON.stringify(body));
}

// ---- the canned reply ------------------------------------------------------------
function buildReply(userText) {
  const shortened = (userText || '').trim().slice(0, 300) || '(empty message)';
  return [
    '**Dev Help is running in offline demo mode** (no backend connected).',
    '',
    'You said:',
    '',
    `> ${shortened}`,
    '',
    'Here is a sample code block so you can check formatting:',
    '',
    '```js',
    "console.log('Hello from Dev Help!');",
    '```',
    '',
    'Connect a real backend later and this reply will come from your AI model.',
  ].join('\n');
}

// ---- chat: POST /api/agents/chat/:endpoint  (Server-Sent Events) -------------------
async function handleChat(req, res) {
  const body = await readBody(req);

  const conversationId =
    body.conversationId && body.conversationId !== 'new' ? body.conversationId : crypto.randomUUID();
  const parentMessageId = body.parentMessageId || NO_PARENT;
  const isRegenerate = !!body.isRegenerate;
  const endpoint = body.endpoint || ENDPOINT_NAME;
  const model = body.model || MODEL_NAME;

  const requestMessage = {
    messageId: body.messageId || crypto.randomUUID(),
    conversationId,
    parentMessageId,
    sender: 'User',
    text: body.text || '',
    isCreatedByUser: true,
    endpoint,
    createdAt: now(),
    updatedAt: now(),
  };

  // a regenerate re-uses the existing user message; its id is body.messageId
  const replyParentId = requestMessage.messageId;
  const replyText = buildReply(isRegenerate ? '(regenerated)' : body.text);
  const responseMessage = {
    messageId: crypto.randomUUID(),
    conversationId,
    parentMessageId: replyParentId,
    sender: ENDPOINT_NAME,
    text: replyText,
    content: [{ type: 'text', text: replyText }],
    isCreatedByUser: false,
    endpoint,
    model,
    unfinished: false,
    error: false,
    createdAt: now(),
    updatedAt: now(),
  };

  let convo = convos.get(conversationId);
  if (!convo) {
    const title = (body.text || 'New Chat').trim().slice(0, 40) || 'New Chat';
    convo = {
      conversationId,
      title,
      endpoint,
      model,
      user: USER.id,
      isArchived: false,
      tags: [],
      createdAt: now(),
      updatedAt: now(),
    };
    convos.set(conversationId, convo);
  }
  convo.updatedAt = now();

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });
  let closed = false;
  res.on('close', () => (closed = true));
  const emit = (obj) => !closed && res.write(`data: ${JSON.stringify(obj)}\n\n`);

  // 1) "created": tells the UI the user message was accepted
  emit({ created: true, message: requestMessage });

  // 2) stream the answer word by word (cumulative text, as the UI expects)
  const streamingId = `${requestMessage.messageId}_`;
  const words = replyText.split(/(\s+)/);
  let acc = '';
  for (let i = 0; i < words.length && !closed; i++) {
    acc += words[i];
    if (i % 3 === 0 || i === words.length - 1) {
      emit({ type: 'text', text: acc, index: 0, messageId: streamingId, conversationId });
      await sleep(30);
    }
  }
  if (closed) {
    return;
  }

  // 3) save in memory + send the final event
  const list = messages.get(conversationId) || [];
  if (!isRegenerate && !list.some((m) => m.messageId === requestMessage.messageId)) {
    list.push(requestMessage);
  }
  list.push(responseMessage);
  messages.set(conversationId, list);

  emit({
    final: true,
    conversation: { ...convo },
    title: convo.title,
    requestMessage,
    responseMessage,
  });
  res.end();
}

// ---- route table: [method or '*', regex, async handler(req, res, match) -> JSON] ----
const routes = [
  // app settings the frontend reads on startup
  ['GET', /^\/api\/config$/, () => ({
    appTitle: 'Dev Help',
    socialLogins: [],
    emailLoginEnabled: true,
    registrationEnabled: false,
    passwordResetEnabled: false,
    emailEnabled: false,
    serverDomain: 'http://localhost:3090',
    instanceProjectId: '',
    sharedLinksEnabled: false,
    publicSharedLinksEnabled: false,
    interface: {
      endpointsMenu: true,
      modelSelect: true,
      parameters: true,
      sidePanel: true,
      presets: false,
      prompts: false,
      bookmarks: false,
      multiConvo: false,
      agents: false,
      temporaryChat: true,
      customWelcome: 'Hi, I am Dev Help. How can I help you code today?',
    },
  })],

  // auth: pretend we are always logged in
  ['*', /^\/api\/auth\/refresh$/, () => ({ token: TOKEN, user: USER })],
  ['*', /^\/api\/auth\/(login|logout|register)$/, () => ({ token: TOKEN, user: USER, message: 'ok' })],
  ['GET', /^\/api\/user$/, () => USER],
  ['GET', /^\/api\/roles\/.+$/, () => ({ name: 'USER', permissions: {} })],

  // conversations (kept in memory)
  ['GET', /^\/api\/convos$/, () => ({
    conversations: [...convos.values()].sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1)),
    nextCursor: null,
  })],
  ['POST', /^\/api\/convos\/gen_title$/, async (req) => {
    const { conversationId } = await readBody(req);
    return { title: convos.get(conversationId)?.title || 'New Chat' };
  }],
  ['POST', /^\/api\/convos\/update$/, async (req) => {
    const { arg = {} } = await readBody(req);
    const c = convos.get(arg.conversationId);
    if (c) {
      Object.assign(c, arg, { updatedAt: now() });
    }
    return c || arg;
  }],
  ['DELETE', /^\/api\/convos(\/all)?$/, async (req) => {
    const { arg = {} } = await readBody(req);
    if (arg.conversationId) {
      convos.delete(arg.conversationId);
      messages.delete(arg.conversationId);
    } else if (/\/all$/.test(req.url)) {
      convos.clear();
      messages.clear();
    }
    return { message: 'ok', result: { deletedCount: 1 } };
  }],
  ['GET', /^\/api\/convos\/([^/]+)$/, (req, res, m) => convos.get(m[1]) || { conversationId: m[1] }],
  ['GET', /^\/api\/messages\/([^/]+)$/, (req, res, m) => messages.get(m[1]) || []],

  // other lists, all empty
  ['GET', /^\/api\/search\/enable$/, () => false],
  ['GET', /^\/api\/tags$/, () => []],
  ['GET', /^\/api\/presets$/, () => []],
  ['GET', /^\/api\/banner$/, () => null],
  ['GET', /^\/api\/balance$/, () => ({ tokenCredits: 0 })],
  ['GET', /^\/api\/files$/, () => []],
  ['GET', /^\/api\/files\/config$/, () => ({})],
  ['GET', /^\/api\/files\/speech\/config\/get$/, () => ({})],
  ['GET', /^\/api\/agents(\/.*)?$/, () => ({ data: [], has_more: false, first_id: null, last_id: null })],
  ['GET', /^\/api\/assistants(\/.*)?$/, () => ({ data: [] })],
  ['GET', /^\/api\/prompts\/groups$/, () => ({ promptGroups: [], pages: 1, pageNumber: '1', nextCursor: null })],
  ['GET', /^\/api\/prompts(\/.*)?$/, () => []],
  ['GET', /^\/api\/plugins$/, () => []],

  // which AI "endpoints" / models the dropdown shows
  ['GET', /^\/api\/endpoints$/, () => ({
    [ENDPOINT_NAME]: { type: 'custom', userProvide: false, order: 0 },
  })],
  ['GET', /^\/api\/models$/, () => ({ [ENDPOINT_NAME]: [MODEL_NAME] })],
];

const server = http.createServer(async (req, res) => {
  const url = (req.url || '').split('?')[0];
  const method = req.method || 'GET';

  try {
    // chat stream
    if (method === 'POST' && /^\/api\/agents\/chat\/(?!abort)[^/]+$/.test(url)) {
      return await handleChat(req, res);
    }

    for (const [m, re, handler] of routes) {
      if ((m === '*' || m === method) && re.test(url)) {
        const out = await handler(req, res, url.match(re));
        return sendJson(res, 200, out);
      }
    }

    // Not mocked: drain the body, log it, and return something harmless.
    // (Never 401 here: a 401 sends the app back to the login page.)
    await readBody(req);
    console.log('UNMOCKED', method, req.url);
    sendJson(res, 200, method === 'GET' ? {} : { ok: true });
  } catch (err) {
    console.error('mock-server error on', method, req.url, err);
    if (!res.headersSent) {
      sendJson(res, 500, { message: 'mock server error' });
    }
  }
});

server.listen(PORT, () => {
  console.log(`Mock backend running on http://localhost:${PORT}`);
});
