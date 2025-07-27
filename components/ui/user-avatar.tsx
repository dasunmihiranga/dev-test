import React from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { generateAvatarUrl, getUserInitials, getInitialsBgColor } from "@/lib/avatar-utils"

interface UserAvatarProps {
  user: {
    name: string
    email: string
    avatar?: string
  }
  size?: "sm" | "md" | "lg" | "xl"
  className?: string
  showFallback?: boolean
}

const sizeClasses = {
  sm: "h-6 w-6",
  md: "h-8 w-8", 
  lg: "h-10 w-10",
  xl: "h-16 w-16"
}

const fallbackTextSizes = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-base", 
  xl: "text-xl"
}

export function UserAvatar({ 
  user, 
  size = "md", 
  className = "", 
  showFallback = true 
}: UserAvatarProps) {
  const [imageError, setImageError] = React.useState(false)
  const avatarUrl = user.avatar || generateAvatarUrl(user.name, user.email)
  const initials = getUserInitials(user.name)
  const bgColor = getInitialsBgColor(user.name)

  const handleImageError = () => {
    setImageError(true)
  }

  return (
    <Avatar className={`${sizeClasses[size]} ${className}`}>
      {!imageError && (
        <AvatarImage 
          src={avatarUrl}
          alt={user.name}
          onError={handleImageError}
        />
      )}
      {showFallback && (
        <AvatarFallback 
          className={`${bgColor} text-white font-semibold ${fallbackTextSizes[size]}`}
        >
          {initials}
        </AvatarFallback>
      )}
    </Avatar>
  )
}
