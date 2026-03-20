// Text processing utilities for TextHub

export const removeDuplicates = (text: string): string => {
  const lines = text.split('\n').filter(line => line.trim() !== '');
  const uniqueLines = [...new Set(lines)];
  return uniqueLines.join('\n');
};

export const removeKeyword = (text: string, keyword: string): string => {
  if (!keyword.trim()) return text;
  const lines = text.split('\n');
  const filteredLines = lines.filter(line =>
    !line.toLowerCase().includes(keyword.toLowerCase())
  );
  return filteredLines.join('\n');
};

export const removeUrls = (text: string): string => {
  const lines = text.split('\n');
  const processedLines = lines.map(line => {
    const trimmedLine = line.trim();
    if (!trimmedLine) return '';

    // Find all colons in the line
    const colonIndices: number[] = [];
    for (let i = 0; i < trimmedLine.length; i++) {
      if (trimmedLine[i] === ':') {
        colonIndices.push(i);
      }
    }

    // If there are at least 2 colons, keep everything from the second-to-last colon onwards
    if (colonIndices.length >= 2) {
      const secondToLastColonIndex = colonIndices[colonIndices.length - 2];
      return trimmedLine.substring(secondToLastColonIndex + 1);
    }

    return trimmedLine; // Return unchanged if less than 2 colons
  }).filter(line => line.trim() !== '');

  return processedLines.join('\n');
};

export const keepKeyword = (text: string, keyword: string): string => {
  if (!keyword.trim()) return '';
  const lines = text.split('\n');
  const filteredLines = lines.filter(line =>
    line.toLowerCase().includes(keyword.toLowerCase())
  );
  return filteredLines.join('\n');
};

export const filterCpfLogins = (text: string): string => {
  const lines = text.split('\n');
  const filteredLines = lines.filter(line => {
    if (line.includes(':')) {
      const login = line.split(':')[0];
      // Check if login has exactly 11 digits (CPF format)
      return /^\d{11}$/.test(login.replace(/\D/g, ''));
    }
    return false;
  });
  return filteredLines.join('\n');
};

export const filterEmailLogins = (text: string): string => {
  const lines = text.split('\n');
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const filteredLines = lines.filter(line => {
    if (line.includes(':')) {
      const login = line.split(':')[0];
      return emailRegex.test(login);
    }
    return false;
  });
  return filteredLines.join('\n');
};

export const filterUserLogins = (text: string): string => {
  const lines = text.split('\n');
  const filteredLines = lines.filter(line => {
    if (line.includes(':')) {
      const login = line.split(':')[0];
      // Check if login contains only letters and dots
      return /^[a-zA-Z.]+$/.test(login);
    }
    return false;
  });
  return filteredLines.join('\n');
};

export const filterNumericLogins = (text: string): string => {
  const lines = text.split('\n');
  const filteredLines = lines.filter(line => {
    if (line.includes(':')) {
      const login = line.split(':')[0];
      // Check if login contains only numbers
      return /^\d+$/.test(login);
    }
    return false;
  });
  return filteredLines.join('\n');
};

export const addLoginSuffix = (text: string, suffix: string): string => {
  const lines = text.split('\n').filter(line => line.trim() !== '');

  const processedLines = lines.map(line => {
    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) return line + suffix;

    const login = line.substring(0, colonIndex);
    const password = line.substring(colonIndex);
    return login + suffix + password;
  });

  return processedLines.join('\n');
};

export const filterByLoginLength = (text: string, lengthInput: string): string => {
  const lines = text.split('\n').filter(line => line.trim() !== '');

  // Parse length input - can be single number "3" or range "3-5"
  let minLength: number;
  let maxLength: number;

  if (lengthInput.includes('-')) {
    const parts = lengthInput.split('-');
    minLength = parseInt(parts[0].trim()) || 0;
    maxLength = parseInt(parts[1].trim()) || 0;
    // Ensure min <= max
    if (minLength > maxLength) {
      [minLength, maxLength] = [maxLength, minLength];
    }
  } else {
    minLength = parseInt(lengthInput.trim()) || 0;
    maxLength = minLength;
  }

  const filteredLines = lines.filter(line => {
    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) return false;

    const login = line.substring(0, colonIndex);
    return login.length >= minLength && login.length <= maxLength;
  });

  // Ordenar alfabeticamente
  filteredLines.sort((a, b) => a.localeCompare(b));

  return filteredLines.join('\n');
};

