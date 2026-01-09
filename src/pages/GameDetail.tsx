import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { ArrowLeft, Clock, Users, Brain, ExternalLink, Package } from "lucide-react";
import type { Game } from "@shared/schema";

export default function GameDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isRentDialogOpen, setIsRentDialogOpen] = useState(false);
  const [rentalForm, setRentalForm] = useState({
    startDate: "",
    endDate: "",
    paymentPhone: "",
    paymentTime: "",
  });

  const { data: game, isLoading } = useQuery<Game>({
    queryKey: ["/api/games", id],
    queryFn: async () => {
      const res = await fetch(`/api/games/${id}`, { credentials: "include" });
      if (!res.ok) throw new Error("Game not found");
      return res.json();
    },
  });

  const rentMutation = useMutation({
    mutationFn: async (data: typeof rentalForm) => {
      const res = await apiRequest("POST", "/api/rentals", {
        gameId: parseInt(id!),
        startDate: data.startDate,
        endDate: data.endDate,
        paymentPhone: data.paymentPhone,
        paymentTime: data.paymentTime,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/games"] });
      queryClient.invalidateQueries({ queryKey: ["/api/rentals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/rentals/my"] });
      toast({ title: "Rental request submitted!", description: "Please wait for admin approval." });
      setIsRentDialogOpen(false);
      navigate("/my-rentals");
    },
    onError: (error: any) => {
      toast({ title: "Failed to submit rental", description: error.message, variant: "destructive" });
    },
  });

  const handleRentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({ title: "Please log in", description: "You need to be logged in to rent a game", variant: "destructive" });
      navigate("/login");
      return;
    }
    rentMutation.mutate(rentalForm);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container py-8">
          <Skeleton className="h-8 w-32 mb-4" />
          <div className="grid md:grid-cols-2 gap-8">
            <Skeleton className="aspect-[4/3] rounded-3xl" />
            <div className="space-y-4">
              <Skeleton className="h-12 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-24 w-full" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!game) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container py-8 text-center">
          <h1 className="text-2xl font-bold">Game not found</h1>
          <Button onClick={() => navigate("/games")} className="mt-4">
            Back to Games
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  const whatsInTheBox = game.whatsInTheBox || [];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-gradient-warm">
        <div className="container py-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/games")}
            className="mb-6 gap-2"
            data-testid="button-back"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Games
          </Button>

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <div className="relative aspect-[4/3] rounded-3xl overflow-hidden border-2 border-border shadow-soft">
                <img
                  src={game.imageUrl || "https://images.unsplash.com/photo-1632501641765-e568d28b0015?w=600"}
                  alt={game.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 right-4">
                  <Badge className={game.available ? "bg-green-500" : "bg-red-500"}>
                    {game.available ? "Available" : "Unavailable"}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <Badge variant="outline" className="mb-2">{game.category}</Badge>
                <h1 className="font-display text-4xl font-bold">{game.name}</h1>
              </div>

              <p className="text-muted-foreground text-lg">{game.description}</p>

              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="h-5 w-5" />
                  <span>{game.minPlayers}-{game.maxPlayers} Players</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-5 w-5" />
                  <span>{game.duration}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Brain className="h-5 w-5" />
                  <span>{game.complexity} Complexity</span>
                </div>
              </div>

              {game.rulesUrl && (
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={() => window.open(game.rulesUrl!, "_blank")}
                  data-testid="button-view-rules"
                >
                  <ExternalLink className="h-4 w-4" /> View Rules
                </Button>
              )}

              <Dialog open={isRentDialogOpen} onOpenChange={setIsRentDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    size="lg"
                    className="w-full"
                    disabled={!game.available}
                    data-testid="button-rent-game"
                    onClick={() => {
                      if (!user) {
                        toast({ title: "Please log in", description: "You need to be logged in to rent a game", variant: "destructive" });
                        navigate("/login");
                        return;
                      }
                    }}
                  >
                    {game.available ? "Rent This Game" : "Currently Unavailable"}
                  </Button>
                </DialogTrigger>
                {user && (
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Rent {game.name}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleRentSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="startDate">Start Date</Label>
                        <Input
                          id="startDate"
                          type="date"
                          value={rentalForm.startDate}
                          onChange={(e) => setRentalForm({ ...rentalForm, startDate: e.target.value })}
                          required
                          data-testid="input-start-date"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="endDate">End Date</Label>
                        <Input
                          id="endDate"
                          type="date"
                          value={rentalForm.endDate}
                          onChange={(e) => setRentalForm({ ...rentalForm, endDate: e.target.value })}
                          required
                          data-testid="input-end-date"
                        />
                      </div>
                      <Card className="bg-muted">
                        <CardContent className="pt-4">
                          <p className="font-medium mb-2">Payment Instructions</p>
                          <p className="text-sm text-muted-foreground">
                            Pay via UPI to: <strong>7845267809@ptyes</strong>
                          </p>
                        </CardContent>
                      </Card>
                      <div className="space-y-2">
                        <Label htmlFor="paymentPhone">Payment Made From (Phone Number)</Label>
                        <Input
                          id="paymentPhone"
                          type="tel"
                          placeholder="Phone number used for payment"
                          value={rentalForm.paymentPhone}
                          onChange={(e) => setRentalForm({ ...rentalForm, paymentPhone: e.target.value })}
                          required
                          data-testid="input-payment-phone"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="paymentTime">Time of Payment</Label>
                        <Input
                          id="paymentTime"
                          type="datetime-local"
                          value={rentalForm.paymentTime}
                          onChange={(e) => setRentalForm({ ...rentalForm, paymentTime: e.target.value })}
                          required
                          data-testid="input-payment-time"
                        />
                      </div>
                      <Button
                        type="submit"
                        className="w-full"
                        disabled={rentMutation.isPending}
                        data-testid="button-submit-rental"
                      >
                        {rentMutation.isPending ? "Submitting..." : "Submit Rental Request"}
                      </Button>
                    </form>
                  </DialogContent>
                )}
              </Dialog>
            </div>
          </div>

          {whatsInTheBox.length > 0 && (
            <Card className="mt-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" /> What's in the Box
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="grid sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {whatsInTheBox.map((item, index) => (
                    <li key={index} className="flex items-center gap-2 text-muted-foreground">
                      <span className="w-2 h-2 bg-primary rounded-full" />
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
