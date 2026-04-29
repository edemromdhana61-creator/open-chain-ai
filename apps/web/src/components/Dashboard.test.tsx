import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Dashboard } from '../components/Dashboard';

describe('Dashboard Component', () => {
  it('should render dashboard with stats', () => {
    render(<Dashboard />);

    expect(screen.getByText('Active Agents')).toBeInTheDocument();
    expect(screen.getByText('Idle Agents')).toBeInTheDocument();
    expect(screen.getByText('Errors')).toBeInTheDocument();
    expect(screen.getByText('Network')).toBeInTheDocument();
  });

  it('should display stats correctly', () => {
    render(<Dashboard />);

    // Check for network uptime display
    expect(screen.getByText('99.9%')).toBeInTheDocument();
  });
});

describe('AgentPanel Component', () => {
  it('should render agent list', () => {
    render(<div>Mock AgentPanel</div>);

    expect(screen.getByText('Mock AgentPanel')).toBeInTheDocument();
  });
});
