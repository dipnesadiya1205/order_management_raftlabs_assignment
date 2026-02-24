// Mock SSE service for tests
export const createEventSource = jest.fn(() => {
  const mockEventSource = {
    url: '',
    readyState: 0,
    CONNECTING: 0,
    OPEN: 1,
    CLOSED: 2,
    onopen: null as ((event: Event) => void) | null,
    onerror: null as ((event: Event) => void) | null,
    onmessage: null as ((event: MessageEvent) => void) | null,
    addEventListener: jest.fn((type: string, listener: (event: MessageEvent) => void) => {
      if (type === 'order-update') {
        mockEventSource.onmessage = listener;
      }
    }),
    close: jest.fn(() => {
      mockEventSource.readyState = 2;
    }),
    removeEventListener: jest.fn(),
  };
  
  // Simulate connection opening
  setTimeout(() => {
    mockEventSource.readyState = 1;
    if (mockEventSource.onopen) {
      mockEventSource.onopen(new Event('open'));
    }
  }, 0);
  
  return mockEventSource as unknown as EventSource;
});

export const closeEventSource = jest.fn((eventSource: EventSource) => {
  if (eventSource && eventSource.close) {
    eventSource.close();
  }
});

export const parseSSEMessage = jest.fn((data: string) => {
  return JSON.parse(data);
});
