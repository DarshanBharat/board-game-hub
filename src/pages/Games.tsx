import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Grid3X3, List } from "lucide-react";
import type { Game } from "@shared/schema";

const categoryColors: Record<string, string> = {
  Strategy: "bg-primary/20 text-primary border-primary/30",
  Family: "bg-blue-500/20 text-blue-600 border-blue-500/30",
  Party: "bg-pink-500/20 text-pink-600 border-pink-500/30",
  Cooperative: "bg-green-500/20 text-green-600 border-green-500/30",
  Abstract: "bg-purple-500/20 text-purple-600 border-purple-500/30",
};

const Games = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const { data: games, isLoading } = useQuery<Game[]>({
    queryKey: ["/api/games"],
  });

  const categories = ["all", ...new Set(games?.map(g => g.category) || [])];

  const filteredGames = games?.filter((game) => {
    const matchesSearch = game.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || game.category === selectedCategory;
    return matchesSearch && matchesCategory;
  }) || [];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-gradient-warm">
        <div className="bg-card border-b-2 border-dashed border-primary/20">
          <div className="container py-10">
            <div className="flex items-center gap-4 mb-2">
              <h1 className="font-display text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-pink-500 to-warning bg-clip-text text-transparent">
                Game Library
              </h1>
            </div>
            <p className="text-muted-foreground text-xl">
              {games?.length || 0} awesome games waiting for you!
            </p>
          </div>
        </div>

        <div className="container py-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search games..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 rounded-2xl border-2 text-lg"
                data-testid="input-search-games"
              />
            </div>

            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 flex-1 md:flex-initial">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                    className="whitespace-nowrap rounded-xl capitalize"
                    data-testid={`filter-category-${category}`}
                  >
                    {category === "all" ? "All Games" : category}
                  </Button>
                ))}
              </div>

              <div className="hidden md:flex items-center gap-1 border-2 rounded-xl p-1">
                <Button
                  variant={viewMode === "grid" ? "secondary" : "ghost"}
                  size="icon"
                  className="h-9 w-9 rounded-lg"
                  onClick={() => setViewMode("grid")}
                  data-testid="button-view-grid"
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "secondary" : "ghost"}
                  size="icon"
                  className="h-9 w-9 rounded-lg"
                  onClick={() => setViewMode("list")}
                  data-testid="button-view-list"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="container pb-12">
          {isLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-80 rounded-3xl" />
              ))}
            </div>
          ) : filteredGames.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-xl">No games found. Try a different search!</p>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredGames.map((game, index) => (
                <Link
                  key={game.id}
                  to={`/games/${game.id}`}
                  className="group animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                  data-testid={`game-card-${game.id}`}
                >
                  <div className="bg-card rounded-3xl border-2 border-border overflow-hidden shadow-soft hover:shadow-elevated transition-all duration-300 hover:-translate-y-2">
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <img
                        src={game.imageUrl || "https://images.unsplash.com/photo-1632501641765-e568d28b0015?w=400"}
                        alt={game.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute top-3 right-3">
                        <Badge className={game.available ? "bg-green-500" : "bg-red-500"}>
                          {game.available ? "Available" : "Unavailable"}
                        </Badge>
                      </div>
                    </div>

                    <div className="p-5">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-display font-bold text-xl group-hover:text-primary transition-colors">
                          {game.name}
                        </h3>
                      </div>
                      <Badge variant="outline" className={`${categoryColors[game.category] || "bg-gray-500/20"} border-2 font-bold mb-3`}>
                        {game.category}
                      </Badge>
                      <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                        {game.description}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground font-medium">
                        <span>{game.minPlayers}-{game.maxPlayers} players</span>
                        <span>{game.duration}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredGames.map((game, index) => (
                <Link
                  key={game.id}
                  to={`/games/${game.id}`}
                  className="group block animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                  data-testid={`game-list-${game.id}`}
                >
                  <div className="bg-card rounded-2xl border-2 border-border p-4 shadow-soft hover:shadow-elevated transition-all duration-300 flex gap-4 hover:-translate-x-1">
                    <div className="relative">
                      <img
                        src={game.imageUrl || "https://images.unsplash.com/photo-1632501641765-e568d28b0015?w=400"}
                        alt={game.name}
                        className="w-28 h-28 rounded-xl object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-display font-bold text-xl group-hover:text-primary transition-colors">
                            {game.name}
                          </h3>
                          <p className="text-muted-foreground text-sm line-clamp-1">
                            {game.description}
                          </p>
                        </div>
                        <Badge className={game.available ? "bg-green-500" : "bg-red-500"}>
                          {game.available ? "Available" : "Unavailable"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground font-medium flex-wrap">
                        <Badge variant="outline" className={`${categoryColors[game.category] || "bg-gray-500/20"} border-2`}>
                          {game.category}
                        </Badge>
                        <span>{game.minPlayers}-{game.maxPlayers} players</span>
                        <span>{game.duration}</span>
                        <span>{game.complexity}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Games;
