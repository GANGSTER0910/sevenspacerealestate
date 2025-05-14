
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "@/components/ui/command";
import { getAllProperties } from "@/services/propertyService";
import { Property } from "@/types/property";
import { 
  Search, 
  Home, 
  Building2, 
  Users, 
  Info, 
  HelpCircle, 
  MessageCircle, 
  Phone, 
  User 
} from "lucide-react";

interface CommandKProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CommandK: React.FC<CommandKProps> = ({ open, onOpenChange }) => {
  const [isMounted, setIsMounted] = useState(false);
  const navigate = useNavigate();
  const [searchResults, setSearchResults] = useState<Property[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Initial mounting check to prevent hydration issues
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Handle property search when term changes
  useEffect(() => {
    if (searchTerm) {
      const properties = getAllProperties();
      const filtered = properties.filter(
        property =>
          property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          property.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
          property.type.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setSearchResults(filtered.slice(0, 5)); // Limit to 5 results
    } else {
      setSearchResults([]);
    }
  }, [searchTerm]);

  // Navigate and close dialog
  const runCommand = (command: () => void) => {
    onOpenChange(false);
    command();
  };

  // Format price for display
  const formatPrice = (price: number) => {
    return price.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    });
  };

  if (!isMounted) {
    return null;
  }

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput 
        placeholder="Search properties, pages, or..." 
        onValueChange={setSearchTerm}
      />
      <CommandList className="max-h-[400px] overflow-auto">
        <CommandEmpty>No results found.</CommandEmpty>
        
        {searchResults.length > 0 && (
          <CommandGroup heading="Properties">
            {searchResults.map((property) => (
              <CommandItem
                key={property.id}
                onSelect={() => runCommand(() => navigate(`/property/${property.id}`))}
                className="flex items-center"
              >
                <Building2 className="mr-2 h-4 w-4" />
                <div className="flex flex-col">
                  <span>{property.title}</span>
                  <span className="text-xs text-muted-foreground">
                    {property.location} | {formatPrice(property.price)}
                  </span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        <CommandGroup heading="Pages">
          <CommandItem onSelect={() => runCommand(() => navigate("/"))}>
            <Home className="mr-2 h-4 w-4" />
            <span>Home</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate("/property"))}>
            <Building2 className="mr-2 h-4 w-4" />
            <span>Properties</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate("/about"))}>
            <Info className="mr-2 h-4 w-4" />
            <span>About</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate("/services"))}>
            <HelpCircle className="mr-2 h-4 w-4" />
            <span>Services</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate("/contact"))}>
            <Phone className="mr-2 h-4 w-4" />
            <span>Contact</span>
          </CommandItem>
        </CommandGroup>

        <CommandGroup heading="Account">
          <CommandItem onSelect={() => runCommand(() => navigate("/login"))}>
            <User className="mr-2 h-4 w-4" />
            <span>Login</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate("/register"))}>
            <Users className="mr-2 h-4 w-4" />
            <span>Register</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
};

export default CommandK;
