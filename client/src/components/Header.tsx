import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Video, Menu, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
  onStartCall?: () => void;
}

export default function Header({ onStartCall }: HeaderProps) {
  const { user, logoutMutation } = useAuth();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <header className="bg-whatsapp-primary text-white p-4 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
          <Video className="text-whatsapp-primary" size={20} />
        </div>
        <h1 className="text-xl font-semibold" data-testid="text-app-title">VideoChat</h1>
      </div>
      
      <nav className="hidden md:flex items-center space-x-6">
        <a href="#" className="hover:text-gray-200 transition-colors" data-testid="link-home">Home</a>
        <a href="#" className="hover:text-gray-200 transition-colors" data-testid="link-about">About</a>
        <a href="#" className="hover:text-gray-200 transition-colors" data-testid="link-contact">Contact</a>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="text-white hover:bg-white/10" data-testid="button-user-menu">
              {user?.username}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={handleLogout} data-testid="button-logout">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </nav>
      
      <div className="md:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="text-white" data-testid="button-mobile-menu">
              <Menu size={20} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem data-testid="link-mobile-home">Home</DropdownMenuItem>
            <DropdownMenuItem data-testid="link-mobile-about">About</DropdownMenuItem>
            <DropdownMenuItem data-testid="link-mobile-contact">Contact</DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout} data-testid="button-mobile-logout">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
