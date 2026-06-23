/**
 * API local del CMS (desarrollo) — puerto 3401.
 * En producción: editor.acropolis.adesa.com.do/api/ (PHP).
 */
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import crypto from "node:crypto";
import { createDefaultContent } from "../lib/default-content.mjs";
import { buildUploadInventory } from "../lib/upload-inventory.mjs";
import { normalizeCmsDocument } from "../lib/cms-url-normalize.mjs";
import { ensureAuthUsersSeeded } from "../lib/auth-seed.mjs";
import {
  confirmTwoFactor,
  destroySession,
  getSession,
  loginWithPassword,
  sessionTotpEnabled,
  setupTwoFactor,
  verifyTwoFactor,
} from "../lib/auth-service.mjs";
import { sendCivisSolicitudMail } from "../lib/civis-solicitud-mail.mjs";
import { sendEsferaSolicitudMail } from "../lib/esfera-solicitud-mail.mjs";
import { sendVolunteerSolicitudMail } from "../lib/volunteer-solicitud-mail.mjs";
import { sendSiteInquiryMail } from "../lib/site-inquiry-mail.mjs";
import {
  triggerDeployWebhook,
  cmsPublishUserMessage,
} from "../lib/deploy-webhook.mjs";
import {
  loadSmtpConfig,
  publicSmtpConfig,
  saveSmtpConfig,
} from "../lib/smtp-config.mjs";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const DATA = path.join(ROOT, "data");
const PORT = Number(process.env.CMS_API_PORT || 3401);
const ADMIN_PASSWORD = process.env.CMS_ADMIN_PASSWORD || "acropolis-edit";

ensureAuthUsersSeeded();

function cors(res, origin) {
  const allowed = [
    "http://localhost:3400",
    "http://127.0.0.1:3400",
    "http://localhost:3100",
    "http://127.0.0.1:3100",
    "http://localhost:3200",
    "http://127.0.0.1:3200",
    "http://localhost:3300",
    "http://127.0.0.1:3300",
    "https://editor.acropolis.adesa.com.do",
    "https://acropolis.adesa.com.do",
    "https://civis.acropolis.adesa.com.do",
    "https://civis.acropolis.org.do",
  ];
  if (origin && allowed.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
  }
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
}

function json(res, status, body, origin) {
  cors(res, origin);
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(body));
}

function siteDir(site) {
  return path.join(DATA, site);
}

function draftPath(site) {
  return path.join(siteDir(site), "draft.json");
}

function publishedPath(site) {
  return path.join(siteDir(site), "published.json");
}

function backupsDir(site) {
  return path.join(siteDir(site), "backups");
}

function uploadsDir(site) {
  return path.join(siteDir(site), "uploads");
}

function ensureSite(site) {
  const dir = siteDir(site);
  fs.mkdirSync(dir, { recursive: true });
  fs.mkdirSync(backupsDir(site), { recursive: true });
  fs.mkdirSync(uploadsDir(site), { recursive: true });
  if (!fs.existsSync(publishedPath(site))) {
    const doc = createDefaultContent(site);
    fs.writeFileSync(publishedPath(site), JSON.stringify(doc, null, 2));
    fs.writeFileSync(draftPath(site), JSON.stringify(doc, null, 2));
  } else if (!fs.existsSync(draftPath(site))) {
    fs.copyFileSync(publishedPath(site), draftPath(site));
  }
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function getToken(req) {
  const auth = req.headers.authorization || "";
  const m = /^Bearer\s+(.+)$/i.exec(auth);
  return m?.[1] || "";
}

function requireAuth(req, res, origin) {
  const token = getToken(req);
  const sess = getSession(token);
  if (!sess) {
    json(res, 401, { error: "No autorizado" }, origin);
    return false;
  }
  return true;
}

async function readBody(req) {
  const chunks = [];
  for await (const c of req) chunks.push(c);
  const raw = Buffer.concat(chunks).toString("utf8");
  if (!raw) return null;
  return JSON.parse(raw);
}

function parseMultipart(buf, boundary) {
  const parts = [];
  const sep = Buffer.from(`--${boundary}`);
  let start = buf.indexOf(sep) + sep.length;
  while (start > sep.length - 1) {
    const next = buf.indexOf(sep, start);
    const chunk = buf.subarray(start, next > 0 ? next : buf.length);
    const headerEnd = chunk.indexOf("\r\n\r\n");
    if (headerEnd === -1) break;
    const headers = chunk.subarray(0, headerEnd).toString("utf8");
    const body = chunk.subarray(headerEnd + 4);
    const nameMatch = /name="([^"]+)"/.exec(headers);
    const fileMatch = /filename="([^"]+)"/.exec(headers);
    parts.push({
      name: nameMatch?.[1],
      filename: fileMatch?.[1],
      data: body.subarray(0, body.length - 2),
    });
    if (next === -1) break;
    start = next + sep.length;
  }
  return parts;
}

