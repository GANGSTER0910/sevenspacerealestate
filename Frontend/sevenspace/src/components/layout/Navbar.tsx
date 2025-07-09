import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { User, LogOut, Search } from "lucide-react";
import CommandK from "@/components/search/CommandK";
import { useToast } from "@/components/ui/use-toast";

const Navbar: React.FC = () => {
  const { user, logout, isAdmin } = useAuth();
  const [commandOpen, setCommandOpen] = useState(false);
  const { toast } = useToast();
  
  // Set up keyboard shortcut for command palette
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCommandOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out."
    });
  };

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <img
                className="h-10 w-auto"
                src="/lovable-uploads/image.png"
                alt="SevenSpace"
              />
              <div className="ml-3">
                <h1 className="text-xl font-semibold text-gray-800">SevenSpace</h1>
                <p className="text-xs text-gray-500">Real Estate</p>
              </div>
            </Link>
          </div>

          <div className="flex-1 flex items-center justify-center px-2 lg:ml-6 lg:justify-end">
            <div className="max-w-lg w-full lg:max-w-xs hidden md:block">
              <Button
                variant="outline"
                className="w-full pl-3 pr-3 py-2 text-left flex justify-between items-center text-muted-foreground"
                onClick={() => setCommandOpen(true)}
              >
                <div className="flex items-center">
                  <Search className="h-4 w-4 mr-2 text-gray-400" />
                  <span>Search properties, pages, or ...</span>
                </div>
                <kbd className="pointer-events-none hidden md:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100">
                  <span className="text-xs">⌘</span>K
                </kbd>
              </Button>
            </div>
          </div>

          <div className="flex items-center">
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                to="/"
                className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
              >
                Home
              </Link>
              <Link
                to="/property"
                className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
              >
                Property
              </Link>
              <Link
                to="/about"
                className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
              >
                About
              </Link>
              <Link
                to="/services"
                className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
              >
                Services
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
              >
                Contact
              </Link>
              
              {user ? (
                <>
                  {isAdmin() && (
                    <Link
                      to="/admin/properties"
                      className="inline-flex items-center px-1 pt-1 border-b-2 border-realestate-primary text-sm font-medium text-realestate-dark"
                    >
                      Admin
                    </Link>
                  )}
                  <Link
                    to={isAdmin() ? "/admin/properties" : "/user/dashboard"}
                    className="inline-flex items-center px-1 pt-1 border-b-2 border-realestate-primary text-sm font-medium text-realestate-dark"
                  >
                    Dashboard
                  </Link>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleLogout}
                    className="inline-flex items-center text-gray-500 hover:text-gray-700"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  >
                    <User className="h-4 w-4 mr-2" />
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <CommandK open={commandOpen} onOpenChange={setCommandOpen} />
    </nav>
  );
};

export default Navbar;
