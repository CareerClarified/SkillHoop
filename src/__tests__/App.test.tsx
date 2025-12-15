import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import App from '../App';

describe('App', () => {
  it('renders without crashing and shows SkillHoop text', async () => {
    render(<App />);
    
    // The App component uses BrowserRouter and renders LandingPage at "/"
    // LandingPage includes LandingNavbar which contains "SkillHoop" text
    // Since LandingPage is lazy loaded, we need to wait for it to appear
    // Note: "SkillHoop" appears multiple times (navbar, testimonials, footer), so we check for at least one
    await waitFor(() => {
      const skillHoopElements = screen.getAllByText(/SkillHoop/i);
      expect(skillHoopElements.length).toBeGreaterThan(0);
    });
  });
});
