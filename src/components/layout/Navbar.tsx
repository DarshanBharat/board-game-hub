import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Menu, LogIn, LogOut, User, Settings, Package } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const navLinks = [
  { href: "/games", label: "Games" },
  { href: "/events", label: "Saturday Nights" },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAdmin, logout } = useAuth();
  const { toast } = useToast();

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = async () => {
    try {
      await logout();
      toast({ title: "Logged out", description: "See you soon!" });
      navigate("/");
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b-2 border-primary/10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-18 items-center justify-between py-3">
        <Link to="/" className="flex items-center gap-3 group" data-testid="link-home">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl gradient-hero shadow-soft group-hover:scale-110 transition-transform">
            <span className="text-2xl">🎲</span>
          </div>
          <span className="font-display text-2xl font-bold bg-gradient-to-r from-primary via-pink-500 to-warning bg-clip-text text-transparent">
            Boardy
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-2">
          {navLinks.map((link) => (
            <Link key={link.href} to={link.href} data-testid={`nav-link-${link.href.slice(1)}`}>
              <Button
                variant={isActive(link.href) ? "secondary" : "ghost"}
                className="gap-2 text-base"
              >
                {link.label}
              </Button>
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2" data-testid="button-user-menu">
                  <User className="h-4 w-4" />
                  {user.name}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => navigate("/my-rentals")} data-testid="menu-my-rentals">
                  <Package className="h-4 w-4 mr-2" />
                  My Rentals
                </DropdownMenuItem>
                {isAdmin && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate("/admin")} data-testid="menu-admin">
                      <Settings className="h-4 w-4 mr-2" />
                      Admin Dashboard
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} data-testid="menu-logout">
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link to="/login" data-testid="link-login">
                <Button variant="ghost" className="gap-2">
                  <LogIn className="h-4 w-4" />
                  Login
                </Button>
              </Link>
              <Link to="/signup" data-testid="link-signup">
                <Button className="gap-2">
                  Create Account
                </Button>
              </Link>
            </>
          )}
        </div>

        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon" data-testid="button-mobile-menu">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] sm:w-[400px]">
            <div className="flex items-center gap-3 mb-8">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl gradient-hero">
                <span className="text-2xl">🎲</span>
              </div>
              <span className="font-display text-2xl font-bold bg-gradient-to-r from-primary via-pink-500 to-warning bg-clip-text text-transparent">
                Boardy
              </span>
            </div>
            <nav className="flex flex-col gap-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setIsOpen(false)}
                >
                  <Button
                    variant={isActive(link.href) ? "secondary" : "ghost"}
                    className="w-full justify-start gap-3 h-14 text-lg"
                  >
                    {link.label}
                  </Button>
                </Link>
              ))}
              <div className="border-t-2 border-dashed border-primary/20 my-4" />
              {user ? (
                <>
                  <Link to="/my-rentals" onClick={() => setIsOpen(false)}>
                    <Button variant="outline" className="w-full h-14 gap-2 text-lg">
                      <Package className="h-5 w-5" />
                      My Rentals
                    </Button>
                  </Link>
                  {isAdmin && (
                    <Link to="/admin" onClick={() => setIsOpen(false)}>
                      <Button variant="outline" className="w-full h-14 gap-2 text-lg">
                        <Settings className="h-5 w-5" />
                        Admin Dashboard
                      </Button>
                    </Link>
                  )}
                  <Button variant="ghost" className="w-full h-14 gap-2 text-lg" onClick={handleLogout}>
                    <LogOut className="h-5 w-5" />
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setIsOpen(false)}>
                    <Button variant="outline" className="w-full h-14 gap-2 text-lg">
                      <LogIn className="h-5 w-5" />
                      Login
                    </Button>
                  </Link>
                  <Link to="/signup" onClick={() => setIsOpen(false)}>
                    <Button className="w-full h-14 text-lg">
                      Create Account
                    </Button>
                  </Link>
                </>
              )}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
