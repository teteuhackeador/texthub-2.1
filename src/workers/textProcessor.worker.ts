// Web Worker for heavy text processing
import {
  removeDuplicates,
  removeKeyword,
  removeUrls,
  keepKeyword,
  filterCpfLogins,
  filterEmailLogins,
  filterUserLogins,
  filterNumericLogins,
  removeCpfSymbols,
  removeDomain,
  filterIntelX,
  filterCloud,
  filterCloudWithMode,
  filterLeakSight,
  filterLeakSightWithMode,
  filterLogin,
  filterPassword,
  pairUserWithPasswords
} from '../utils/textProcessors';

interface ProcessMessage {
  type: 'process';
  lines: string[];
  processorName: string;
  keyword?: string;
}

interface ProgressMessage {
  type: 'progress';
  progress: number;
}

interface ResultMessage {
  type: 'result';
  lines: string[];
}

const processors: Record<string, (text: string, keyword?: string) => string> = {
  removeDuplicates,
  removeKeyword,
  removeUrls,
  keepKeyword,
  filterCpfLogins,
  filterEmailLogins,
  filterUserLogins,
  filterNumericLogins,
  removeCpfSymbols,
  removeDomain,
  filterIntelX,
  filterCloud,
  filterCloudWithMode,
  filterLeakSight,
  filterLeakSightWithMode,
  filterLogin,
  filterPassword,
  pairUserWithPasswords
};

self.onmessage = (e: MessageEvent<ProcessMessage>) => {
  const { type, lines, processorName, keyword } = e.data;

  if (type === 'process') {
    const processor = processors[processorName];
    if (!processor) {
      self.postMessage({ type: 'error', message: 'Processor not found' });
      return;
    }

    // Some processors depend on context across lines; process them in one shot.
    if (processorName === 'removeDuplicates' || processorName === 'filterCloud' || processorName === 'filterCloudWithMode' || processorName === 'filterLeakSight' || processorName === 'filterLeakSightWithMode') {
      const allText = lines.join('\n');
      const processedText = processor(allText, keyword);
      const resultLines = processedText.split('\n').filter(l => l.trim());

      self.postMessage({ type: 'progress', progress: 100 } as ProgressMessage);
      self.postMessage({ type: 'result', lines: resultLines } as ResultMessage);
      return;
    }

    // For other processors, use chunked processing
    const CHUNK_SIZE = 5000;
    const resultLines: string[] = [];

    for (let i = 0; i < lines.length; i += CHUNK_SIZE) {
      const chunk = lines.slice(i, i + CHUNK_SIZE);
      const chunkText = chunk.join('\n');
      const processedText = processor(chunkText, keyword);

      if (processedText.trim()) {
        resultLines.push(...processedText.split('\n').filter(l => l.trim()));
      }

      // Send progress update
      const progress = Math.min(((i + CHUNK_SIZE) / lines.length) * 100, 100);
      self.postMessage({
        type: 'progress',
        progress
      } as ProgressMessage);
    }

    self.postMessage({
      type: 'result',
      lines: resultLines
    } as ResultMessage);
  }
};
