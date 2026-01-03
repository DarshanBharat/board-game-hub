import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Dice6, Calendar, User, LogIn } from "lucide-react";

const navLinks = [
  { href: "/games", label: "Games", icon: Dice6 },
  { href: "/events", label: "Saturday Nights", icon: Calendar },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-hero">
            <Dice6 className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-display text-xl font-bold text-foreground group-hover:text-accent transition-colors">
            GameNight
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link key={link.href} to={link.href}>
                <Button
                  variant={isActive(link.href) ? "secondary" : "ghost"}
                  className="gap-2"
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </Button>
              </Link>
            );
          })}
        </nav>

        {/* Desktop Auth Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <Link to="/login">
            <Button variant="ghost" className="gap-2">
              <LogIn className="h-4 w-4" />
              Login
            </Button>
          </Link>
          <Link to="/signup">
            <Button variant="hero" className="gap-2">
              Get Started
            </Button>
          </Link>
        </div>

        {/* Mobile Menu */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] sm:w-[400px]">
            <nav className="flex flex-col gap-4 mt-8">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    to={link.href}
                    onClick={() => setIsOpen(false)}
                  >
                    <Button
                      variant={isActive(link.href) ? "secondary" : "ghost"}
                      className="w-full justify-start gap-3 h-12"
                    >
                      <Icon className="h-5 w-5" />
                      {link.label}
                    </Button>
                  </Link>
                );
              })}
              <div className="border-t border-border my-4" />
              <Link to="/login" onClick={() => setIsOpen(false)}>
                <Button variant="outline" className="w-full h-12 gap-2">
                  <LogIn className="h-5 w-5" />
                  Login
                </Button>
              </Link>
              <Link to="/signup" onClick={() => setIsOpen(false)}>
                <Button variant="hero" className="w-full h-12">
                  Get Started
                </Button>
              </Link>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
