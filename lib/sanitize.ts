// Utility functions for input sanitization to prevent XSS attacks

/**
 * Escapes HTML special characters to prevent XSS attacks
 */
export function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
    .replace(/\//g, "&#x2F;")
}

/**
 * Sanitizes user input by removing potentially dangerous characters
 * while preserving safe text
 */
export function sanitizeInput(input: string): string {
  // Remove any script tags and their content
  let sanitized = input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
  
  // Remove any other HTML tags
  sanitized = sanitized.replace(/<[^>]+>/g, "")
  
  // Remove any on* event handlers
  sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, "")
  
  // Trim whitespace
  sanitized = sanitized.trim()
  
  return sanitized
}

/**
 * Validates and sanitizes email addresses
 */
export function sanitizeEmail(email: string): string {
  // Convert to lowercase and trim
  const sanitized = email.toLowerCase().trim()
  
  // Basic email validation regex
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  
  if (!emailRegex.test(sanitized)) {
    throw new Error("Invalid email format")
  }
  
  return sanitized
}

/**
 * Sanitizes user names by allowing only letters, spaces, hyphens, and apostrophes
 */
export function sanitizeName(name: string): string {
  // Trim the name first
  const trimmed = name.trim()
  
  // Remove any characters that aren't letters, spaces, hyphens, or apostrophes
  const sanitized = trimmed.replace(/[^a-zA-Z\s\-']/g, "")
  
  // Ensure the name isn't empty after sanitization
  if (!sanitized || sanitized.length === 0) {
    throw new Error("Name contains invalid characters")
  }
  
  // Limit length
  if (sanitized.length > 100) {
    return sanitized.substring(0, 100)
  }
  
  return sanitized
}

/**
 * Sanitizes URLs to prevent malicious redirects
 */
export function sanitizeUrl(url: string): string {
  try {
    const parsed = new URL(url)
    
    // Only allow http and https protocols
    if (!["http:", "https:"].includes(parsed.protocol)) {
      throw new Error("Invalid URL protocol")
    }
    
    return parsed.toString()
  } catch {
    throw new Error("Invalid URL")
  }
}
