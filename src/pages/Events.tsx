import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  MapPin, 
  Users, 
  Clock, 
  Sparkles,
  CheckCircle2,
  ArrowRight
} from "lucide-react";

// Mock events data
const upcomingEvents = [
  {
    id: "1",
    title: "Strategy Night",
    date: "Saturday, Jan 11",
    time: "8:00 PM - 11:00 PM",
    location: "Common Room, Block A",
    theme: "Strategy & Conquest",
    maxParticipants: 20,
    currentParticipants: 14,
    fee: 50,
    status: "open",
  },
  {
    id: "2",
    title: "Party Games Bonanza",
    date: "Saturday, Jan 18",
    time: "8:00 PM - 11:00 PM",
    location: "Common Room, Block A",
    theme: "Fun & Laughter",
    maxParticipants: 24,
    currentParticipants: 8,
    fee: 40,
    status: "open",
  },
];

const pastEvents = [
  {
    id: "p1",
    title: "New Year's Game Marathon",
    date: "Saturday, Jan 4",
    participants: 18,
    gamesPlayed: 6,
  },
  {
    id: "p2",
    title: "Winter Warmup",
    date: "Saturday, Dec 28",
    participants: 16,
    gamesPlayed: 5,
  },
];

const highlights = [
  "Meet new people from different floors",
  "Games randomly assigned based on group sizes",
  "Snacks & drinks included",
  "Win prizes for top players",
];

const Events = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden gradient-hero py-16 md:py-24">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYtMi42ODYgNi02cy0yLjY4Ni02LTYtNi02IDIuNjg2LTYgNiAyLjY4NiA2IDYgNnoiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIiBzdHJva2Utd2lkdGg9IjIiLz48L2c+PC9zdmc+')] opacity-30" />
          
          <div className="container relative">
            <div className="max-w-2xl">
              <Badge className="mb-4 gradient-accent text-accent-foreground border-0">
                <Sparkles className="h-3 w-3 mr-1" />
                Every Saturday Night
              </Badge>
              <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
                Saturday Night Gaming
              </h1>
              <p className="text-lg text-white/80 mb-8">
                Join us every weekend for epic board game sessions. Meet new people, 
                discover new games, and create unforgettable memories.
              </p>
              
              <div className="flex flex-wrap gap-3">
                {highlights.map((highlight, index) => (
                  <div 
                    key={index}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm text-white/90 text-sm"
                  >
                    <CheckCircle2 className="h-4 w-4 text-accent" />
                    {highlight}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Upcoming Events */}
        <section className="py-16 bg-secondary/30">
          <div className="container">
            <h2 className="font-display text-2xl md:text-3xl font-bold mb-8">
              Upcoming Events
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              {upcomingEvents.map((event, index) => {
                const spotsLeft = event.maxParticipants - event.currentParticipants;
                const progressPercent = (event.currentParticipants / event.maxParticipants) * 100;
                
                return (
                  <div 
                    key={event.id}
                    className="bg-card rounded-2xl border border-border shadow-soft hover:shadow-elevated transition-all duration-300 overflow-hidden animate-fade-in"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <Badge className="mb-2 bg-accent/10 text-accent border-0">
                            {event.theme}
                          </Badge>
                          <h3 className="font-display text-xl font-bold">
                            {event.title}
                          </h3>
                        </div>
                        <div className="text-right">
                          <p className="font-display text-2xl font-bold text-accent">₹{event.fee}</p>
                          <p className="text-sm text-muted-foreground">per person</p>
                        </div>
                      </div>
                      
                      <div className="space-y-3 mb-6">
                        <div className="flex items-center gap-3 text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>{event.date}</span>
                        </div>
                        <div className="flex items-center gap-3 text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>{event.time}</span>
                        </div>
                        <div className="flex items-center gap-3 text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span>{event.location}</span>
                        </div>
                      </div>
                      
                      {/* Progress */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="text-muted-foreground">
                            <Users className="h-4 w-4 inline mr-1" />
                            {event.currentParticipants}/{event.maxParticipants} registered
                          </span>
                          <span className={`font-medium ${spotsLeft <= 5 ? 'text-destructive' : 'text-success'}`}>
                            {spotsLeft} spots left
                          </span>
                        </div>
                        <div className="h-2 bg-secondary rounded-full overflow-hidden">
                          <div 
                            className="h-full gradient-accent rounded-full transition-all duration-500"
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                      </div>
                      
                      <Button variant="hero" className="w-full gap-2">
                        Register Now
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Past Events */}
        <section className="py-16">
          <div className="container">
            <h2 className="font-display text-2xl md:text-3xl font-bold mb-8">
              Past Events
            </h2>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {pastEvents.map((event, index) => (
                <div 
                  key={event.id}
                  className="bg-card rounded-xl border border-border p-5 animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <p className="text-sm text-muted-foreground mb-1">{event.date}</p>
                  <h3 className="font-display font-semibold mb-3">{event.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span><Users className="h-4 w-4 inline mr-1" />{event.participants}</span>
                    <span>🎲 {event.gamesPlayed} games</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-secondary/30">
          <div className="container text-center">
            <h2 className="font-display text-2xl md:text-3xl font-bold mb-4">
              Ready to Join the Fun?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Sign up now and get notified about upcoming events. Don't miss out on the next game night!
            </p>
            <Button variant="hero" size="lg">
              Create Your Account
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Events;
