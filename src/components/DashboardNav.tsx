import { Download, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import airsenseLogo from '@/assets/airsense-logo.png';

interface DashboardNavProps {
  onRefresh: () => void;
  onExport: (format: 'csv' | 'json') => void;
  onToggleAlerts: () => void;
  alertsEnabled: boolean;
}

export function DashboardNav({ onRefresh, onExport, onToggleAlerts, alertsEnabled }: DashboardNavProps) {
  return (
    <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <img src={airsenseLogo} alt="AirSense Logo" className="h-12 w-auto" />
            <div>
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                AirSense Monitor
              </h1>
              <p className="text-sm text-muted-foreground hidden sm:block">Real-time Environmental Monitoring</p>
            </div>
          </div>

          {/* Navigation & Actions */}
          <div className="flex items-center gap-2">
            {/* Alert Toggle */}
            <Button
              variant={alertsEnabled ? "default" : "outline"}
              size="icon"
              className="h-9 w-9"
              onClick={onToggleAlerts}
            >
              <Bell className={`h-4 w-4 ${alertsEnabled ? 'animate-pulse' : ''}`} />
            </Button>

            {/* Export Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="h-9 w-9">
                  <Download className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-popover z-50">
                <DropdownMenuItem onClick={() => onExport('csv')}>
                  Export as CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onExport('json')}>
                  Export as JSON
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Theme Toggle */}
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
