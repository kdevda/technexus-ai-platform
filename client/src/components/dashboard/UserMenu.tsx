import * as React from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/hooks/useAuth"
import { useNavigate } from "react-router-dom"

interface User {
  name?: string;
  email?: string;
  avatar?: string;
}

export const UserMenu = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  
  // Get initials from name or email
  const getInitials = () => {
    if (user?.name) {
      return user.name.split(' ').map((n: string) => n[0]).join('')
    }
    return user?.email?.substring(0, 2).toUpperCase() || 'U'
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Avatar>
          <AvatarImage src={user?.avatar} alt={user?.name || 'User avatar'} />
          <AvatarFallback>{getInitials()}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate('/platform/profile')}>
          My Profile
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate('/platform/admin')}>
          Admin Panel
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={logout}>
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 