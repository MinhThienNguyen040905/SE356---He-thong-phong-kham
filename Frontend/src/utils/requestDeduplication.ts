

interface PendingRequest {
  promise: Promise<any>;
  timestamp: number;
}

const pendingRequests = new Map<string, PendingRequest>();
const CACHE_TTL = 1000; 


export function deduplicateRequest<T>(
  key: string,
  fn: () => Promise<T>
): Promise<T> {
  const now = Date.now();

  
  for (const [k, v] of pendingRequests.entries()) {
    if (now - v.timestamp > CACHE_TTL) {
      pendingRequests.delete(k);
    }
  }

  
  const pending = pendingRequests.get(key);
  if (pending && now - pending.timestamp < CACHE_TTL) {
    return pending.promise;
  }

  
  const promise = fn().finally(() => {
    
    setTimeout(() => {
      pendingRequests.delete(key);
    }, CACHE_TTL);
  });

  pendingRequests.set(key, { promise, timestamp: now });
  return promise;
}


export function generateRequestKey(
  method: string,
  url: string,
  data?: any
): string {
  const dataStr = data ? JSON.stringify(data) : "";
  return `${method}:${url}:${dataStr}`;
}
