import { useEffect } from 'react';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';

export function useEditorTour() {
  useEffect(() => {
    // Check if user has already seen the tour
    const hasSeenTour = localStorage.getItem('hasSeenTour');
    
    if (hasSeenTour === 'true') {
      return; // Don't show tour if already seen
    }

    // Helper function to check if element exists
    const elementExists = (selector: string): boolean => {
      return document.querySelector(selector) !== null;
    };

    // Wait for elements to be available
    const waitForElements = (callback: () => void, maxAttempts = 20, attempt = 0) => {
      const requiredElements = [
        '#resume-control-panel',
        '#ats-scan-btn',
        '#export-btn'
      ];
      const allExist = requiredElements.every(elementExists);

      if (allExist || attempt >= maxAttempts) {
        callback();
        return;
      }

      setTimeout(() => waitForElements(callback, maxAttempts, attempt + 1), 200);
    };

    // Start tour once elements are available
    waitForElements(() => {
      // Build steps array
      const steps: any[] = [
        // Step 1: Welcome Modal (no element highlighted)
        {
          element: 'body',
          popover: {
            title: 'Welcome to SkillHoop!',
            description: "Let's build your resume in minutes.",
            side: 'bottom',
            align: 'center',
          },
        },
        // Step 2: The Forms - Highlight Sidebar
        {
          element: '#resume-control-panel',
          popover: {
            title: 'The Forms',
            description: 'Enter your experience and details here.',
            side: 'right',
            align: 'start',
          },
        },
      ];

      // Step 3: Magic Wand - Only add if the button exists
      if (elementExists('#ai-assistant-btn')) {
        steps.push({
          element: '#ai-assistant-btn',
          popover: {
            title: 'Magic Wand',
            description: 'Stuck? Click the Magic Wand to write professional text instantly.',
            side: 'left',
            align: 'start',
          },
        });
      }

      // Step 4: ATS Scanner
      steps.push({
        element: '#ats-scan-btn',
        popover: {
          title: 'ATS Scanner',
          description: 'Check your match score against real job descriptions.',
          side: 'bottom',
          align: 'start',
        },
      });

      // Step 5: Export
      steps.push({
        element: '#export-btn',
        popover: {
          title: 'Export',
          description: 'Download your resume as PDF or DOCX.',
          side: 'bottom',
          align: 'start',
        },
      });

      const driverObj = driver({
        showProgress: true,
        showButtons: ['next', 'previous', 'close'],
        steps,
        onDestroyStarted: () => {
          // Mark tour as seen when user closes it
          localStorage.setItem('hasSeenTour', 'true');
        },
        onDestroyed: () => {
          // Also mark as seen when tour completes
          localStorage.setItem('hasSeenTour', 'true');
        },
      });

      // Start the tour
      driverObj.drive();
    });
  }, []);
}

