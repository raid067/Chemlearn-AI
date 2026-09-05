import React from 'react';
import { render, screen } from '@testing-library/react';

jest.mock('marked', () => ({
  marked: {
    parse: jest.fn((text: string) => {
      // Synchronous mock for markdown bold formatting
      return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    }),
  },
}));

import ChatMessage from '@/components/chat/ChatMessage';

describe('ChatMessage Component (XSS Defense & Rendering)', () => {
  it('renders standard assistant markdown response as formatted HTML', () => {
    const message = {
      id: 'msg-1',
      role: 'assistant' as const,
      content: '**Exothermic reaction:** Releases heat to the surroundings.',
      timestamp: new Date(),
    };

    render(<ChatMessage message={message} />);
    const strong = screen.getByText('Exothermic reaction:');
    expect(strong.tagName).toBe('STRONG');
    expect(screen.getByText(/Releases heat to the surroundings/)).toBeInTheDocument();
  });

  it('renders user message content', () => {
    const message = {
      id: 'msg-2',
      role: 'user' as const,
      content: 'Explain Boyle Law please',
      timestamp: new Date(),
    };

    render(<ChatMessage message={message} />);
    expect(screen.getByText('Explain Boyle Law please')).toBeInTheDocument();
  });

  it('strips malicious XSS script payloads via DOMPurify', () => {
    const maliciousPayload = 'Safe text <script>alert("XSS Vulnerability")</script>';
    const message = {
      id: 'msg-xss',
      role: 'assistant' as const,
      content: maliciousPayload,
      timestamp: new Date(),
    };

    const { container } = render(<ChatMessage message={message} />);
    expect(container.querySelector('script')).toBeNull();
    expect(screen.getByText(/Safe text/)).toBeInTheDocument();
  });

  it('neutralizes malicious onerror attributes in image tags', () => {
    const maliciousPayload = 'Test <img src="invalid-url" onerror="window.__pwned = true" />';
    const message = {
      id: 'msg-xss-img',
      role: 'assistant' as const,
      content: maliciousPayload,
      timestamp: new Date(),
    };

    const { container } = render(<ChatMessage message={message} />);
    const img = container.querySelector('img');
    if (img) {
      expect(img.getAttribute('onerror')).toBeNull();
    }
    expect((window as any).__pwned).toBeUndefined();
  });
});
