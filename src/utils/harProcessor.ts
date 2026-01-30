interface HarEntry {
  request: {
    method: string;
    url: string;
    headers?: Array<{ name: string; value: string }>;
    postData?: {
      mimeType?: string;
      text?: string;
    };
  };
  response: {
    status: number;
    headers?: Array<{ name: string; value: string }>;
    content?: {
      size?: number;
      mimeType?: string;
      text?: string;
    };
    redirectURL?: string;
  };
  time?: number;
  serverIPAddress?: string;
  connection?: string;
  _securityDetails?: {
    protocol?: string;
    cipher?: string;
    issuer?: string;
    validFrom?: number;
    validTo?: number;
  };
}

interface HarData {
  log: {
    entries: HarEntry[];
  };
}

const extractCookies = (headers?: Array<{ name: string; value: string }>) => {
  if (!headers) return { cookies: [], headersWithoutCookies: [] };

  const cookies = headers.filter(h =>
    h.name.toLowerCase() === 'cookie' || h.name.toLowerCase() === 'set-cookie'
  );

  const headersWithoutCookies = headers.filter(h =>
    h.name.toLowerCase() !== 'cookie' && h.name.toLowerCase() !== 'set-cookie'
  );

  return { cookies, headersWithoutCookies };
};

const extractAuthHeaders = (headers?: Array<{ name: string; value: string }>) => {
  if (!headers) return [];

  const authHeaderNames = [
    'authorization', 'x-auth-token', 'x-api-key', 'api-key',
    'x-access-token', 'x-csrf-token', 'csrf-token',
    'x-xsrf-token', 'bearer', 'x-session-token', 'x-jwt'
  ];

  return headers.filter(h => {
    const lowerName = h.name.toLowerCase();
    return authHeaderNames.includes(lowerName) ||
           lowerName.includes('auth') ||
           lowerName.includes('token') ||
           lowerName.includes('jwt');
  });
};

const isStaticResource = (entry: HarEntry): boolean => {
  const url = entry.request.url.toLowerCase();
  const mimeType = entry.response.content?.mimeType?.toLowerCase() || '';
  const status = entry.response.status;
  const method = entry.request.method.toUpperCase();

  // CRÍTICO: NUNCA filtrar requisições com body (POST, PUT, PATCH)
  // Essas requisições sempre contêm payloads essenciais para checkers
  if (['POST', 'PUT', 'PATCH'].includes(method)) {
    return false;
  }

  // Extensões de arquivos estáticos para remover
  const staticExtensions = [
    '.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp', '.ico', '.bmp',
    '.woff', '.woff2', '.ttf', '.eot', '.otf',
    '.css',
    '.js.map', '.css.map',
    '.mp4', '.webm', '.mp3', '.ogg', '.wav',
  ];

  if (staticExtensions.some(ext => url.includes(ext))) {
    return true;
  }

  // Verificar por mimeType
  const staticMimeTypes = [
    'image/',
    'font/',
    'text/css',
    'video/',
    'audio/',
  ];

  if (staticMimeTypes.some(type => mimeType.includes(type))) {
    return true;
  }

  // Arquivos JS estáticos (não APIs que retornam JSON)
  // Se retorna JSON, pode ser um endpoint de API
  if (url.endsWith('.js') && !mimeType.includes('json') && !mimeType.includes('application/json')) {
    return true;
  }

  // Bibliotecas JS comuns
  const jsLibraries = [
    'jquery', 'primefaces', 'bootstrap', 'angular', 'react', 'vue',
    'lodash', 'moment', 'underscore', 'backbone', 'ember', 'knockout'
  ];

  if (jsLibraries.some(lib => url.includes(lib))) {
    return true;
  }

  // Beacons e Analytics (padrões mais específicos)
  const analyticsPatterns = [
    'cloudflare-insights', 'beacon.min.js', '/cdn-cgi/',
    'google-analytics.com', '/gtag/', '/gtm.js', 'googletagmanager',
    'connect.facebook.net', '/fbevents.js', 'facebook.com/tr',
    'static.hotjar.com', 'js-agent.newrelic.com',
    'cdn.segment.com', 'api.mixpanel.com', 'cdn.amplitude.com',
    '/analytics.js', '/_tracking/', '/tracker.js'
  ];

  if (analyticsPatterns.some(pattern => url.includes(pattern))) {
    return true;
  }

  // Métricas RUM (padrões mais específicos)
  const rumPatterns = [
    '/rum/', '/rum.js', '/telemetry/', '/performance-monitoring',
    'bam.nr-data.net', '/metrics/collect'
  ];

  if (rumPatterns.some(pattern => url.includes(pattern))) {
    return true;
  }

  // Apenas redirects permanentes (301, 308)
  // Manter 302 e 307 pois são usados em fluxos OAuth e auth
  const redirectStatuses = [301, 308];
  if (redirectStatuses.includes(status)) {
    return true;
  }

  // Outros arquivos comuns
  if (url.includes('favicon') || url.includes('manifest.json') || url.includes('robots.txt')) {
    return true;
  }

  return false;
};

