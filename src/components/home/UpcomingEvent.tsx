import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users, Clock, Sparkles } from "lucide-react";

export function UpcomingEvent() {
  // Mock data - will be replaced with real data
  const event = {
    id: "1",
    title: "Strategy Night",
    date: "Saturday, Jan 11",
    time: "8:00 PM - 11:00 PM",
    location: "Common Room, Block A",
    theme: "Strategy & Conquest",
    maxParticipants: 20,
    currentParticipants: 14,
    fee: 50,
    spotsLeft: 6,
  };

  const progressPercent = (event.currentParticipants / event.maxParticipants) * 100;

  return (
    <section className="py-20 bg-secondary/30">
      <div className="container">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <Badge className="mb-4 gradient-accent text-accent-foreground border-0">
              <Sparkles className="h-3 w-3 mr-1" />
              This Week
            </Badge>
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Saturday Night Gaming
            </h2>
            <p className="text-muted-foreground text-lg">
              Join us for an epic night of board games, snacks, and good vibes
            </p>
          </div>

          <div className="bg-card rounded-3xl border border-border shadow-elevated overflow-hidden">
            <div className="grid md:grid-cols-2">
              {/* Left: Event Details */}
              <div className="p-8 md:p-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-sm font-medium mb-6">
                  {event.theme}
                </div>

                <h3 className="font-display text-2xl md:text-3xl font-bold mb-6">
                  {event.title}
                </h3>

                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{event.date}</p>
                      <p className="text-sm">{event.time}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-muted-foreground">
                    <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                      <MapPin className="h-5 w-5 text-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{event.location}</p>
                      <p className="text-sm">Hostel premises</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-muted-foreground">
                    <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                      <Users className="h-5 w-5 text-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{event.currentParticipants}/{event.maxParticipants} registered</p>
                      <p className="text-sm">{event.spotsLeft} spots remaining</p>
                    </div>
                  </div>
                </div>

                <Link to={`/events/${event.id}`}>
                  <Button variant="hero" size="lg" className="w-full md:w-auto">
                    Register Now — ₹{event.fee}
                  </Button>
                </Link>
              </div>

              {/* Right: Visual */}
              <div className="relative gradient-hero p-8 md:p-10 flex flex-col justify-center">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYtMi42ODYgNi02cy0yLjY4Ni02LTYtNi02IDIuNjg2LTYgNiAyLjY4NiA2IDYgNnoiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIiBzdHJva2Utd2lkdGg9IjIiLz48L2c+PC9zdmc+')] opacity-30" />
                
                <div className="relative">
                  {/* Progress Circle */}
                  <div className="w-40 h-40 mx-auto mb-6 relative">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="80"
                        cy="80"
                        r="70"
                        stroke="rgba(255,255,255,0.2)"
                        strokeWidth="8"
                        fill="none"
                      />
                      <circle
                        cx="80"
                        cy="80"
                        r="70"
                        stroke="hsl(36, 100%, 50%)"
                        strokeWidth="8"
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 70}`}
                        strokeDashoffset={`${2 * Math.PI * 70 * (1 - progressPercent / 100)}`}
                        className="transition-all duration-1000"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                      <span className="font-display text-4xl font-bold">{event.spotsLeft}</span>
                      <span className="text-sm text-white/70">spots left</span>
                    </div>
                  </div>

                  <div className="text-center text-white">
                    <p className="text-lg font-medium mb-2">Filling up fast!</p>
                    <p className="text-white/70 text-sm">
                      Games will be randomly assigned based on group size
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
