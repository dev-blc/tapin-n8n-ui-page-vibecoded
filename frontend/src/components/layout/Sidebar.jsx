import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  BarChart3,
  Zap,
  Shuffle,
  Settings,
  ChevronLeft,
  ChevronRight,
  Home,
  Heart,
  MessageSquare,
  BookOpen
} from 'lucide-react';

export const Sidebar = ({ collapsed = false, onToggle }) => {
  const location = useLocation();
  
  const menuItems = [
    {
      title: 'Dashboard',
      icon: Home,
      href: '/',
      description: 'Overview & Analytics'
    },
    {
      title: 'Content Management',
      items: [
        {
          title: 'Quick Shifts',
          icon: Zap,
          href: '/quick-shifts',
          description: 'Emotional regulation content',
          badge: 'Core'
        },
        {
          title: 'Plot Twists',
          icon: Shuffle,
          href: '/plot-twists',
          description: 'Daily challenges & quests',
          badge: 'Daily'
        },
        {
          title: 'Affirmations',
          icon: Heart,
          href: '/affirmations',
          description: 'Positive affirmation templates'
        },
        {
          title: 'Teaching Moments',
          icon: BookOpen,
          href: '/teaching-moments',
          description: 'Personal growth insights'
        }
      ]
    },
    {
      title: 'Management & Insights',
      items: [
        {
          title: 'User Management',
          icon: Users,
          href: '/users',
          description: 'User profiles & progress'
        },
        {
          title: 'Onboarding',
          icon: MessageSquare,
          href: '/onboarding',
          description: 'Setup questions & flow'
        },
        {
          title: 'Analytics & Reports',
          icon: BarChart3,
          href: '/analytics',
          description: 'Insights & performance'
        },
        {
          title: 'Settings',
          icon: Settings,
          href: '/settings',
          description: 'Platform configuration'
        }
      ]
    }
  ];

  const isActivePath = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <div className={cn(
      "flex flex-col h-screen bg-card border-r border-border transition-all duration-300",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        {!collapsed && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">T</span>
            </div>
            <div>
              <h2 className="font-semibold text-lg text-foreground">Tap In</h2>
              <p className="text-xs text-muted-foreground">Admin Panel</p>
            </div>
          </div>
        )}
        
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="flex-shrink-0"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-2 py-4">
        <nav className="space-y-2">
          {menuItems.map((section, sectionIndex) => (
            <div key={sectionIndex} className="space-y-2">
              {section.title && !collapsed && (
                <div className="px-3 py-2">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {section.title}
                  </h3>
                </div>
              )}
              
              {section.items ? (
                section.items.map((item, index) => (
                  <NavItem
                    key={index}
                    item={item}
                    isActive={isActivePath(item.href)}
                    collapsed={collapsed}
                  />
                ))
              ) : (
                <NavItem
                  item={section}
                  isActive={isActivePath(section.href)}
                  collapsed={collapsed}
                />
              )}
              
              {sectionIndex < menuItems.length - 1 && !collapsed && (
                <Separator className="my-4" />
              )}
            </div>
          ))}
        </nav>
      </ScrollArea>

      {/* User Profile */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-secondary rounded-full flex items-center justify-center">
            <span className="text-secondary-foreground font-medium text-sm">A</span>
          </div>
          {!collapsed && (
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Admin User</p>
              <p className="text-xs text-muted-foreground">Super Admin</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const NavItem = ({ item, isActive, collapsed }) => {
  const Icon = item.icon;
  
  return (
    <Link to={item.href}>
      <div
        className={cn(
          "flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors group",
          isActive
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        )}
      >
        <Icon className={cn("h-5 w-5 flex-shrink-0", isActive && "text-primary-foreground")} />
        
        {!collapsed && (
          <>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{item.title}</span>
                {item.badge && (
                  <Badge variant="secondary" className="text-xs">
                    {item.badge}
                  </Badge>
                )}
              </div>
              {item.description && (
                <p className="text-xs opacity-70">{item.description}</p>
              )}
            </div>
          </>
        )}
      </div>
    </Link>
  );
};