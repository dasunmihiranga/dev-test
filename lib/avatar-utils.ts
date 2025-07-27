/**
 * Utility functions for user avatars and profile pictures
 */

/**
 * Generates a default avatar URL using DiceBear API or Gravatar
 * @param name - User's name
 * @param email - User's email (optional, for Gravatar)
 * @returns URL string for avatar image
 */
export function generateAvatarUrl(name: string, email?: string): string {
  // Try DiceBear API first for consistent, colorful avatars
  try {
    const initials = name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
    
    // Using DiceBear's initials style with better parameters
    return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=3b82f6,ef4444,f59e0b,10b981,8b5cf6,f97316&textColor=ffffff&fontSize=50`
  } catch {
    // Fallback to local default avatar
    return '/default-avatar.svg'
  }
}

/**
 * Generates a Gravatar URL as fallback
 * @param email - User's email
 * @returns Gravatar URL string
 */
export function generateGravatarUrl(email: string): string {
  // Simple hash function for demonstration (in production, use proper MD5)
  const hash = btoa(email.toLowerCase().trim()).replace(/[^a-zA-Z0-9]/g, '').toLowerCase()
  return `https://www.gravatar.com/avatar/${hash}?d=identicon&s=200`
}

/**
 * Gets user initials for fallback display
 * @param name - User's name
 * @returns Initials string (max 2 characters)
 */
export function getUserInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

/**
 * Gets a consistent background color for user initials
 * @param name - User's name
 * @returns Tailwind CSS background color class
 */
export function getInitialsBgColor(name: string): string {
  const colors = [
    'bg-blue-500',
    'bg-green-500', 
    'bg-purple-500',
    'bg-pink-500',
    'bg-yellow-500',
    'bg-red-500',
    'bg-indigo-500',
    'bg-teal-500'
  ]
  
  // Use name length to consistently pick a color
  const index = name.length % colors.length
  return colors[index]
}
