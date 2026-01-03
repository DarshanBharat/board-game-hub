import { Link } from "react-router-dom";
import { Dice6, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-secondary/30">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-hero">
                <Dice6 className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-display text-xl font-bold">GameNight</span>
            </Link>
            <p className="text-muted-foreground max-w-sm">
              Bringing the hostel together through board games. Rent games, join Saturday night events, and make new friends.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <Link to="/games" className="hover:text-foreground transition-colors">
                  Browse Games
                </Link>
              </li>
              <li>
                <Link to="/events" className="hover:text-foreground transition-colors">
                  Saturday Nights
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="hover:text-foreground transition-colors">
                  How It Works
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-display font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                <Link to="/rules" className="hover:text-foreground transition-colors">
                  Rental Rules
                </Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-foreground transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-foreground transition-colors">
                  Contact Admin
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>© 2025 GameNight. Made for the hostel community.</p>
          <p className="flex items-center gap-1">
            Built with <Heart className="h-4 w-4 text-destructive fill-destructive" /> for board game lovers
          </p>
        </div>
      </div>
    </footer>
  );
}
