import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Clock, MapPin, Users, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import type { Event } from "@shared/schema";

const highlights = [
  { text: "Meet cool people from different floors" },
  { text: "Games randomly assigned" },
  { text: "Snacks & drinks included" },
  { text: "Win fun prizes" },
];

const Events = () => {
  const navigate = useNavigate();

  const { data: events, isLoading } = useQuery<Event[]>({
    queryKey: ["/api/events"],
  });

  const upcomingEvents = events?.filter(e => new Date(e.date) >= new Date()) || [];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="relative overflow-hidden gradient-hero py-16 md:py-24">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxjaXJjbGUgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIiBjeD0iNDAiIGN5PSI0MCIgcj0iNSIvPjwvZz48L3N2Zz4=')] opacity-30" />
          
          <div className="container relative">
            <div className="max-w-2xl">
              <Badge className="mb-4 gradient-accent text-accent-foreground border-0 text-base px-4 py-2 font-bold">
                Every Saturday Night
              </Badge>
              <h1 className="font-display text-5xl md:text-6xl font-bold text-white mb-4">
                Saturday Night Gaming
              </h1>
              <p className="text-xl text-white/90 mb-8 font-medium">
                The most fun you'll have all week! Epic games, awesome people, 
                unforgettable memories. Don't miss out!
              </p>
              
              <div className="flex flex-wrap gap-3">
                {highlights.map((highlight, index) => (
                  <div 
                    key={index}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm text-white text-base font-bold border-2 border-white/30"
                  >
                    {highlight.text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 bg-secondary/50">
          <div className="container">
            <div className="flex items-center gap-3 mb-8">
              <Calendar className="h-8 w-8 text-primary" />
              <h2 className="font-display text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary via-pink-500 to-warning bg-clip-text text-transparent">
                Upcoming Events
              </h2>
            </div>
            
            {isLoading ? (
              <div className="grid md:grid-cols-2 gap-6">
                {[1, 2].map((i) => (
                  <Skeleton key={i} className="h-80 rounded-3xl" />
                ))}
              </div>
            ) : upcomingEvents.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-xl">No upcoming events. Check back soon!</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {upcomingEvents.map((event, index) => (
                  <div 
                    key={event.id}
                    className="bg-card rounded-3xl border-2 border-primary/20 shadow-soft hover:shadow-elevated transition-all duration-300 overflow-hidden animate-fade-in hover:-translate-y-1"
                    style={{ animationDelay: `${index * 100}ms` }}
                    data-testid={`event-card-${event.id}`}
                  >
                    {event.imageUrl && (
                      <div className="aspect-video overflow-hidden">
                        <img
                          src={event.imageUrl}
                          alt={event.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-display text-2xl font-bold">
                            {event.name}
                          </h3>
                        </div>
                        <div className="text-right">
                          <p className="font-display text-3xl font-bold text-primary">Rs. {event.price}</p>
                          <p className="text-sm text-muted-foreground font-medium">per person</p>
                        </div>
                      </div>
                      
                      <div className="space-y-3 mb-6">
                        <div className="flex items-center gap-3 text-muted-foreground">
                          <Calendar className="h-5 w-5" />
                          <span className="font-medium">{format(new Date(event.date), "EEEE, MMMM d, yyyy")}</span>
                        </div>
                        <div className="flex items-center gap-3 text-muted-foreground">
                          <Clock className="h-5 w-5" />
                          <span className="font-medium">{event.time}</span>
                        </div>
                        <div className="flex items-center gap-3 text-muted-foreground">
                          <MapPin className="h-5 w-5" />
                          <span className="font-medium">{event.location}</span>
                        </div>
                        <div className="flex items-center gap-3 text-muted-foreground">
                          <Users className="h-5 w-5" />
                          <span className="font-medium">Capacity: {event.capacity} people</span>
                        </div>
                      </div>
                      
                      <Link to={`/events/${event.id}`}>
                        <Button className="w-full gap-2 text-lg" data-testid={`button-register-event-${event.id}`}>
                          Register Now
                          <ArrowRight className="h-5 w-5" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="py-16 bg-secondary/50">
          <div className="container text-center">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-primary via-pink-500 to-warning bg-clip-text text-transparent">
              Ready to Join the Fun?
            </h2>
            <p className="text-muted-foreground text-xl mb-8 max-w-md mx-auto">
              Sign up now and get notified about upcoming events. Don't miss out!
            </p>
            <Button size="lg" onClick={() => navigate("/signup")} data-testid="button-create-account">
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
