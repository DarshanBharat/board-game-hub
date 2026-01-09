import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { format } from "date-fns";
import { Plus, Edit, Trash2, Eye, Check, X, Package, PlayCircle } from "lucide-react";
import type { Game, User, Rental, Event, EventRegistration } from "@shared/schema";

type RentalWithDetails = Rental & { user?: User; game?: Game };
type RegistrationWithDetails = EventRegistration & { user?: User; event?: Event };

export default function Admin() {
  const navigate = useNavigate();
  const { user, isLoading: authLoading, isAdmin } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("games");

  const { data: games, isLoading: gamesLoading } = useQuery<Game[]>({
    queryKey: ["/api/games"],
    enabled: isAdmin,
  });

  const { data: rentals, isLoading: rentalsLoading } = useQuery<RentalWithDetails[]>({
    queryKey: ["/api/rentals"],
    enabled: isAdmin,
    refetchInterval: 5000,
  });

  const { data: events, isLoading: eventsLoading } = useQuery<Event[]>({
    queryKey: ["/api/events"],
    enabled: isAdmin,
    refetchInterval: 5000,
  });

  const { data: registrations, isLoading: regsLoading } = useQuery<RegistrationWithDetails[]>({
    queryKey: ["/api/registrations"],
    enabled: isAdmin,
    refetchInterval: 5000,
  });

  const { data: users, isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["/api/users"],
    enabled: isAdmin,
  });

  const deleteEventMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/events/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      toast({ title: "Event deleted!" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to delete event", description: error.message, variant: "destructive" });
    },
  });

  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container py-8">
          <Skeleton className="h-8 w-48 mb-6" />
          <Skeleton className="h-64 w-full" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-4">You need admin privileges to access this page.</p>
          <Button onClick={() => navigate("/")} data-testid="button-home">
            Go Home
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  const pendingRentals = rentals?.filter(r => r.status === "pending") || [];
  const activeRentals = rentals?.filter(r => r.status === "active" || r.status === "approved") || [];
  const returnRequests = rentals?.filter(r => r.status === "return_requested") || [];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-gradient-warm">
        <div className="container py-8">
          <h1 className="font-display text-3xl font-bold mb-6">Admin Dashboard</h1>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="games" data-testid="tab-games">Games</TabsTrigger>
              <TabsTrigger value="rentals" data-testid="tab-rentals">Rentals</TabsTrigger>
              <TabsTrigger value="events" data-testid="tab-events">Events</TabsTrigger>
              <TabsTrigger value="users" data-testid="tab-users">Users</TabsTrigger>
            </TabsList>

            <TabsContent value="games">
              <GamesTab games={games || []} isLoading={gamesLoading} />
            </TabsContent>

            <TabsContent value="rentals">
              <RentalsTab
                pendingRentals={pendingRentals}
                activeRentals={activeRentals}
                returnRequests={returnRequests}
                isLoading={rentalsLoading}
              />
            </TabsContent>

            <TabsContent value="events">
              <EventsTab 
                events={events || []} 
                registrations={registrations || []}
                isLoading={eventsLoading || regsLoading} 
              />
            </TabsContent>

            <TabsContent value="users">
              <UsersTab users={users || []} isLoading={usersLoading} />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function GamesTab({ games, isLoading }: { games: Game[]; isLoading: boolean }) {
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    minPlayers: 2,
    maxPlayers: 4,
    duration: "",
    complexity: "",
    imageUrl: "",
    rulesUrl: "",
    videoRulesUrl: "",
    whatsInTheBox: "",
  });

  const addMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await apiRequest("POST", "/api/games", {
        ...data,
        minPlayers: parseInt(String(data.minPlayers)),
        maxPlayers: parseInt(String(data.maxPlayers)),
        whatsInTheBox: data.whatsInTheBox.split("\n").filter(Boolean),
        available: true,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/games"] });
      toast({ title: "Game added!" });
      setIsAddDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({ title: "Failed to add game", description: error.message, variant: "destructive" });
    },
  });

  const editMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: typeof formData }) => {
      const res = await apiRequest("PATCH", `/api/games/${id}`, {
        ...data,
        minPlayers: parseInt(String(data.minPlayers)),
        maxPlayers: parseInt(String(data.maxPlayers)),
        whatsInTheBox: data.whatsInTheBox.split("\n").filter(Boolean),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/games"] });
      toast({ title: "Game updated!" });
      setIsEditDialogOpen(false);
      setEditingGame(null);
      resetForm();
    },
    onError: (error: any) => {
      toast({ title: "Failed to update game", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/games/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/games"] });
      toast({ title: "Game deleted!" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to delete game", description: error.message, variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      category: "",
      minPlayers: 2,
      maxPlayers: 4,
      duration: "",
      complexity: "",
      imageUrl: "",
      rulesUrl: "",
      videoRulesUrl: "",
      whatsInTheBox: "",
    });
  };

  const openEditDialog = (game: Game) => {
    setEditingGame(game);
    setFormData({
      name: game.name,
      description: game.description,
      category: game.category,
      minPlayers: game.minPlayers,
      maxPlayers: game.maxPlayers,
      duration: game.duration,
      complexity: game.complexity,
      imageUrl: game.imageUrl || "",
      rulesUrl: game.rulesUrl || "",
      videoRulesUrl: game.videoRulesUrl || "",
      whatsInTheBox: (game.whatsInTheBox || []).join("\n"),
    });
    setIsEditDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingGame) {
      editMutation.mutate({ id: editingGame.id, data: formData });
    } else {
      addMutation.mutate(formData);
    }
  };

  if (isLoading) {
    return <Skeleton className="h-64 w-full" />;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Games ({games.length})</CardTitle>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" data-testid="button-add-game">
              <Plus className="h-4 w-4" /> Add Game
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Game</DialogTitle>
            </DialogHeader>
            <GameForm
              formData={formData}
              setFormData={setFormData}
              onSubmit={handleSubmit}
              isLoading={addMutation.isPending}
              submitLabel="Add Game"
            />
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Players</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {games.map((game) => (
              <TableRow key={game.id} data-testid={`game-row-${game.id}`}>
                <TableCell className="font-medium">{game.name}</TableCell>
                <TableCell>{game.category}</TableCell>
                <TableCell>{game.minPlayers}-{game.maxPlayers}</TableCell>
                <TableCell>
                  <Badge className={game.available ? "bg-green-500" : "bg-red-500"}>
                    {game.available ? "Available" : "Unavailable"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => openEditDialog(game)}
                      data-testid={`button-edit-game-${game.id}`}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => deleteMutation.mutate(game.id)}
                      data-testid={`button-delete-game-${game.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Game</DialogTitle>
            </DialogHeader>
            <GameForm
              formData={formData}
              setFormData={setFormData}
              onSubmit={handleSubmit}
              isLoading={editMutation.isPending}
              submitLabel="Update Game"
            />
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}

function GameForm({
  formData,
  setFormData,
  onSubmit,
  isLoading,
  submitLabel,
}: {
  formData: any;
  setFormData: (data: any) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  submitLabel: string;
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          data-testid="input-game-name"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          required
          data-testid="input-game-description"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Input
            id="category"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            required
            data-testid="input-game-category"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="complexity">Complexity</Label>
          <Input
            id="complexity"
            value={formData.complexity}
            onChange={(e) => setFormData({ ...formData, complexity: e.target.value })}
            required
            placeholder="Easy, Medium, Hard"
            data-testid="input-game-complexity"
          />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="minPlayers">Min Players</Label>
          <Input
            id="minPlayers"
            type="number"
            value={formData.minPlayers}
            onChange={(e) => setFormData({ ...formData, minPlayers: e.target.value })}
            required
            data-testid="input-game-min-players"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="maxPlayers">Max Players</Label>
          <Input
            id="maxPlayers"
            type="number"
            value={formData.maxPlayers}
            onChange={(e) => setFormData({ ...formData, maxPlayers: e.target.value })}
            required
            data-testid="input-game-max-players"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="duration">Duration</Label>
          <Input
            id="duration"
            value={formData.duration}
            onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
            required
            placeholder="30-60 min"
            data-testid="input-game-duration"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="imageUrl">Image URL</Label>
        <Input
          id="imageUrl"
          value={formData.imageUrl}
          onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
          data-testid="input-game-image"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="rulesUrl">Rules URL</Label>
        <Input
          id="rulesUrl"
          value={formData.rulesUrl}
          onChange={(e) => setFormData({ ...formData, rulesUrl: e.target.value })}
          placeholder="Link to game rules PDF"
          data-testid="input-game-rules"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="videoRulesUrl">Video Rules URL (YouTube/Vimeo)</Label>
        <Input
          id="videoRulesUrl"
          value={formData.videoRulesUrl}
          onChange={(e) => setFormData({ ...formData, videoRulesUrl: e.target.value })}
          placeholder="Link to video explanation"
          data-testid="input-game-video-rules"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="whatsInTheBox">What's in the Box (one item per line)</Label>
        <Textarea
          id="whatsInTheBox"
          value={formData.whatsInTheBox}
          onChange={(e) => setFormData({ ...formData, whatsInTheBox: e.target.value })}
          placeholder="1 Game Board&#10;50 Cards&#10;20 Tokens"
          rows={5}
          data-testid="input-game-box-contents"
        />
      </div>
      <Button type="submit" className="w-full" disabled={isLoading} data-testid="button-submit-game">
        {isLoading ? "Saving..." : submitLabel}
      </Button>
    </form>
  );
}

function RentalsTab({
  pendingRentals,
  activeRentals,
  returnRequests,
  isLoading,
}: {
  pendingRentals: RentalWithDetails[];
  activeRentals: RentalWithDetails[];
  returnRequests: RentalWithDetails[];
  isLoading: boolean;
}) {
  const { toast } = useToast();

  const updateMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await apiRequest("PATCH", `/api/rentals/${id}`, { status });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/rentals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/games"] });
      toast({ title: "Rental updated!" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to update rental", description: error.message, variant: "destructive" });
    },
  });

  if (isLoading) {
    return <Skeleton className="h-64 w-full" />;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Pending Approvals ({pendingRentals.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {pendingRentals.length === 0 ? (
            <p className="text-muted-foreground">No pending approvals</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Game</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead>Payment Info</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingRentals.map((rental) => (
                  <TableRow key={rental.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{rental.user?.name}</p>
                        <p className="text-sm text-muted-foreground">{rental.user?.phone}</p>
                        <p className="text-sm text-muted-foreground">Room: {rental.user?.roomNo}</p>
                      </div>
                    </TableCell>
                    <TableCell>{rental.game?.name}</TableCell>
                    <TableCell>
                      {format(new Date(rental.startDate), "MMM d")} - {format(new Date(rental.endDate), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm">From: {rental.paymentPhone}</p>
                        {rental.paymentTime && (
                          <p className="text-sm text-muted-foreground">
                            At: {format(new Date(rental.paymentTime), "MMM d, h:mm a")}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => updateMutation.mutate({ id: rental.id, status: "active" })}
                          data-testid={`button-approve-rental-${rental.id}`}
                        >
                          <Check className="h-4 w-4 mr-1" /> Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => updateMutation.mutate({ id: rental.id, status: "cancelled" })}
                          data-testid={`button-reject-rental-${rental.id}`}
                        >
                          <X className="h-4 w-4 mr-1" /> Reject
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Active Rentals ({activeRentals.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {activeRentals.length === 0 ? (
            <p className="text-muted-foreground">No active rentals</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Game</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeRentals.map((rental) => (
                  <TableRow key={rental.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{rental.user?.name}</p>
                        <p className="text-sm text-muted-foreground">{rental.user?.phone}</p>
                      </div>
                    </TableCell>
                    <TableCell>{rental.game?.name}</TableCell>
                    <TableCell>
                      {format(new Date(rental.startDate), "MMM d")} - {format(new Date(rental.endDate), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-green-500">{rental.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Return Requests ({returnRequests.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {returnRequests.length === 0 ? (
            <p className="text-muted-foreground">No return requests</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Game</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {returnRequests.map((rental) => (
                  <TableRow key={rental.id}>
                    <TableCell>{rental.user?.name}</TableCell>
                    <TableCell>{rental.game?.name}</TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        onClick={() => updateMutation.mutate({ id: rental.id, status: "completed" })}
                        data-testid={`button-complete-rental-${rental.id}`}
                      >
                        <Check className="h-4 w-4 mr-1" /> Mark Returned
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function EventsTab({ 
  events, 
  registrations,
  isLoading 
}: { 
  events: Event[]; 
  registrations: RegistrationWithDetails[];
  isLoading: boolean 
}) {
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isManageDialogOpen, setIsManageDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    date: "",
    time: "",
    location: "",
    capacity: 20,
    price: 50,
    imageUrl: "",
  });

  const eventRegistrations = registrations.filter(r => r.eventId === selectedEvent?.id);

  const deleteEventMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/events/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      toast({ title: "Event deleted!" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to delete event", description: error.message, variant: "destructive" });
    },
  });

  const updateRegistrationMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await apiRequest("PATCH", `/api/registrations/${id}`, { status });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/registrations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      toast({ title: "Registration updated!" });
    },
    onError: (error: any) => {
      toast({ title: "Failed to update registration", description: error.message, variant: "destructive" });
    },
  });

  const addMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await apiRequest("POST", "/api/events", {
        ...data,
        capacity: parseInt(String(data.capacity)),
        price: parseInt(String(data.price)),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      toast({ title: "Event created!" });
      setIsAddDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({ title: "Failed to create event", description: error.message, variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      date: "",
      time: "",
      location: "",
      capacity: 20,
      price: 50,
      imageUrl: "",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addMutation.mutate(formData);
  };

  if (isLoading) {
    return <Skeleton className="h-64 w-full" />;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Events ({events.length})</CardTitle>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" data-testid="button-create-event">
              <Plus className="h-4 w-4" /> Create Event
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create New Event</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Event Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  data-testid="input-event-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  data-testid="input-event-description"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                    data-testid="input-event-date"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">Time</Label>
                  <Input
                    id="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    required
                    placeholder="7:00 PM - 11:00 PM"
                    data-testid="input-event-time"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  required
                  data-testid="input-event-location"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="capacity">Capacity</Label>
                  <Input
                    id="capacity"
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                    required
                    data-testid="input-event-capacity"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Price (Rs.)</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) })}
                    required
                    data-testid="input-event-price"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="imageUrl">Image URL</Label>
                <Input
                  id="imageUrl"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  data-testid="input-event-image"
                />
              </div>
              <Button type="submit" className="w-full" disabled={addMutation.isPending} data-testid="button-submit-event">
                {addMutation.isPending ? "Creating..." : "Create Event"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Capacity</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {events.map((event) => {
              const eventRegsCount = registrations.filter(r => r.eventId === event.id && r.status === "confirmed").length;
              return (
                <TableRow key={event.id} data-testid={`event-row-${event.id}`}>
                  <TableCell className="font-medium">{event.name}</TableCell>
                  <TableCell>{format(new Date(event.date), "MMM d, yyyy")}</TableCell>
                  <TableCell>{event.location}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {eventRegsCount} / {event.capacity}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedEvent(event);
                          setIsManageDialogOpen(true);
                        }}
                        data-testid={`button-manage-event-${event.id}`}
                      >
                        <Eye className="h-4 w-4 mr-1" /> Manage
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => {
                          if (confirm("Are you sure you want to delete this event? This will also delete all registrations.")) {
                            deleteEventMutation.mutate(event.id);
                          }
                        }}
                        data-testid={`button-delete-event-${event.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        <Dialog open={isManageDialogOpen} onOpenChange={setIsManageDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Manage: {selectedEvent?.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <h4 className="font-medium">Registrations ({eventRegistrations?.length || 0})</h4>
              {!eventRegistrations || eventRegistrations.length === 0 ? (
                <p className="text-muted-foreground">No registrations yet</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Payment Info</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {eventRegistrations.map((reg) => (
                      <TableRow key={reg.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{reg.user?.name}</p>
                            <p className="text-sm text-muted-foreground">{reg.user?.email}</p>
                            <p className="text-sm text-muted-foreground">{reg.user?.phone}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {reg.paymentPhone ? (
                            <div>
                              <p className="text-sm">From: {reg.paymentPhone}</p>
                              {reg.paymentTime && (
                                <p className="text-sm text-muted-foreground">
                                  At: {format(new Date(reg.paymentTime), "MMM d, h:mm a")}
                                </p>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">No payment info</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge className={reg.status === "confirmed" ? "bg-green-500" : "bg-yellow-500"}>
                            {reg.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {reg.status === "pending" && (
                            <Button
                              size="sm"
                              onClick={() => updateRegistrationMutation.mutate({ id: reg.id, status: "confirmed" })}
                              data-testid={`button-confirm-registration-${reg.id}`}
                            >
                              <Check className="h-4 w-4 mr-1" /> Confirm
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}

function UsersTab({ users, isLoading }: { users: User[]; isLoading: boolean }) {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  const { data: userDetails, isLoading: detailsLoading } = useQuery<User & { rentals: RentalWithDetails[]; registrations: RegistrationWithDetails[] }>({
    queryKey: ["/api/users", selectedUser?.id],
    enabled: !!selectedUser,
  });

  if (isLoading) {
    return <Skeleton className="h-64 w-full" />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Users ({users.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Room</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id} data-testid={`user-row-${user.id}`}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.phone}</TableCell>
                <TableCell>{user.roomNo}</TableCell>
                <TableCell>
                  <Badge className={user.role === "admin" ? "bg-purple-500" : "bg-blue-500"}>
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedUser(user);
                      setIsViewDialogOpen(true);
                    }}
                    data-testid={`button-view-user-${user.id}`}
                  >
                    <Eye className="h-4 w-4 mr-1" /> View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Dialog open={isViewDialogOpen} onOpenChange={(open) => {
          setIsViewDialogOpen(open);
          if (!open) setSelectedUser(null);
        }}>
          <DialogContent className="max-w-md p-0 overflow-hidden border-none shadow-2xl rounded-3xl">
            <div className="p-6 bg-white">
              <DialogHeader className="mb-6">
                <div className="flex justify-between items-start">
                  <div>
                    <DialogTitle className="text-2xl font-black text-[#1e293b]">User Details</DialogTitle>
                    <p className="text-sm text-muted-foreground mt-1 font-medium">View user information and rental history</p>
                  </div>
                </div>
              </DialogHeader>

              {detailsLoading ? (
                <div className="space-y-4 py-4">
                  <Skeleton className="h-20 w-full rounded-2xl" />
                  <Skeleton className="h-40 w-full rounded-2xl" />
                </div>
              ) : userDetails ? (
                <div className="space-y-8">
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      <div className="w-20 h-20 rounded-full bg-[#bbf7d0] flex items-center justify-center border-4 border-white shadow-sm overflow-hidden">
                        <img 
                          src={`https://api.dicebear.com/7.x/funmoji/svg?seed=${userDetails.email}&backgroundColor=b6e3f4,c0aede,d1d4f9`} 
                          alt={userDetails.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-2xl font-black text-[#1e293b] leading-tight">{userDetails.name}</h3>
                      <p className="text-[#64748b] font-bold text-lg">Room {userDetails.roomNo}</p>
                      <Badge className="bg-[#dcfce7] text-[#166534] hover:bg-[#dcfce7] border-none shadow-none font-bold py-1 px-3 rounded-full flex items-center gap-1 w-fit">
                        <Check className="w-3 h-3" /> Verified
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-[80px_1fr] gap-y-4 text-lg">
                    <span className="text-[#94a3b8] font-bold">Email:</span>
                    <span className="text-[#334155] font-bold truncate">{userDetails.email}</span>
                    <span className="text-[#94a3b8] font-bold">Phone:</span>
                    <span className="text-[#334155] font-bold">{userDetails.phone}</span>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-xl font-black text-[#1e293b]">Rental History ({userDetails.rentals?.length || 0})</h4>
                    <div className="max-h-[320px] overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                      {userDetails.rentals?.map((rental: any) => (
                        <div key={rental.id} className="flex items-center gap-4 p-4 bg-[#f8fafc] rounded-2xl group transition-all hover:bg-[#f1f5f9]">
                          <div className="w-14 h-14 rounded-xl bg-white border-2 border-[#e2e8f0] flex items-center justify-center overflow-hidden shrink-0">
                            {rental.game?.imageUrl ? (
                              <img src={rental.game.imageUrl} className="w-full h-full object-cover" />
                            ) : (
                              <Package className="w-6 h-6 text-[#94a3b8]" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5 className="font-black text-[#1e293b] truncate text-lg leading-tight">{rental.game?.name}</h5>
                            <p className="text-sm font-bold text-[#64748b]">
                              {format(new Date(rental.startDate), "MMM d")} - {format(new Date(rental.endDate), "MMM d, yyyy")}
                            </p>
                          </div>
                          <Badge className={`rounded-full px-4 py-1.5 font-bold border-none shadow-none text-sm
                            ${rental.status === "pending" ? "bg-[#fef3c7] text-[#92400e]" : 
                              rental.status === "active" ? "bg-[#f3e8ff] text-[#6b21a8]" : 
                              "bg-[#f1f5f9] text-[#475569]"}`}>
                            {rental.status === "pending" ? "pending payment" : rental.status}
                          </Badge>
                        </div>
                      ))}
                      {(!userDetails.rentals || userDetails.rentals.length === 0) && (
                        <p className="text-center py-8 text-[#94a3b8] font-bold">No rental history</p>
                      )}
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button 
                      onClick={() => {
                        setIsViewDialogOpen(false);
                        setSelectedUser(null);
                      }}
                      className="w-full h-14 rounded-2xl bg-[#f1f5f9] hover:bg-[#e2e8f0] text-[#475569] font-black text-lg border-none"
                    >
                      Close
                    </Button>
                  </div>
                </div>
              ) : null}
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
