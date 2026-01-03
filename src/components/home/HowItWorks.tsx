import { Search, CreditCard, Package, PartyPopper } from "lucide-react";

const steps = [
  {
    icon: Search,
    title: "Browse & Pick",
    description: "Explore our collection of 25+ board games. Filter by player count, complexity, or category.",
    color: "bg-info/10 text-info",
  },
  {
    icon: CreditCard,
    title: "Book & Pay",
    description: "Reserve your game for specific dates. Pay via UPI and upload your payment screenshot.",
    color: "bg-accent/10 text-accent",
  },
  {
    icon: Package,
    title: "Pick Up & Play",
    description: "Once admin approves, collect your game. Return on time to avoid late fees!",
    color: "bg-success/10 text-success",
  },
  {
    icon: PartyPopper,
    title: "Join Events",
    description: "Sign up for Saturday Night sessions. Meet new people and discover new games together.",
    color: "bg-primary/10 text-primary",
  },
];

export function HowItWorks() {
  return (
    <section className="py-20 bg-secondary/30">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            How It Works
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            From browsing to playing in four simple steps
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={step.title}
                className="relative group"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-10 left-[60%] w-[80%] h-0.5 bg-border" />
                )}
                
                <div className="bg-card rounded-2xl p-6 border border-border shadow-soft hover:shadow-elevated transition-all duration-300 hover:-translate-y-1">
                  {/* Step Number */}
                  <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-display font-bold text-sm shadow-soft">
                    {index + 1}
                  </div>
                  
                  {/* Icon */}
                  <div className={`w-14 h-14 rounded-xl ${step.color} flex items-center justify-center mb-4`}>
                    <Icon className="h-7 w-7" />
                  </div>
                  
                  {/* Content */}
                  <h3 className="font-display text-lg font-semibold mb-2">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
