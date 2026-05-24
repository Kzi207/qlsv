import type { CookieOptions, Request, Response } from 'express';
import crypto from 'crypto';

export const AUTH_COOKIE_NAME = 'qlsv_session';
export const CSRF_COOKIE_NAME = 'qlsv_token';

const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const LOCALHOSTS = new Set(['localhost', '127.0.0.1']);

export const getAllowedOrigins = () => {
  const configuredOrigins = process.env.FRONTEND_ORIGIN
    ?.replace(/['"]/g, '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (configuredOrigins && configuredOrigins.length > 0) {
    return configuredOrigins;
  }

  return ['http://localhost:5173'];
};

const getHostname = (hostOrOrigin: string) => {
  try {
    return hostOrOrigin.includes('://')
      ? new URL(hostOrOrigin).hostname.toLowerCase()
      : (hostOrOrigin.split(':')[0] || '').toLowerCase();
  } catch {
    return '';
  }
};

const isLocalhost = (hostname: string) =>
  LOCALHOSTS.has(hostname) || /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname);

const getSiteKey = (hostname: string) => {
  const parts = hostname.split('.').filter(Boolean);
  if (parts.length <= 2) return hostname;
  return parts.slice(-2).join('.');
};

const isCrossSiteRequest = (req?: Request) => {
  if (!req) return false;

  const originHeader = req.get('origin') || '';
  if (!originHeader) return false;

  const requestHost = getHostname(req.get('host') || '');
  const originHost = getHostname(originHeader);
  if (!requestHost || !originHost) return false;
  if (isLocalhost(requestHost) || isLocalhost(originHost)) return false;

  return getSiteKey(requestHost) !== getSiteKey(originHost);
};

const getSameSite = (req?: Request): CookieOptions['sameSite'] => {
  const hostname = getHostname(req?.get('host') || '');
  if (hostname && isLocalhost(hostname)) {
    return 'lax';
  }

  const configuredSameSite = String(process.env.COOKIE_SAME_SITE || '').toLowerCase();
  if (configuredSameSite === 'none') return 'none';
  if (configuredSameSite === 'strict') return 'strict';

  if (isCrossSiteRequest(req)) {
    return 'none';
  }

  return 'lax';
};

const normalizeDomain = (domain: string) => domain.replace(/^\./, '').toLowerCase();

const isHostMatchingCookieDomain = (hostOrOrigin: string, configuredDomain: string) => {
  const host = getHostname(hostOrOrigin);
  const target = normalizeDomain(configuredDomain);
  return host === target || host.endsWith(`.${target}`);
};

const getCookieDomain = (req?: Request) => {
  const hostHeader = req?.get('host') || '';
  const hostname = (hostHeader.split(':')[0] ?? '').toLowerCase();
  
  // Don't set a domain for localhost or IP addresses to ensure cookies work correctly
  if (isLocalhost(hostname)) {
    return undefined;
  }

  let configuredDomain = process.env.COOKIE_DOMAIN;
  if (!configuredDomain) {
    if (hostname.endsWith('khanhduy.id.vn')) {
      configuredDomain = 'khanhduy.id.vn';
    } else if (hostname.endsWith('kzii.site')) {
      configuredDomain = 'kzii.site';
    }
  }
  if (!configuredDomain) return undefined;
  if (!req) return configuredDomain;

  const originHeader = req.get('origin') || '';

  const matchedHost = hostHeader && isHostMatchingCookieDomain(hostHeader, configuredDomain);
  const matchedOrigin = originHeader && isHostMatchingCookieDomain(originHeader, configuredDomain);

  if (matchedHost || matchedOrigin) {
    return configuredDomain;
  }

  return undefined;
};

const shouldUseSecureCookies = (req?: Request) => {
  if (req) {
    const hostname = getHostname(req.get('host') || '');
    if (isLocalhost(hostname)) {
      return false;
    }
  }

  const forcedSecure = process.env.COOKIE_SECURE === 'true';
  if (forcedSecure) return true;
  if (process.env.NODE_ENV === 'production') return true;

  const isHttpsRequest =
    req?.protocol === 'https' ||
    req?.get('x-forwarded-proto') === 'https' ||
    req?.secure === true ||
    req?.get('origin')?.startsWith('https://') === true ||
    req?.get('referer')?.startsWith('https://') === true;

  // In production or when accessed via HTTPS, always use secure cookies
  return Boolean(isHttpsRequest);
};

export const getAuthCookieOptions = (req?: Request): CookieOptions => {
  const isSecure = shouldUseSecureCookies(req);
  const sameSite = getSameSite(req);
  // Force secure if sameSite is none, as browsers require it
  const finalSecure = isSecure || sameSite === 'none';
  const normalizedSameSite = sameSite === 'none' && !finalSecure ? 'lax' : sameSite;

  return {
    httpOnly: true,
    secure: finalSecure,
    sameSite: normalizedSameSite,
    maxAge: ONE_DAY_MS,
    path: '/',
    domain: getCookieDomain(req),
  };
};

export const getCsrfCookieOptions = (req?: Request): CookieOptions => {
  const isSecure = shouldUseSecureCookies(req);
  const sameSite = getSameSite(req);
  // Force secure if sameSite is none, as browsers require it
  const finalSecure = isSecure || sameSite === 'none';
  const normalizedSameSite = sameSite === 'none' && !finalSecure ? 'lax' : sameSite;

  return {
    httpOnly: false,
    secure: finalSecure,
    sameSite: normalizedSameSite,
    maxAge: ONE_DAY_MS,
    path: '/',
    domain: getCookieDomain(req),
  };
};

export const getCookieValue = (req: Request, key: string) => {
  return req.cookies?.[key] || req.signedCookies?.[key];
};

export const createCsrfToken = () => crypto.randomBytes(32).toString('hex');

export const setAuthCookies = (req: Request, res: Response, token: string, csrfToken: string) => {
  res.cookie(AUTH_COOKIE_NAME, token, getAuthCookieOptions(req));
  res.cookie(CSRF_COOKIE_NAME, csrfToken, getCsrfCookieOptions(req));
};

export const setCsrfCookie = (req: Request, res: Response, csrfToken: string) => {
  res.cookie(CSRF_COOKIE_NAME, csrfToken, getCsrfCookieOptions(req));
};

export const clearAuthCookies = (req: Request, res: Response) => {
  const authOptions = getAuthCookieOptions(req);
  const csrfOptions = getCsrfCookieOptions(req);

  const deleteOptions = (base: CookieOptions): CookieOptions => {
    // Chrome mobile is very sensitive to matching options during deletion
    const { maxAge, ...rest } = base;
    return {
      ...rest,
      expires: new Date(0),
      maxAge: 0,
    };
  };

  // 1. Clear with configured domain (e.g., .kzii.site)
  res.cookie(AUTH_COOKIE_NAME, '', deleteOptions(authOptions));
  res.cookie(CSRF_COOKIE_NAME, '', deleteOptions(csrfOptions));

  // 2. Clear without domain (host-only cookie)
  const { domain: _d1, ...authNoDomain } = deleteOptions(authOptions);
  const { domain: _d2, ...csrfNoDomain } = deleteOptions(csrfOptions);
  
  res.cookie(AUTH_COOKIE_NAME, '', authNoDomain);
  res.cookie(CSRF_COOKIE_NAME, '', csrfNoDomain);
};
