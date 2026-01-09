import { db } from "./db";
import { users, games, events } from "@shared/schema";
import bcrypt from "bcryptjs";

async function seed() {
  console.log("Seeding database...");

  const existingUsers = await db.select().from(users);
  if (existingUsers.length > 0) {
    console.log("Database already seeded, skipping...");
    return;
  }

  const hashedPassword = await bcrypt.hash("password123", 10);

  await db.insert(users).values([
    { name: "Admin User", email: "admin@boardy.com", phone: "9876543210", roomNo: "A101", password: hashedPassword, role: "admin" },
    { name: "John Doe", email: "john@example.com", phone: "9876543211", roomNo: "B202", password: hashedPassword, role: "user" },
    { name: "Jane Smith", email: "jane@example.com", phone: "9876543212", roomNo: "C303", password: hashedPassword, role: "user" },
    { name: "Mike Johnson", email: "mike@example.com", phone: "9876543213", roomNo: "D404", password: hashedPassword, role: "user" },
  ]);

  await db.insert(games).values([
    {
      name: "Catan",
      description: "Build settlements, trade resources, and become the dominant force on the island of Catan.",
      category: "Strategy",
      minPlayers: 3,
      maxPlayers: 4,
      duration: "60-120 min",
      complexity: "Medium",
      imageUrl: "https://images.unsplash.com/photo-1632501641765-e568d28b0015?w=400",
      rulesUrl: "https://www.catan.com/sites/prod/files/2021-06/catan_base_rules_2020_200707.pdf",
      whatsInTheBox: ["1 Game Board", "19 Terrain Hexes", "6 Sea Frame Pieces", "9 Harbor Pieces", "18 Circular Number Tokens", "95 Resource Cards", "25 Development Cards", "4 Building Cost Cards", "2 Special Cards", "16 Cities", "20 Settlements", "60 Roads", "2 Dice", "1 Robber"],
      available: true,
    },
    {
      name: "Ticket to Ride",
      description: "Cross-country train adventure where players collect cards to claim railway routes.",
      category: "Family",
      minPlayers: 2,
      maxPlayers: 5,
      duration: "30-60 min",
      complexity: "Easy",
      imageUrl: "https://images.unsplash.com/photo-1611371805429-8b5c1b2c34ba?w=400",
      rulesUrl: "https://cdn.1702studios.com/ticket-to-ride/Ticket-to-Ride-Rules.pdf",
      whatsInTheBox: ["1 Board Map", "240 Colored Train Cars", "110 Train Car Cards", "30 Destination Ticket Cards", "1 Summary Card", "5 Wooden Scoring Markers", "1 Rules Booklet"],
      available: true,
    },
    {
      name: "Codenames",
      description: "Two rival spymasters give one-word clues to help their teammates identify secret agents.",
      category: "Party",
      minPlayers: 2,
      maxPlayers: 8,
      duration: "15-30 min",
      complexity: "Easy",
      imageUrl: "https://images.unsplash.com/photo-1606503153255-59d7a2b1c1e9?w=400",
      rulesUrl: "https://czechgames.com/files/rules/codenames-rules-en.pdf",
      whatsInTheBox: ["200 Double-sided Codename Cards", "40 Key Cards", "1 Card Stand", "1 Timer", "1 Rulebook", "8 Agent Cards", "1 Double Agent Card", "7 Innocent Bystander Cards", "1 Assassin Card"],
      available: true,
    },
    {
      name: "Pandemic",
      description: "Work together as a team of disease-fighting specialists to cure diseases around the world.",
      category: "Cooperative",
      minPlayers: 2,
      maxPlayers: 4,
      duration: "45-60 min",
      complexity: "Medium",
      imageUrl: "https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=400",
      rulesUrl: "https://images.zmangames.com/filer_public/25/12/251252ca-1b48-41c0-8f2b-c7dd1826727d/pandemic_rules.pdf",
      whatsInTheBox: ["1 Board", "7 Role Cards", "7 Pawns", "59 Player Cards", "4 Reference Cards", "48 Infection Cards", "96 Disease Cubes", "4 Cure Markers", "1 Infection Rate Marker", "1 Outbreaks Marker", "6 Research Stations"],
      available: true,
    },
    {
      name: "Azul",
      description: "Artfully embellish the walls of your palace by drafting the most beautiful tiles.",
      category: "Abstract",
      minPlayers: 2,
      maxPlayers: 4,
      duration: "30-45 min",
      complexity: "Easy",
      imageUrl: "https://images.unsplash.com/photo-1611371805429-8b5c1b2c34ba?w=400",
      rulesUrl: "https://www.nextmovegames.com/rules/Azul_rules.pdf",
      whatsInTheBox: ["4 Player Boards", "9 Factory Displays", "4 Scoring Markers", "1 Starting Player Marker", "100 Tiles", "1 Linen Bag", "1 Rulebook"],
      available: true,
    },
    {
      name: "Wingspan",
      description: "Attract the best birds to your wildlife preserves in this engine-building game.",
      category: "Strategy",
      minPlayers: 1,
      maxPlayers: 5,
      duration: "40-70 min",
      complexity: "Medium",
      imageUrl: "https://images.unsplash.com/photo-1596451190630-186aff535bf2?w=400",
      rulesUrl: "https://stonemaiergames.com/games/wingspan/rules/",
      whatsInTheBox: ["170 Bird Cards", "26 Bonus Cards", "16 Automa Cards", "103 Food Tokens", "75 Egg Miniatures", "5 Player Mats", "1 Birdfeeder Dice Tower", "8 Goal Tiles", "1 First Player Token", "40 Action Cubes", "1 Scorepad", "5 Custom Dice"],
      available: true,
    },
  ]);

  const nextSaturday = new Date();
  nextSaturday.setDate(nextSaturday.getDate() + (6 - nextSaturday.getDay() + 7) % 7 + 1);
  const followingSaturday = new Date(nextSaturday);
  followingSaturday.setDate(followingSaturday.getDate() + 7);

  await db.insert(events).values([
    {
      name: "Saturday Night Gaming: Strategy Showdown",
      description: "Join us for an epic evening of strategy games! We'll have Catan, Wingspan, and more available. Perfect for both beginners and experienced gamers.",
      date: nextSaturday,
      time: "7:00 PM - 11:00 PM",
      location: "Community Hall, Building A",
      capacity: 20,
      price: 50,
      imageUrl: "https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?w=400",
    },
    {
      name: "Saturday Night Gaming: Party Games Bonanza",
      description: "Get ready for laughs and fun with party games like Codenames, Wavelength, and more! Great for groups and making new friends.",
      date: followingSaturday,
      time: "7:00 PM - 11:00 PM",
      location: "Recreation Room, Building B",
      capacity: 30,
      price: 50,
      imageUrl: "https://images.unsplash.com/photo-1543269664-56d93c1b41a6?w=400",
    },
  ]);

  console.log("Database seeded successfully!");
}

seed().catch(console.error).finally(() => process.exit(0));
