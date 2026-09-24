/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AtomicLatticeSimulator } from '@/components/experiments/chapter-8/AtomicLatticeSimulator';

describe('AtomicLatticeSimulator (Form 4 Chapter 8.1)', () => {
  it('renders with pure metal mode by default', () => {
    render(<AtomicLatticeSimulator />);
    expect(screen.getByRole('button', { name: /pure metal/i })).toBeInTheDocument();
    expect(screen.getAllByText(/Copper/i).length).toBeGreaterThan(0);
    expect(screen.getByRole('slider', { name: /applied force/i })).toBeInTheDocument();
  });

  it('allows switching between Pure Copper and Bronze Alloy', () => {
    render(<AtomicLatticeSimulator />);
    const alloyButton = screen.getByRole('button', { name: /bronze alloy/i });
    fireEvent.click(alloyButton);

    expect(screen.getByRole('heading', { name: /SPM Explanation: Bronze Alloy/i })).toBeInTheDocument();
    expect(screen.getByText(/Tin \(Sn\) foreign atoms/i)).toBeInTheDocument();
  });

  it('slides pure metal layers smoothly when force is applied', () => {
    const onShearChange = jest.fn();
    render(<AtomicLatticeSimulator onShearChange={onShearChange} />);

    const slider = screen.getByRole('slider', { name: /applied force/i });
    fireEvent.change(slider, { target: { value: '80' } });

    expect(onShearChange).toHaveBeenCalledWith(80);
    expect(screen.getByText(/slide easily/i)).toBeInTheDocument();
  });

  it('shows layer lock and deformation resistance in alloy mode under force', () => {
    render(<AtomicLatticeSimulator initialMode="alloy" />);

    const slider = screen.getByRole('slider', { name: /applied force/i });
    fireEvent.change(slider, { target: { value: '80' } });

    expect(screen.getByText(/disrupts the orderly arrangement/i)).toBeInTheDocument();
    expect(screen.getByText(/prevented from sliding/i)).toBeInTheDocument();
  });

  it('resets force to 0 when reset button is clicked', () => {
    render(<AtomicLatticeSimulator />);

    const slider = screen.getByRole('slider', { name: /applied force/i });
    fireEvent.change(slider, { target: { value: '60' } });
    expect(slider).toHaveValue('60');

    const resetBtn = screen.getByRole('button', { name: /reset force/i });
    fireEvent.click(resetBtn);
    expect(slider).toHaveValue('0');
  });
});
