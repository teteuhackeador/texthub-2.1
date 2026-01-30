// Web Worker for streaming file reading
// Reads large files in chunks to avoid memory issues

interface ReadMessage {
  type: 'read';
  file: File;
}

interface ProgressMessage {
  type: 'progress';
  percent: number;
  bytesRead: number;
  totalBytes: number;
  linesRead: number;
}

interface CompleteMessage {
  type: 'complete';
  lines: string[];
  totalLines: number;
}

interface ErrorMessage {
  type: 'error';
  message: string;
}

type WorkerMessage = ReadMessage;
type WorkerResponse = ProgressMessage | CompleteMessage | ErrorMessage;

const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB chunks

self.onmessage = async (e: MessageEvent<WorkerMessage>) => {
  const { type, file } = e.data;

  if (type === 'read') {
    try {
      await readFileInChunks(file);
    } catch (error) {
      self.postMessage({
        type: 'error',
        message: error instanceof Error ? error.message : 'Erro ao ler arquivo'
      } as ErrorMessage);
    }
  }
};

async function readFileInChunks(file: File): Promise<void> {
  const totalSize = file.size;
  let offset = 0;
  let partialLine = '';
  const allLines: string[] = [];
  let lastProgressUpdate = 0;

  while (offset < totalSize) {
    const chunk = file.slice(offset, offset + CHUNK_SIZE);
    const text = await readChunkAsText(chunk);

    // Combine with any partial line from previous chunk
    const combinedText = partialLine + text;
    const lines = combinedText.split('\n');

    // Last line might be incomplete, save for next iteration
    partialLine = lines.pop() || '';

    // Add complete lines
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed) {
        allLines.push(trimmed);
      }
    }

    offset += CHUNK_SIZE;

    // Send progress updates every 2% or 100ms
    const percent = Math.min((offset / totalSize) * 100, 100);
    const now = Date.now();
    if (percent - lastProgressUpdate >= 2 || now - lastProgressUpdate >= 100) {
      self.postMessage({
        type: 'progress',
        percent: Math.round(percent),
        bytesRead: Math.min(offset, totalSize),
        totalBytes: totalSize,
        linesRead: allLines.length
      } as ProgressMessage);
      lastProgressUpdate = percent;
    }
  }

  // Don't forget the last partial line
  if (partialLine.trim()) {
    allLines.push(partialLine.trim());
  }

  // Send final progress
  self.postMessage({
    type: 'progress',
    percent: 100,
    bytesRead: totalSize,
    totalBytes: totalSize,
    linesRead: allLines.length
  } as ProgressMessage);

  // Send complete message with all lines
  self.postMessage({
    type: 'complete',
    lines: allLines,
    totalLines: allLines.length
  } as CompleteMessage);
}

function readChunkAsText(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsText(blob);
  });
}
