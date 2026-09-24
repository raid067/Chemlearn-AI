/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CompositeInspector } from '@/components/experiments/chapter-8/CompositeInspector';

describe('CompositeInspector (Subtopic 8.4)', () => {
  it('renders with Reinforced Concrete selected by default', () => {
    render(<CompositeInspector />);
    expect(screen.getByText(/Composite Materials Phase Inspector/i)).toBeInTheDocument();
    expect(screen.getByText(/Matrix Phase: Concrete/i)).toBeInTheDocument();
    expect(screen.getByText(/Reinforcement Phase: Steel rods/i)).toBeInTheDocument();
  });

  it('allows selecting Photochromic Glass and toggles UV darkening simulation', () => {
    render(<CompositeInspector />);
    const photochromicBtn = screen.getByRole('button', { name: /photochromic glass/i });
    fireEvent.click(photochromicBtn);

    expect(screen.getByText(/Silver chloride/i)).toBeInTheDocument();

    const uvSlider = screen.getByRole('slider', { name: /uv light intensity/i });
    fireEvent.change(uvSlider, { target: { value: '90' } });

    expect(screen.getByText(/Lens State: Darkened/i)).toBeInTheDocument();
    expect(screen.getByText(/Precipitation of silver atoms/i)).toBeInTheDocument();
  });

  it('selects Optical Fibres and displays core vs cladding refractive index rules', () => {
    render(<CompositeInspector />);
    const opticalBtn = screen.getByRole('button', { name: /optical fibres/i });
    fireEvent.click(opticalBtn);

    expect(screen.getAllByText(/Total internal reflection/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/n₁ > n₂/i).length).toBeGreaterThan(0);
  });
});
