import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Dice1, Dice2, Dice3, Dice4, Dice5, Dice6, Users, Calendar, Gamepad2 } from "lucide-react";

const floatingDice = [Dice1, Dice2, Dice3, Dice4, Dice5, Dice6];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 gradient-hero" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYtMi42ODYgNi02cy0yLjY4Ni02LTYtNi02IDIuNjg2LTYgNiAyLjY4NiA2IDYgNnoiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIiBzdHJva2Utd2lkdGg9IjIiLz48L2c+PC9zdmc+')] opacity-30" />
      
      {/* Floating Dice */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {floatingDice.map((DiceIcon, index) => (
          <DiceIcon
            key={index}
            className="absolute text-white/10 animate-float"
            style={{
              width: `${30 + index * 10}px`,
              height: `${30 + index * 10}px`,
              left: `${10 + index * 15}%`,
              top: `${20 + (index % 3) * 25}%`,
              animationDelay: `${index * 0.5}s`,
              animationDuration: `${5 + index}s`,
            }}
          />
        ))}
      </div>

      <div className="container relative py-24 md:py-32 lg:py-40">
        <div className="max-w-3xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 text-sm mb-8 animate-fade-in">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
            </span>
            Saturday Night Event This Week!
          </div>

          {/* Heading */}
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 animate-fade-in [animation-delay:100ms]">
            Game Nights Made
            <span className="block text-accent">Simple & Social</span>
          </h1>

          {/* Description */}
          <p className="text-lg md:text-xl text-white/80 mb-10 max-w-2xl mx-auto animate-fade-in [animation-delay:200ms]">
            Rent board games from your hostel's collection, join Saturday night gaming events, and connect with fellow game enthusiasts.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in [animation-delay:300ms]">
            <Link to="/games">
              <Button variant="hero" size="xl" className="w-full sm:w-auto">
                Browse Games
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link to="/events">
              <Button 
                variant="outline" 
                size="xl" 
                className="w-full sm:w-auto border-white/30 text-white hover:bg-white/10 hover:text-white"
              >
                Join Saturday Night
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="relative bg-white/5 backdrop-blur-sm border-t border-white/10">
        <div className="container py-6">
          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-accent mb-1">
                <Gamepad2 className="h-5 w-5" />
                <span className="font-display text-2xl font-bold text-white">25+</span>
              </div>
              <p className="text-sm text-white/60">Board Games</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-accent mb-1">
                <Users className="h-5 w-5" />
                <span className="font-display text-2xl font-bold text-white">100+</span>
              </div>
              <p className="text-sm text-white/60">Players</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-accent mb-1">
                <Calendar className="h-5 w-5" />
                <span className="font-display text-2xl font-bold text-white">Weekly</span>
              </div>
              <p className="text-sm text-white/60">Events</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
