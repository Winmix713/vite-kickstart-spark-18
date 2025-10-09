export interface AccessibilityIssue {
  type: 'missing-alt' | 'low-contrast' | 'missing-label' | 'missing-aria' | 'heading-order' | 'color-only';
  element: HTMLElement;
  severity: 'error' | 'warning' | 'info';
  message: string;
  suggestion?: string;
  contrast?: number;
}

/**
 * Calculate relative luminance of an RGB color
 * https://www.w3.org/TR/WCAG20/#relativeluminancedef
 */
const getLuminance = (r: number, g: number, b: number): number => {
  const [rs, gs, bs] = [r, g, b].map(val => {
    const sRGB = val / 255;
    return sRGB <= 0.03928 ? sRGB / 12.92 : Math.pow((sRGB + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
};

/**
 * Calculate contrast ratio between two colors
 * https://www.w3.org/TR/WCAG20/#contrast-ratiodef
 */
export const calculateContrastRatio = (color1: string, color2: string): number => {
  const parseColor = (color: string): [number, number, number] => {
    // Handle rgb/rgba format
    const rgbMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (rgbMatch) {
      return [parseInt(rgbMatch[1]), parseInt(rgbMatch[2]), parseInt(rgbMatch[3])];
    }
    
    // Handle hex format
    if (color.startsWith('#')) {
      const hex = color.slice(1);
      const bigint = parseInt(hex, 16);
      return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
    }
    
    return [0, 0, 0];
  };

  const [r1, g1, b1] = parseColor(color1);
  const [r2, g2, b2] = parseColor(color2);
  
  const lum1 = getLuminance(r1, g1, b1);
  const lum2 = getLuminance(r2, g2, b2);
  
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  
  return (lighter + 0.05) / (darker + 0.05);
};

/**
 * Check if element is visible
 */
const isVisible = (element: HTMLElement): boolean => {
  const style = window.getComputedStyle(element);
  return style.display !== 'none' && 
         style.visibility !== 'hidden' && 
         style.opacity !== '0';
};

/**
 * Check for missing alt attributes on images
 */
const checkMissingAlt = (element: HTMLElement): AccessibilityIssue | null => {
  if (element.tagName === 'IMG' && !element.getAttribute('alt')) {
    return {
      type: 'missing-alt',
      element,
      severity: 'error',
      message: 'Image missing alt attribute',
      suggestion: 'Add an alt attribute describing the image content, or alt="" for decorative images'
    };
  }
  return null;
};

/**
 * Check contrast ratio between text and background
 */
const checkContrast = (element: HTMLElement): AccessibilityIssue | null => {
  const style = window.getComputedStyle(element);
  const bgColor = style.backgroundColor;
  const textColor = style.color;
  
  // Skip if no text content or transparent background
  if (!element.textContent?.trim() || bgColor === 'rgba(0, 0, 0, 0)') {
    return null;
  }
  
  const contrast = calculateContrastRatio(bgColor, textColor);
  const fontSize = parseFloat(style.fontSize);
  const fontWeight = parseInt(style.fontWeight);
  
  // WCAG AA requires 4.5:1 for normal text, 3:1 for large text (18pt+ or 14pt+ bold)
  const isLargeText = fontSize >= 18 || (fontSize >= 14 && fontWeight >= 700);
  const minContrast = isLargeText ? 3 : 4.5;
  
  if (contrast < minContrast) {
    return {
      type: 'low-contrast',
      element,
      severity: contrast < minContrast * 0.8 ? 'error' : 'warning',
      message: `Low contrast ratio: ${contrast.toFixed(2)}:1`,
      suggestion: `Increase contrast to at least ${minContrast}:1 for WCAG AA compliance`,
      contrast
    };
  }
  
  return null;
};

/**
 * Check for missing labels on form inputs
 */
const checkMissingLabel = (element: HTMLElement): AccessibilityIssue | null => {
  if (['INPUT', 'SELECT', 'TEXTAREA'].includes(element.tagName)) {
    const id = element.getAttribute('id');
    const ariaLabel = element.getAttribute('aria-label');
    const ariaLabelledby = element.getAttribute('aria-labelledby');
    
    // Check if there's an associated label
    let hasLabel = false;
    if (id) {
      hasLabel = !!document.querySelector(`label[for="${id}"]`);
    }
    
    if (!hasLabel && !ariaLabel && !ariaLabelledby) {
      return {
        type: 'missing-label',
        element,
        severity: 'error',
        message: 'Form input missing label',
        suggestion: 'Add a <label> element, aria-label, or aria-labelledby attribute'
      };
    }
  }
  return null;
};

/**
 * Check for interactive elements without ARIA attributes
 */
const checkMissingAria = (element: HTMLElement): AccessibilityIssue | null => {
  // Check buttons without aria-label or text content
  if (element.tagName === 'BUTTON' && !element.textContent?.trim()) {
    const ariaLabel = element.getAttribute('aria-label');
    if (!ariaLabel) {
      return {
        type: 'missing-aria',
        element,
        severity: 'error',
        message: 'Button without accessible name',
        suggestion: 'Add aria-label or text content to describe the button\'s purpose'
      };
    }
  }
  
  // Check clickable elements without proper role
  const hasClickHandler = element.onclick || element.getAttribute('onclick');
  if (hasClickHandler && !['A', 'BUTTON', 'INPUT'].includes(element.tagName)) {
    const role = element.getAttribute('role');
    if (!role) {
      return {
        type: 'missing-aria',
        element,
        severity: 'warning',
        message: 'Clickable element missing role',
        suggestion: 'Add role="button" or use a semantic <button> element'
      };
    }
  }
  
  return null;
};

/**
 * Check heading hierarchy (h1 -> h2 -> h3, no skipping levels)
 */
const checkHeadingOrder = (rootElement: HTMLElement): AccessibilityIssue[] => {
  const issues: AccessibilityIssue[] = [];
  const headings = rootElement.querySelectorAll('h1, h2, h3, h4, h5, h6');
  let previousLevel = 0;
  
  headings.forEach((heading) => {
    const currentLevel = parseInt(heading.tagName.charAt(1));
    
    if (currentLevel - previousLevel > 1) {
      issues.push({
        type: 'heading-order',
        element: heading as HTMLElement,
        severity: 'warning',
        message: `Heading level skipped (h${previousLevel} -> h${currentLevel})`,
        suggestion: `Use h${previousLevel + 1} instead to maintain proper hierarchy`
      });
    }
    
    previousLevel = currentLevel;
  });
  
  return issues;
};

/**
 * Main accessibility checker function
 */
export const checkAccessibility = (rootElement: HTMLElement): AccessibilityIssue[] => {
  const issues: AccessibilityIssue[] = [];
  
  // Get all visible elements
  const allElements = rootElement.querySelectorAll('*');
  
  allElements.forEach((el) => {
    const element = el as HTMLElement;
    
    if (!isVisible(element)) return;
    
    // Run individual checks
    const missingAlt = checkMissingAlt(element);
    const contrastIssue = checkContrast(element);
    const missingLabel = checkMissingLabel(element);
    const missingAria = checkMissingAria(element);
    
    if (missingAlt) issues.push(missingAlt);
    if (contrastIssue) issues.push(contrastIssue);
    if (missingLabel) issues.push(missingLabel);
    if (missingAria) issues.push(missingAria);
  });
  
  // Check heading order (only once for the whole document)
  issues.push(...checkHeadingOrder(rootElement));
  
  return issues;
};

/**
 * Generate accessibility report summary
 */
export const generateAccessibilityReport = (issues: AccessibilityIssue[]): {
  total: number;
  errors: number;
  warnings: number;
  info: number;
  byType: Record<string, number>;
} => {
  const byType: Record<string, number> = {};
  
  issues.forEach(issue => {
    byType[issue.type] = (byType[issue.type] || 0) + 1;
  });
  
  return {
    total: issues.length,
    errors: issues.filter(i => i.severity === 'error').length,
    warnings: issues.filter(i => i.severity === 'warning').length,
    info: issues.filter(i => i.severity === 'info').length,
    byType
  };
};
