/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { HardnessDropTest } from '@/components/experiments/chapter-8/HardnessDropTest';
import { RustRaceTest } from '@/components/experiments/chapter-8/RustRaceTest';

describe('HardnessDropTest (Experiment 8.1A)', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders with copper block selected by default', () => {
    render(<HardnessDropTest />);
    expect(screen.getByText(/Hardness Drop Test Simulator/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /copper block/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /drop 1kg weight/i })).toBeInTheDocument();
  });

  it('simulates dropping weight onto copper block and displays dent diameter', () => {
    render(<HardnessDropTest />);
    const dropBtn = screen.getByRole('button', { name: /drop 1kg weight/i });
    fireEvent.click(dropBtn);

    // Fast-forward drop animation
    act(() => {
      jest.advanceTimersByTime(1200);
    });

    expect(screen.getByText('5.2 mm')).toBeInTheDocument();
  });

  it('shows smaller dent diameter when bronze block is tested', () => {
    render(<HardnessDropTest />);
    const bronzeBtn = screen.getByRole('button', { name: /bronze block/i });
    fireEvent.click(bronzeBtn);

    const dropBtn = screen.getByRole('button', { name: /drop 1kg weight/i });
    fireEvent.click(dropBtn);

    act(() => {
      jest.advanceTimersByTime(1200);
    });

    expect(screen.getByText('2.8 mm')).toBeInTheDocument();
    expect(screen.getByText(/Bronze is harder than copper/i)).toBeInTheDocument();
  });
});

describe('RustRaceTest (Experiment 8.1B)', () => {
  it('renders 3 test tubes for iron, steel, and stainless steel', () => {
    render(<RustRaceTest />);
    expect(screen.getByText(/The Rust Race/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Iron Nail/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Steel Nail/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Stainless Steel Nail/i).length).toBeGreaterThan(0);
  });

  it('progresses time-lapse slider and shows severe corrosion on iron and zero on stainless steel', () => {
    render(<RustRaceTest />);
    const slider = screen.getByRole('slider', { name: /days elapsed/i });
    fireEvent.change(slider, { target: { value: '7' } });

    expect(screen.getByText(/High Rust Formation/i)).toBeInTheDocument();
    expect(screen.getByText(/No Rust/i)).toBeInTheDocument();
    expect(screen.getByText(/Chromium\(III\) oxide/i)).toBeInTheDocument();
  });
});
