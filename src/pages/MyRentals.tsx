import { useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { format } from "date-fns";
import type { Rental, Game } from "@shared/schema";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500",
  approved: "bg-blue-500",
  active: "bg-green-500",
  return_requested: "bg-orange-500",
  completed: "bg-gray-500",
  cancelled: "bg-red-500",
};

const statusLabels: Record<string, string> = {
  pending: "Pending Approval",
  approved: "Approved",
  active: "Active",
  return_requested: "Return Requested",
  completed: "Completed",
  cancelled: "Cancelled",
};

type RentalWithGame = Rental & { game?: Game };

export default function MyRentals() {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  const { data: rentals, isLoading } = useQuery<RentalWithGame[]>({
    queryKey: ["/api/rentals/my"],
    enabled: !!user,
  });

  const returnMutation = useMutation({
    mutationFn: async (rentalId: number) => {
      const res = await apiRequest("POST", `/api/rentals/${rentalId}/return-request`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/rentals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/rentals/my"] });
      toast({ title: "Return requested", description: "Admin will process your return soon." });
    },
    onError: (error: any) => {
      toast({ title: "Failed to request return", description: error.message, variant: "destructive" });
    },
  });

  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container py-8">
          <Skeleton className="h-8 w-48 mb-6" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Please log in to view your rentals</h1>
          <Button onClick={() => navigate("/login")} data-testid="button-login">
            Login
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-gradient-warm">
        <div className="container py-8">
          <h1 className="font-display text-3xl font-bold mb-6">My Rentals</h1>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          ) : !rentals || rentals.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground mb-4">You haven't rented any games yet.</p>
                <Button onClick={() => navigate("/games")} data-testid="button-browse-games">
                  Browse Games
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {rentals.map((rental) => (
                <Card key={rental.id} data-testid={`rental-card-${rental.id}`}>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        {rental.game?.imageUrl && (
                          <img
                            src={rental.game.imageUrl}
                            alt={rental.game.name}
                            className="w-20 h-20 rounded-lg object-cover"
                          />
                        )}
                        <div>
                          <h3 className="font-bold text-lg">{rental.game?.name || "Unknown Game"}</h3>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(rental.startDate), "MMM d, yyyy")} -{" "}
                            {format(new Date(rental.endDate), "MMM d, yyyy")}
                          </p>
                          <Badge className={`${statusColors[rental.status]} mt-2`}>
                            {statusLabels[rental.status]}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {rental.status === "active" && (
                          <Button
                            variant="outline"
                            onClick={() => returnMutation.mutate(rental.id)}
                            disabled={returnMutation.isPending}
                            data-testid={`button-return-${rental.id}`}
                          >
                            Request Return
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