const server = http.createServer(async (req, res) => {
  const origin = req.headers.origin;
  if (req.method === "OPTIONS") {
    cors(res, origin);
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url || "/", `http://localhost:${PORT}`);
  const pathname = url.pathname;

  try {
    if (pathname === "/settings/smtp" && req.method === "GET") {
      if (!requireAuth(req, res, origin)) return;
      json(res, 200, publicSmtpConfig(loadSmtpConfig()), origin);
      return;
    }

    if (pathname === "/settings/smtp" && req.method === "PUT") {
      if (!requireAuth(req, res, origin)) return;
      const body = await readBody(req);
      saveSmtpConfig(body ?? {});
      json(res, 200, { ok: true, ...publicSmtpConfig(loadSmtpConfig()) }, origin);
      return;
    }

    if (pathname === "/forms/civis-solicitud" && req.method === "POST") {
      const body = await readBody(req);
      const remoteIp = req.socket?.remoteAddress ?? null;
      try {
        const result = await sendCivisSolicitudMail(body ?? {}, remoteIp);
        if (!result.ok) {
          const status = result.error?.includes("SMTP") ? 503 : 400;
          json(res, status, result, origin);
          return;
        }
        json(res, 200, { ok: true, dev: result.dev === true }, origin);
      } catch (e) {
        console.error(e);
        const msg = String(e?.message ?? e);
        json(
          res,
          500,
          {
            ok: false,
            error: msg.includes("SMTP")
              ? msg
              : "No se pudo enviar la solicitud. Compruebe la configuración SMTP en el editor.",
          },
          origin,
        );
      }
      return;
    }

    if (pathname === "/forms/esfera-solicitud" && req.method === "POST") {
      const body = await readBody(req);
      const remoteIp = req.socket?.remoteAddress ?? null;
      try {
        const result = await sendEsferaSolicitudMail(body ?? {}, remoteIp);
        if (!result.ok) {
          const status = result.error?.includes("SMTP") ? 503 : 400;
          json(res, status, result, origin);
          return;
        }
        json(res, 200, { ok: true, dev: result.dev === true }, origin);
      } catch (e) {
        console.error(e);
        const msg = String(e?.message ?? e);
        json(
          res,
          500,
          {
            ok: false,
            error: msg.includes("SMTP")
              ? msg
              : "No se pudo enviar la solicitud. Compruebe la configuración SMTP en el editor.",
          },
          origin,
        );
      }
      return;
    }

    if (pathname === "/forms/voluntariado-solicitud" && req.method === "POST") {
      const body = await readBody(req);
      const remoteIp = req.socket?.remoteAddress ?? null;
      try {
        const result = await sendVolunteerSolicitudMail(body ?? {}, remoteIp);
        if (!result.ok) {
          const status = result.error?.includes("SMTP") ? 503 : 400;
          json(res, status, result, origin);
          return;
        }
        json(res, 200, { ok: true, dev: result.dev === true }, origin);
      } catch (e) {
        console.error(e);
        json(
          res,
          500,
          {
            ok: false,
            error: "No se pudo enviar la solicitud. Compruebe la configuración SMTP en el editor.",
          },
          origin,
        );
      }
      return;
    }

    if (pathname === "/forms/site-inquiry" && req.method === "POST") {
      const body = await readBody(req);
      const remoteIp = req.socket?.remoteAddress ?? null;
      try {
        const result = await sendSiteInquiryMail(body ?? {}, remoteIp);
        if (!result.ok) {
          const status = result.error?.includes("SMTP") ? 503 : 400;
          json(res, status, result, origin);
          return;
        }
        json(res, 200, { ok: true, dev: result.dev === true }, origin);
      } catch (e) {
        console.error(e);
        json(
          res,
          500,
          {
            ok: false,
            error: "No se pudo enviar la solicitud. Compruebe la configuración SMTP en el editor.",
          },
          origin,
        );
      }
      return;
    }

    if (pathname === "/spellcheck" && req.method === "POST") {
      const body = await readBody(req);
      const text = String(body?.text ?? "").trim();
      if (!text) {
        json(res, 200, { issues: [] }, origin);
        return;
      }
      try {
        const params = new URLSearchParams();
        params.set("language", "es");
        params.set("text", text.slice(0, 8000));
        const ltRes = await fetch("https://api.languagetool.org/v2/check", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Accept: "application/json",
          },
          body: params.toString(),
        });
        const data = await ltRes.json();
        const issues = (data.matches ?? []).map((m) => {
          const ctx = m.context ?? {};
          const ctxText = String(ctx.text ?? text);
          const ctxOffset = Number(ctx.offset ?? m.offset ?? 0);
          const start = Math.max(0, ctxOffset - 12);
          const end = Math.min(
            ctxText.length,
            ctxOffset + Number(m.length ?? 0) + 12,
          );
          return {
            message: String(m.message ?? "Posible error"),
            offset: Number(m.offset ?? 0),
            length: Number(m.length ?? 0),
            replacements: (m.replacements ?? [])
              .slice(0, 5)
              .map((r) => String(r.value ?? ""))
              .filter(Boolean),
            excerpt: ctxText.slice(start, end).trim() || text.slice(0, 40),
          };
        });
        json(res, 200, { issues }, origin);
      } catch {
        json(res, 200, { issues: [] }, origin);
      }
      return;
    }

    if (pathname === "/auth/login" && req.method === "POST") {
      const body = await readBody(req);
      const result = loginWithPassword(body?.username ?? "", body?.password ?? "");
      if (!result.ok) {
        json(res, result.status ?? 401, { ok: false, error: result.error }, origin);
        return;
      }
      if (result.need_2fa) {
        json(
          res,
          200,
          { ok: true, need_2fa: true, pendingToken: result.pendingToken },
          origin,
        );
        return;
      }
      json(res, 200, result, origin);
      return;
    }

    if (pathname === "/auth/setup-2fa" && req.method === "POST") {
      const body = await readBody(req);
      const result = setupTwoFactor(
        body?.pendingToken ?? "",
        getToken(req),
      );
      if (!result.ok) {
        json(res, result.status ?? 401, { ok: false, error: result.error }, origin);
        return;
      }
      json(res, 200, result, origin);
      return;
    }

    if (pathname === "/auth/verify-2fa" && req.method === "POST") {
      const body = await readBody(req);
      const result = verifyTwoFactor(body?.pendingToken ?? "", body?.code ?? "");
      if (!result.ok) {
        json(res, result.status ?? 401, { ok: false, error: result.error }, origin);
        return;
      }
      json(res, 200, result, origin);
      return;
    }

    if (pathname === "/auth/confirm-2fa" && req.method === "POST") {
      const body = await readBody(req);
      const result = confirmTwoFactor(
        body?.pendingToken ?? "",
        body?.code ?? "",
        getToken(req),
      );
      if (!result.ok) {
        json(res, result.status ?? 401, { ok: false, error: result.error }, origin);
        return;
      }
      json(res, 200, result, origin);
      return;
    }

    if (pathname === "/auth/me" && req.method === "GET") {
      const token = getToken(req);
      const sess = getSession(token);
      if (!sess) {
        json(res, 401, { ok: false }, origin);
        return;
      }
      json(
        res,
        200,
        {
          ok: true,
          role: sess.role ?? "admin",
          label: sess.label ?? "Editor",
          username: sess.username ?? "",
          totpEnabled: sessionTotpEnabled(token),
        },
        origin,
      );
      return;
    }

    if (pathname === "/auth/logout" && req.method === "POST") {
      destroySession(getToken(req));
      json(res, 200, { ok: true }, origin);
      return;
    }

    const contentMatch = /^\/content\/(acropolis|civis)\/(draft|published)$/.exec(pathname);
    if (contentMatch) {
      const [, site, kind] = contentMatch;
      ensureSite(site);
      if (req.method === "GET") {
        const file = kind === "draft" ? draftPath(site) : publishedPath(site);
        json(res, 200, readJson(file), origin);
        return;
      }
      if (kind === "draft" && req.method === "PUT") {
        if (!requireAuth(req, res, origin)) return;
        const body = normalizeCmsDocument(await readBody(req));
        body.updatedAt = new Date().toISOString();
        fs.writeFileSync(draftPath(site), JSON.stringify(body, null, 2));
        json(res, 200, { ok: true, updatedAt: body.updatedAt }, origin);
        return;
      }
    }

    const publishMatch = /^\/content\/(acropolis|civis)\/publish$/.exec(pathname);
    if (publishMatch && req.method === "POST") {
      if (!requireAuth(req, res, origin)) return;
      const site = publishMatch[1];
      ensureSite(site);
      const published = fs.existsSync(publishedPath(site))
        ? readJson(publishedPath(site))
        : null;
      if (published) {
        const stamp = new Date().toISOString().replace(/[:.]/g, "-");
        fs.writeFileSync(
          path.join(backupsDir(site), `${stamp}.json`),
          JSON.stringify(published, null, 2),
        );
      }
      const draft = normalizeCmsDocument(readJson(draftPath(site)));
      draft.updatedAt = new Date().toISOString();
      fs.writeFileSync(publishedPath(site), JSON.stringify(draft, null, 2));
      fs.writeFileSync(draftPath(site), JSON.stringify(draft, null, 2));
      const deploy = await triggerDeployWebhook(site);
      json(
        res,
        200,
        {
          ok: true,
          updatedAt: draft.updatedAt,
          deploy,
          message: cmsPublishUserMessage(deploy),
        },
        origin,
      );
      return;
    }

    const backupsMatch = /^\/content\/(acropolis|civis)\/backups$/.exec(pathname);
    if (backupsMatch && req.method === "GET") {
      if (!requireAuth(req, res, origin)) return;
      const site = backupsMatch[1];
      ensureSite(site);
      const files = fs
        .readdirSync(backupsDir(site))
        .filter((f) => f.endsWith(".json"))
        .sort()
        .reverse();
      json(res, 200, { backups: files }, origin);
      return;
    }

    const rollbackMatch = /^\/content\/(acropolis|civis)\/rollback$/.exec(pathname);
    if (rollbackMatch && req.method === "POST") {
      if (!requireAuth(req, res, origin)) return;
      const site = rollbackMatch[1];
      const body = await readBody(req);
      const file = path.join(backupsDir(site), body.filename);
      if (!fs.existsSync(file)) {
        json(res, 404, { error: "Backup no encontrado" }, origin);
        return;
      }
      fs.copyFileSync(file, draftPath(site));
      json(res, 200, { ok: true }, origin);
      return;
    }

    const inventoryMatch = /^\/uploads\/(acropolis|civis)\/inventory$/.exec(pathname);
    if (inventoryMatch && req.method === "GET") {
      if (!requireAuth(req, res, origin)) return;
      const site = inventoryMatch[1];
      ensureSite(site);
      const inventory = buildUploadInventory(site, DATA);
      json(res, 200, inventory, origin);
      return;
    }

    const uploadMatch = /^\/upload\/(acropolis|civis)$/.exec(pathname);
    if (uploadMatch && req.method === "POST") {
      if (!requireAuth(req, res, origin)) return;
      const site = uploadMatch[1];
      ensureSite(site);
      const ctype = req.headers["content-type"] || "";
      const boundary = /boundary=(.+)$/.exec(ctype)?.[1];
      if (!boundary) {
        json(res, 400, { error: "multipart required" }, origin);
        return;
      }
      const chunks = [];
      for await (const c of req) chunks.push(c);
      const parts = parseMultipart(Buffer.concat(chunks), boundary);
      const filePart = parts.find((p) => p.filename);
      if (!filePart) {
        json(res, 400, { error: "Archivo requerido" }, origin);
        return;
      }
      const ext = path.extname(filePart.filename).toLowerCase() || ".webp";
      const safe = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
      fs.writeFileSync(path.join(uploadsDir(site), safe), filePart.data);
      const publicPath = `/uploads/${site}/${safe}`;
      json(res, 200, { url: publicPath, filename: safe }, origin);
      return;
    }

    const staticUpload = /^\/uploads\/(acropolis|civis)\/(.+)$/.exec(pathname);
    if (staticUpload && req.method === "GET") {
      const [, site, file] = staticUpload;
      const fp = path.join(uploadsDir(site), path.basename(file));
      if (!fs.existsSync(fp)) {
        res.writeHead(404);
        res.end();
        return;
      }
      cors(res, origin);
      const ext = path.extname(fp).toLowerCase();
      const types = {
        ".webp": "image/webp",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
        ".gif": "image/gif",
      };
      res.writeHead(200, { "Content-Type": types[ext] || "application/octet-stream" });
      fs.createReadStream(fp).pipe(res);
      return;
    }

    json(res, 404, { error: "Not found" }, origin);
  } catch (e) {
    console.error(e);
    json(res, 500, { error: String(e.message || e) }, origin);
  }
});

server.listen(PORT, () => {
  console.log(`CMS dev API → http://localhost:${PORT}`);
  console.log(`  Admin password: ${ADMIN_PASSWORD}`);
  console.log(`  Data folder: ${DATA}`);
});
