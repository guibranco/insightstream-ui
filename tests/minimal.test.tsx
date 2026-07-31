import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

function Btn() {
  const [n, setN] = React.useState(0);
  return <button onClick={() => setN((x) => x + 1)}>count:{n}</button>;
}

describe('minimal fake timer click', () => {
  it('clicks under fake timers', async () => {
    vi.useFakeTimers();
    const user = userEvent.setup({ delay: null, advanceTimers: vi.advanceTimersByTime });
    render(<Btn />);
    await user.click(screen.getByText('count:0'));
    expect(screen.getByText('count:1')).toBeInTheDocument();
  });
});
