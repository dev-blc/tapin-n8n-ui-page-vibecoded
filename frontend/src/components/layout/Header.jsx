import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Bell, Search, Plus, MessageSquare, Settings, User, LogOut, Zap, Shuffle, Heart } from 'lucide-react';

export const Header = ({ title, subtitle, actions }) => {
  const notifications = [
    { id: 1, message: "New user feedback received", time: "2 min ago", type: "info" },
    { id: 2, message: "Content pool needs attention", time: "1 hour ago", type: "warning" },
    { id: 3, message: "Daily analytics ready", time: "3 hours ago", type: "success" },
  ];

  return (
    <header className="bg-card border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left Section - Title & Breadcrumb */}
        <div className="flex items-center space-x-4">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
            {subtitle && (
              <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
            )}
          </div>
        </div>

        {/* Center Section - Search */}
        <div className="flex-1 max-w-md mx-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search users, content, or analytics..."
              className="pl-10 bg-muted/50 border-border"
            />
          </div>
        </div>

        {/* Right Section - Actions & User */}
        <div className="flex items-center space-x-3">
          {/* Action Buttons */}
          {actions && (
            <div className="flex items-center space-x-2">
              {actions}
            </div>
          )}

          {/* Quick Actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                Quick Add
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Create New</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Zap className="h-4 w-4 mr-2" />
                Quick Shift Variation
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Shuffle className="h-4 w-4 mr-2" />
                Plot Twist Quest
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Heart className="h-4 w-4 mr-2" />
                Affirmation Template
              </DropdownMenuItem>
              <DropdownMenuItem>
                <MessageSquare className="h-4 w-4 mr-2" />
                Teaching Moment
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {notifications.length > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                    {notifications.length}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {notifications.map((notification) => (
                <DropdownMenuItem key={notification.id} className="flex-col items-start p-3">
                  <div className="flex items-start justify-between w-full">
                    <p className="text-sm">{notification.message}</p>
                    <Badge 
                      variant={notification.type === 'warning' ? 'destructive' : 'secondary'}
                      className="ml-2 text-xs"
                    >
                      {notification.type}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-center">
                View All Notifications
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="text-sm font-medium">Admin</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="h-4 w-4 mr-2" />
                Profile Settings
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="h-4 w-4 mr-2" />
                Preferences
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};