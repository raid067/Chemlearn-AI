/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { GlassCeramicsMatrix } from '@/components/experiments/chapter-8/GlassCeramicsMatrix';

describe('GlassCeramicsMatrix (Subtopics 8.2 & 8.3)', () => {
  it('renders glass comparison by default', () => {
    render(<GlassCeramicsMatrix />);
    expect(screen.getByText(/Glass & Ceramics Property Matrix/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Borosilicate/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Soda-Lime/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Fused Silica/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Lead Crystal/i).length).toBeGreaterThan(0);
  });

  it('switches to Ceramics tab and shows Traditional vs Advanced Ceramics', () => {
    render(<GlassCeramicsMatrix />);
    const ceramicsTab = screen.getByRole('button', { name: /ceramics/i });
    fireEvent.click(ceramicsTab);

    expect(screen.getByText(/Traditional Ceramics/i)).toBeInTheDocument();
    expect(screen.getByText(/Kaolin/i)).toBeInTheDocument();
    expect(screen.getByText(/Advanced Ceramics/i)).toBeInTheDocument();
    expect(screen.getByText(/Zirconia/i)).toBeInTheDocument();
  });

  it('runs thermal shock test and shows borosilicate survives while soda-lime cracks', () => {
    render(<GlassCeramicsMatrix />);
    const shockBtn = screen.getByRole('button', { name: /test thermal shock/i });
    fireEvent.click(shockBtn);

    expect(screen.getByText(/Soda-Lime Glass: Cracks/i)).toBeInTheDocument();
    expect(screen.getByText(/Borosilicate Glass: Intact/i)).toBeInTheDocument();
  });
});