export const removeDomain = (text: string): string => {
  const lines = text.split('\n');
  const processedLines = lines.map(line => {
    const trimmedLine = line.trim();
    if (!trimmedLine) return '';

    // Find the first @ and first :
    const atIndex = trimmedLine.indexOf('@');
    const colonIndex = trimmedLine.indexOf(':');

    // If there's no @ or no :, or @ comes after :, return unchanged
    if (atIndex === -1 || colonIndex === -1 || atIndex > colonIndex) {
      return trimmedLine;
    }

    // Remove from @ to : (keeping the :)
    const beforeAt = trimmedLine.substring(0, atIndex);
    const afterColon = trimmedLine.substring(colonIndex);

    return beforeAt + afterColon;
  }).filter(line => line.trim() !== '');

  return processedLines.join('\n');
};

export const removeChecked = (checkedText: string, toCheckText: string): string => {
  const checkedLines = new Set(
    checkedText.split('\n')
      .map(line => line.trim())
      .filter(line => line !== '')
  );

  const toCheckLines = toCheckText.split('\n')
    .map(line => line.trim())
    .filter(line => line !== '');

  const freshLines = toCheckLines.filter(line => !checkedLines.has(line));
  return freshLines.join('\n');
};

export const removeCpfSymbols = (text: string): string => {
  const lines = text.split('\n');
  const processedLines = lines.map(line => {
    const trimmedLine = line.trim();
    if (!trimmedLine) return '';

    // Find the last colon
    const lastColonIndex = trimmedLine.lastIndexOf(':');

    if (lastColonIndex === -1) {
      // No colon found - check if it's a CPF (11 digits when symbols removed)
      const withoutSymbols = trimmedLine.replace(/[.\-]/g, '');
      if (/^\d{11}$/.test(withoutSymbols)) {
        return withoutSymbols;
      }
      return trimmedLine;
    }

    // Split at last colon
    const beforeColon = trimmedLine.substring(0, lastColonIndex);
    const afterColon = trimmedLine.substring(lastColonIndex);

    // Remove dots and hyphens and check if it's a CPF (11 digits)
    const withoutSymbols = beforeColon.replace(/[.\-]/g, '');

    // Only remove symbols if it's exactly 11 digits (CPF)
    if (/^\d{11}$/.test(withoutSymbols)) {
      return withoutSymbols + afterColon;
    }

    // Otherwise, keep the original
    return trimmedLine;
  }).filter(line => line.trim() !== '');

  return processedLines.join('\n');
};

export const splitIntoParts = (text: string, numParts: number): string[] => {
  if (numParts <= 0) return [];

  const lines = text.split('\n').filter(line => line.trim() !== '');
  if (lines.length === 0) return [];

  // Safety: never create more parts than there are lines.
  // This prevents huge allocations/rendering when a user inputs an extremely high number.
  numParts = Math.min(numParts, lines.length);

  const parts: string[] = [];
  const linesPerPart = Math.floor(lines.length / numParts);
  const remainder = lines.length % numParts;

  let startIndex = 0;
  for (let i = 0; i < numParts; i++) {
    const extraLine = i < remainder ? 1 : 0;
    const endIndex = startIndex + linesPerPart + extraLine;
    parts.push(lines.slice(startIndex, endIndex).join('\n'));
    startIndex = endIndex;
  }

  return parts;
};

// Utility function to count lines in text
export const countLines = (text: string): number => {
  if (!text.trim()) return 0;
  return text.split('\n').filter(line => line.trim() !== '').length;
};

export const filterIntelX = (text: string): string => {
  return filterIntelXWithMode(text, 'login:password');
};

export const filterIntelXWithMode = (text: string, mode: string = 'login:password'): string => {
  // TODO: Lógica nova de filtragem do IntelX virá aqui...
  return text; // temporário
};

// Helper function to parse CSV line with quoted fields
const parseCSVLine = (line: string): string[] => {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // Escaped quote
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);

  return result;
};

export const filterLeakSight = (text: string): string => {
  return filterLeakSightWithMode(text, 'login:password');
};

export const filterLeakSightWithMode = (text: string, mode: string = 'login:password'): string => {
  const lines = text.split('\n');
  const results = new Set<string>(); // Usando Set para remover duplicatas automaticamente
  
  let currentHost = '';
  let currentUser = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    const hostMatch = line.match(/host:\s*"([^"]+)"/i);
    if (hostMatch) currentHost = hostMatch[1].trim();

    const userMatch = line.match(/user:\s*"([^"]+)"/i);
    if (userMatch) currentUser = userMatch[1].trim();

    const passMatch = line.match(/pass:\s*"([^"]+)"/i);
    if (passMatch) {
      const currentPass = passMatch[1].trim();
      const u = (currentUser || '').trim();
      const p = (currentPass || '').trim();

      if (u || p) {
        switch (mode) {
          case 'login':
            results.add(u);
            break;
          case 'password':
            results.add(p);
            break;
          case 'login:password':
            results.add(`${u}:${p}`);
            break;
          case 'url:login:password':
            results.add(`${currentHost}:${u}:${p}`);
            break;
          default:
            results.add(`${u}:${p}`);
        }
      }
      currentUser = ''; // Reseta user para o próximo bloco
    }
  }
  return Array.from(results).join('\n');
};

