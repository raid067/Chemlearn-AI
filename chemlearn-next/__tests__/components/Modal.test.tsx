import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import Modal from '@/components/ui/Modal';

describe('Modal UI Component (Accessibility & Interaction)', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('renders title and children when open', () => {
    render(
      <Modal isOpen={true} onClose={jest.fn()} title="Test Modal Title">
        <p>Modal Body Content</p>
      </Modal>
    );

    act(() => {
      jest.advanceTimersByTime(50);
    });

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Test Modal Title')).toBeInTheDocument();
    expect(screen.getByText('Modal Body Content')).toBeInTheDocument();
  });

  it('does not render when closed initially', () => {
    render(
      <Modal isOpen={false} onClose={jest.fn()} title="Hidden Modal">
        <p>Hidden Content</p>
      </Modal>
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const handleClose = jest.fn();
    render(
      <Modal isOpen={true} onClose={handleClose} title="Closable Modal">
        <p>Content</p>
      </Modal>
    );

    act(() => {
      jest.advanceTimersByTime(50);
    });

    const closeButton = screen.getByRole('button');
    fireEvent.click(closeButton);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when Escape key is pressed', () => {
    const handleClose = jest.fn();
    render(
      <Modal isOpen={true} onClose={handleClose} title="Escape Modal">
        <p>Content</p>
      </Modal>
    );

    act(() => {
      jest.advanceTimersByTime(50);
    });

    fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