const getDeduplicationKey = (entry: HarEntry): string => {
  const url = entry.request.url;
  const method = entry.request.method;
  const body = entry.request.postData?.text || '';
  return `${method}:${url}:${body}`;
};

export const processHarContent = (content: string): string => {
  try {
    const harData: HarData = JSON.parse(content);

    if (!harData.log || !harData.log.entries) {
      throw new Error('Arquivo HAR inválido: estrutura esperada não encontrada');
    }

    // Filtrar recursos estáticos
    const filteredEntries = harData.log.entries.filter(entry => !isStaticResource(entry));

    // Deduplicar requisições idênticas
    const seenKeys = new Set<string>();
    const uniqueEntries = filteredEntries.filter(entry => {
      const key = getDeduplicationKey(entry);
      if (seenKeys.has(key)) {
        return false;
      }
      seenKeys.add(key);
      return true;
    });

    const reducedEntries = uniqueEntries.map(entry => {
      const reduced: any = {
        url: entry.request.url,
        method: entry.request.method,
        status: entry.response.status,
      };

      if (entry.time) {
        reduced.timing = Math.round(entry.time);
      }

      if (entry.response.content?.size) {
        reduced.size = entry.response.content.size;
      }

      const { cookies: requestCookies, headersWithoutCookies: requestHeadersFiltered } =
        extractCookies(entry.request.headers);

      const { cookies: responseCookies, headersWithoutCookies: responseHeadersFiltered } =
        extractCookies(entry.response.headers);

      // Extrair headers de autenticação
      const authHeaders = extractAuthHeaders([
        ...(entry.request.headers || []),
        ...(entry.response.headers || [])
      ]);

      if (requestHeadersFiltered.length > 0) {
        reduced.requestHeaders = requestHeadersFiltered;
      }

      if (responseHeadersFiltered.length > 0) {
        reduced.responseHeaders = responseHeadersFiltered;
      }

      if (requestCookies.length > 0) {
        reduced.requestCookies = requestCookies;
      }

      if (responseCookies.length > 0) {
        reduced.responseCookies = responseCookies;
      }

      if (authHeaders.length > 0) {
        reduced.authentication = authHeaders;
      }

      if (entry.request.postData?.text) {
        reduced.requestBody = entry.request.postData.text;
      }

      if (entry.response.content?.text) {
        reduced.responseBody = entry.response.content.text;
      }

      // Informações SSL/TLS
      if (entry.serverIPAddress || entry._securityDetails) {
        reduced.ssl = {};
        if (entry.serverIPAddress) {
          reduced.ssl.serverIP = entry.serverIPAddress;
        }
        if (entry._securityDetails) {
          if (entry._securityDetails.protocol) {
            reduced.ssl.protocol = entry._securityDetails.protocol;
          }
          if (entry._securityDetails.cipher) {
            reduced.ssl.cipher = entry._securityDetails.cipher;
          }
          if (entry._securityDetails.issuer) {
            reduced.ssl.issuer = entry._securityDetails.issuer;
          }
        }
      }

      // URL de redirecionamento para status 3xx
      if (entry.response.redirectURL) {
        reduced.redirectURL = entry.response.redirectURL;
      }

      return reduced;
    });

    const output = {
      version: '1.0-reduced',
      entries: reducedEntries,
      totalEntries: reducedEntries.length,
    };

    return JSON.stringify(output, null, 2);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Erro ao processar arquivo HAR: ${error.message}`);
    }
    throw new Error('Arquivo HAR inválido. Verifique o formato do conteúdo.');
  }
};