export const filterCloud = (text: string): string => {
  return filterCloudWithMode(text, 'login:password');
};

export const filterCloudWithMode = (text: string, mode: string = 'login:password'): string => {
  const lines = text.split('\n');
  const results: string[] = [];

  let currentUrl: string | null = null;
  let currentUser: string | null = null;
  let currentPsw: string | null = null;

  const maybeEmit = () => {
    if (!currentUser || !currentPsw) return;

    switch (mode) {
      case 'login':
        results.push(currentUser);
        break;
      case 'password':
        results.push(currentPsw);
        break;
      case 'login:password':
        results.push(`${currentUser}:${currentPsw}`);
        break;
      case 'url:login:password':
        results.push(`${currentUrl || ''}:${currentUser}:${currentPsw}`);
        break;
      default:
        results.push(`${currentUser}:${currentPsw}`);
    }

    currentUrl = null;
    currentUser = null;
    currentPsw = null;
  };

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine) continue;

    // --- JSON cloud format ---
    // "url": "..."
    const jsonUrlMatch = trimmedLine.match(/"url"\s*:\s*"([^"]+)"/i);
    if (jsonUrlMatch) currentUrl = jsonUrlMatch[1];

    // "user": "..."
    const jsonUserMatch = trimmedLine.match(/"user"\s*:\s*"([^"]+)"/i);
    if (jsonUserMatch) currentUser = jsonUserMatch[1];

    // "psw": "..." OR "password": "..."
    const jsonPswMatch = trimmedLine.match(/"psw"\s*:\s*"([^"]+)"/i);
    if (jsonPswMatch) {
      currentPsw = jsonPswMatch[1];
    } else {
      const jsonPasswordMatch = trimmedLine.match(/"password"\s*:\s*"([^"]+)"/i);
      if (jsonPasswordMatch) currentPsw = jsonPasswordMatch[1];
    }

    // --- Text block format (Soft/Host/Login/Password) ---
    // Host: https://...
    const hostMatch = trimmedLine.match(/^(?:Host|URL|Url|Hostname)\s*:\s*(.+)$/i);
    if (hostMatch) currentUrl = hostMatch[1].trim();

    // Login: xxx OR User: xxx OR Username: xxx
    const loginMatch = trimmedLine.match(/^(?:Login|User|Username)\s*:\s*(.+)$/i);
    if (loginMatch) currentUser = loginMatch[1].trim();

    // Password: yyy OR Pass: yyy OR Psw: yyy
    const passMatch = trimmedLine.match(/^(?:Password|Pass|Psw)\s*:\s*(.+)$/i);
    if (passMatch) currentPsw = passMatch[1].trim();

    maybeEmit();
  }

  return results.join('\n');
};

// Cria linhas no formato usuario:senha a partir de uma lista de senhas (1 por linha)
export const pairUserWithPasswords = (text: string, user: string): string => {
  const u = (user || '').trim();
  if (!u) return '';

  const passwords = text
    .split('\n')
    .map(l => l.trim())
    .filter(Boolean);

  return passwords.map(p => `${u}:${p}`).join('\n');
};

export const filterLogin = (text: string): string => {
  const lines = text.split('\n');
  const results: string[] = [];

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine) continue;

    const colonIndex = trimmedLine.indexOf(':');
    if (colonIndex > 0) {
      const login = trimmedLine.substring(0, colonIndex);
      if (login.trim()) {
        results.push(login);
      }
    }
  }

  return results.join('\n');
};

export const filterPassword = (text: string): string => {
  const lines = text.split('\n');
  const results: string[] = [];

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine) continue;

    const colonIndex = trimmedLine.indexOf(':');
    if (colonIndex > 0 && colonIndex < trimmedLine.length - 1) {
      const password = trimmedLine.substring(colonIndex + 1);
      if (password.trim()) {
        results.push(password);
      }
    }
  }

  return results.join('\n');
};

// Process text in chunks for better performance with large datasets
export const processTextInChunks = <T>(
  text: string,
  processor: (chunk: string, ...args: T[]) => string,
  chunkSize: number = 10000,
  ...args: T[]
): string => {
  const lines = text.split('\n');
  if (lines.length <= chunkSize) {
    return processor(text, ...args);
  }

  const chunks: string[] = [];
  for (let i = 0; i < lines.length; i += chunkSize) {
    const chunk = lines.slice(i, i + chunkSize).join('\n');
    const processedChunk = processor(chunk, ...args);
    if (processedChunk.trim()) {
      chunks.push(processedChunk);
    }
  }

  return chunks.join('\n');
};
