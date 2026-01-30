// Text processing utilities for MultiTools

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
  const lines = text.split('\n');

  // UUID pattern to detect IntelX format lines
  const uuidPattern = /^[\uFEFF]?[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;

  // CSV header pattern to detect IntelX CSV format (User,Password,...)
  const csvHeaderPattern = /^[\uFEFF]?User,Password/i;

  // Find first non-empty line to check if it's CSV format
  const firstLineIndex = lines.findIndex(l => l.trim().replace(/^\uFEFF/, '') !== '');
  const firstLine = firstLineIndex >= 0 ? lines[firstLineIndex].trim().replace(/^\uFEFF/, '') : '';
  const isCSV = csvHeaderPattern.test(firstLine);

  const processedLines = lines.map((line, index) => {
    const trimmedLine = line.trim().replace(/^\uFEFF/, ''); // Remove BOM
    if (!trimmedLine) return '';

    // Handle CSV format from IntelX exports
    if (isCSV) {
      // Skip header line (User,Password,...)
      if (csvHeaderPattern.test(trimmedLine)) {
        return '';
      }

      // Parse CSV line - handle quoted fields with commas inside
      const csvFields = parseCSVLine(trimmedLine);
      if (csvFields.length >= 2) {
        const user = csvFields[0].trim();
        const password = csvFields[1].trim();
        // Skip if user looks like a header column name
        if (user && password && user.toLowerCase() !== 'user') {
          return `${user}:${password}`;
        }
      }
      return '';
    }

    // Check if it's IntelX format (starts with UUID)
    if (uuidPattern.test(trimmedLine)) {
      // Extract credentials from different IntelX line formats

      // For lines with "pastes" or "leaks.logs" - credential is at the end as email:password
      if (trimmedLine.includes('pastes') || trimmedLine.includes('leaks.logs')) {
        // Find pattern email:password at the end
        const emailCredsMatch = trimmedLine.match(/([^\s@]+@[^\s@]+\.[^\s@:]+):([^\s]+)$/);
        if (emailCredsMatch) {
          return `${emailCredsMatch[1]}:${emailCredsMatch[2]}`;
        }
        return '';
      }

      // For "leaks.private.general" lines
      if (trimmedLine.includes('leaks.private.general')) {
        const leaksIndex = trimmedLine.indexOf('leaks.private.general');
        const afterLeaks = trimmedLine.substring(leaksIndex + 'leaks.private.general'.length).trim();
        if (!afterLeaks) return '';

        // Check for SQL INSERT format: INSERT INTO ... VALUES ('id', 'email', 'hash', ...)
        const insertMatch = afterLeaks.match(/INSERT\s+INTO.*VALUES\s*\([^)]*'([^']+@[^']+)'[^']*'([^']+)'/i);
        if (insertMatch) {
          return `${insertMatch[1]}:${insertMatch[2]}`;
        }

        // Check for tabular data format (tab-separated): id\temail\thash\t...
        if (afterLeaks.includes('\t')) {
          const tabParts = afterLeaks.split('\t');
          // Find email field (contains @) and use next non-empty field as hash
          for (let i = 0; i < tabParts.length - 1; i++) {
            if (tabParts[i].includes('@')) {
              const email = tabParts[i].trim();
              const hash = tabParts[i + 1]?.trim();
              if (email && hash) {
                return `${email}:${hash}`;
              }
            }
          }
        }

        // Check for URL:email:password format
        const urlCredsMatch = afterLeaks.match(/https?:\/\/[^\s:]+:([^\s:]+@[^\s:]+):([^\s]+)/);
        if (urlCredsMatch) {
          return `${urlCredsMatch[1]}:${urlCredsMatch[2]}`;
        }

        // Check for pipe format: url|login|password
        if (afterLeaks.includes('|')) {
          const pipeParts = afterLeaks.split('|');
          const nonUrlParts = pipeParts.filter(p => !p.includes('://') && p.trim() !== '');
          if (nonUrlParts.length >= 2) {
            return `${nonUrlParts[0]}:${nonUrlParts[1]}`;
          }
        }

        // Check for semicolon format: login;password;url
        if (afterLeaks.includes(';')) {
          const semiParts = afterLeaks.split(';');
          const nonUrlParts = semiParts.filter(p => !p.includes('://') && p.trim() !== '');
          if (nonUrlParts.length >= 2) {
            return `${nonUrlParts[0]}:${nonUrlParts[1]}`;
          }
        }

        // Try to extract email:password from the end
        const simpleCredsMatch = afterLeaks.match(/([^\s@]+@[^\s@]+\.[^\s@:]+):([^\s]+)$/);
        if (simpleCredsMatch) {
          return `${simpleCredsMatch[1]}:${simpleCredsMatch[2]}`;
        }

        return '';
      }

      // For other UUID lines, try to extract credentials from the end
      const credMatch = trimmedLine.match(/([^\s@]+@[^\s@]+\.[^\s@:]+):([^\s]+)$/);
      if (credMatch) {
        return `${credMatch[1]}:${credMatch[2]}`;
      }

      return '';
    }

    // For non-UUID lines, skip if it looks like just a URL or log line
    if (trimmedLine.match(/^(URL:|Host:|Url:|Title:|HOST:)/i)) {
      return '';
    }

    if (trimmedLine.startsWith('http')) {
      return '';
    }

    // Handle pipe format
    if (trimmedLine.includes('|')) {
      const pipeParts = trimmedLine.split('|');
      const nonUrlParts = pipeParts.filter(p => !p.includes('://') && p.trim() !== '');
      if (nonUrlParts.length >= 2) {
        return `${nonUrlParts[0]}:${nonUrlParts[1]}`;
      }
      return '';
    }

    // Handle semicolon format
    if (trimmedLine.includes(';')) {
      const semiParts = trimmedLine.split(';');
      const nonUrlParts = semiParts.filter(p => !p.includes('://') && p.trim() !== '');
      if (nonUrlParts.length >= 2) {
        return `${nonUrlParts[0]}:${nonUrlParts[1]}`;
      }
      return '';
    }

    // If it's already login:senha format
    if (trimmedLine.includes(':') && !trimmedLine.includes('://')) {
      return trimmedLine;
    }

    return '';
  }).filter(line => line.trim() !== '');

  return processedLines.join('\n');
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

export const filterCloud = (text: string): string => {
  return filterCloudWithMode(text, 'login:password');
};

export const filterCloudWithMode = (text: string, mode: string = 'login:password'): string => {
  const lines = text.split('\n');
  const results: string[] = [];

  let currentUrl: string | null = null;
  let currentUser: string | null = null;
  let currentPsw: string | null = null;

  for (const line of lines) {
    const trimmedLine = line.trim();

    // Look for "url" field
    const urlMatch = trimmedLine.match(/"url"\s*:\s*"([^"]+)"/);
    if (urlMatch) {
      currentUrl = urlMatch[1];
    }

    // Look for "user" field
    const userMatch = trimmedLine.match(/"user"\s*:\s*"([^"]+)"/);
    if (userMatch) {
      currentUser = userMatch[1];
    }

    // Look for "psw" field first, then "password" field
    const pswMatch = trimmedLine.match(/"psw"\s*:\s*"([^"]+)"/);
    if (pswMatch) {
      currentPsw = pswMatch[1];
    } else {
      // Try "password" field as fallback
      const passwordMatch = trimmedLine.match(/"password"\s*:\s*"([^"]+)"/);
      if (passwordMatch) {
        currentPsw = passwordMatch[1];
      }
    }

    // When we have both user and psw, emit based on mode
    if (currentUser && currentPsw) {
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
    }
  }

  return results.join('\n');
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
