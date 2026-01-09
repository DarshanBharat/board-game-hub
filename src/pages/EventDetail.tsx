import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { ArrowLeft, Calendar, Clock, MapPin, Users } from "lucide-react";
import { format } from "date-fns";
import type { Event } from "@shared/schema";

export default function EventDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isRegisterDialogOpen, setIsRegisterDialogOpen] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    paymentPhone: "",
    paymentTime: "",
  });

  const { data: event, isLoading } = useQuery<Event>({
    queryKey: ["/api/events", id],
    queryFn: async () => {
      const res = await fetch(`/api/events/${id}`, { credentials: "include" });
      if (!res.ok) throw new Error("Event not found");
      return res.json();
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: typeof paymentForm) => {
      const res = await apiRequest("POST", "/api/registrations", {
        eventId: parseInt(id!),
        paymentPhone: data.paymentPhone,
        paymentTime: data.paymentTime,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/registrations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/registrations/my"] });
      toast({ title: "Registration submitted!", description: "Please wait for admin to confirm your payment." });
      setIsRegisterDialogOpen(false);
    },
    onError: (error: any) => {
      toast({ title: "Failed to register", description: error.message, variant: "destructive" });
    },
  });

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({ title: "Please log in", description: "You need to be logged in to register for an event", variant: "destructive" });
      navigate("/login");
      return;
    }
    registerMutation.mutate(paymentForm);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container py-8">
          <Skeleton className="h-8 w-32 mb-4" />
          <div className="space-y-4">
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-24 w-full" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container py-8 text-center">
          <h1 className="text-2xl font-bold">Event not found</h1>
          <Button onClick={() => navigate("/events")} className="mt-4">
            Back to Events
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
          <Button
            variant="ghost"
            onClick={() => navigate("/events")}
            className="mb-6 gap-2"
            data-testid="button-back"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Events
          </Button>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6">
              {event.imageUrl && (
                <div className="aspect-video rounded-3xl overflow-hidden border-2 border-border shadow-soft">
                  <img
                    src={event.imageUrl}
                    alt={event.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div>
                <h1 className="font-display text-4xl font-bold mb-4">{event.name}</h1>
                <p className="text-muted-foreground text-lg">{event.description}</p>
              </div>
            </div>

            <div className="space-y-4">
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-primary" />
                    <span>{format(new Date(event.date), "EEEE, MMMM d, yyyy")}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-primary" />
                    <span>{event.time}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-primary" />
                    <span>{event.location}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-primary" />
                    <span>Capacity: {event.capacity} people</span>
                  </div>

                  <div className="pt-4 border-t">
                    <p className="text-2xl font-bold text-primary">Rs. {event.price}</p>
                    <p className="text-sm text-muted-foreground">per person</p>
                  </div>

                  <Dialog open={isRegisterDialogOpen} onOpenChange={setIsRegisterDialogOpen}>
                    <DialogTrigger asChild>
                      <Button
                        size="lg"
                        className="w-full"
                        data-testid="button-register"
                        onClick={() => {
                          if (!user) {
                            toast({ title: "Please log in", description: "You need to be logged in to register", variant: "destructive" });
                            navigate("/login");
                            return;
                          }
                        }}
                      >
                        Register Now
                      </Button>
                    </DialogTrigger>
                    {user && (
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>Register for {event.name}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleRegisterSubmit} className="space-y-4">
                          {event.price > 0 && (
                            <>
                              <Card className="bg-muted">
                                <CardContent className="pt-4">
                                  <p className="font-medium mb-2">Payment Instructions</p>
                                  <p className="text-sm text-muted-foreground">
                                    Pay Rs. {event.price} via UPI to: <strong>7845267809@ptyes</strong>
                                  </p>
                                </CardContent>
                              </Card>
                              <div className="space-y-2">
                                <Label htmlFor="paymentPhone">Payment Made From (Phone Number)</Label>
                                <Input
                                  id="paymentPhone"
                                  type="tel"
                                  placeholder="Phone number used for payment"
                                  value={paymentForm.paymentPhone}
                                  onChange={(e) => setPaymentForm({ ...paymentForm, paymentPhone: e.target.value })}
                                  required
                                  data-testid="input-payment-phone"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="paymentTime">Time of Payment</Label>
                                <Input
                                  id="paymentTime"
                                  type="datetime-local"
                                  value={paymentForm.paymentTime}
                                  onChange={(e) => setPaymentForm({ ...paymentForm, paymentTime: e.target.value })}
                                  required
                                  data-testid="input-payment-time"
                                />
                              </div>
                            </>
                          )}
                          <Button
                            type="submit"
                            className="w-full"
                            disabled={registerMutation.isPending}
                            data-testid="button-submit-registration"
                          >
                            {registerMutation.isPending ? "Registering..." : "Submit Registration"}
                          </Button>
                        </form>
                      </DialogContent>
                    )}
                  </Dialog>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
