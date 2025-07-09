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
import { propertyService } from "@/services/property.service";
import { Property } from "@/types/property";
import { 
  Home, 
  Building2, 
  Users, 
  Info, 
  HelpCircle, 
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

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const trimmed = searchTerm.trim();
    if( trimmed.length < 7) return
    const handler = setTimeout(async () => {
      if (!trimmed) {
        setSearchResults([]);
        return;
      }
      try {
        const results = await propertyService.search(trimmed);
        setSearchResults(results.properties?.slice(0, 5) || []);
      } catch (error) {
        console.error('Search error in CommandK:', error);
        setSearchResults([]);
      }
    }, 1000);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Navigate and close dialog
  const runCommand = (command: () => void) => {
    onOpenChange(false);
    command();
  };

  const formatPrice = (price: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(price);

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
  {searchTerm.trim() && searchResults.length === 0 ? (
    <CommandEmpty>No results found.</CommandEmpty>
  ) : (
    <>
      {searchResults.length > 0 && (
        <CommandGroup heading="Properties" forceMount>
          {searchResults.map((property) => (
            <CommandItem
              key={property._id}
              value={`${property.title} ${property.location}`} // make it searchable
              onSelect={() =>
                runCommand(() => navigate(`/property/${property._id}`))
              }
              className="flex items-center"
            >
              <Building2 className="mr-2 h-4 w-4" />
              <div className="flex flex-col">
                <span>{property.title}</span>
                <span className="text-xs text-muted-foreground">
                  {property.location || "Unknown"} | {formatPrice(property.price || 0)}
                </span>
              </div>
            </CommandItem>
          ))}
        </CommandGroup>
      )}
    </>
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
