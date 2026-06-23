import { Link } from "react-router";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Network, Zap, Target, Github, Linkedin, Mail } from "lucide-react";
import { useAuth } from "@/app/contexts/auth-context";

export default function LandingPage() {
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: <Network className="w-8 h-8 text-accent" />,
      title: "Real-world Topology",
      description: "Practice with industry-standard network configurations and enterprise scenarios"
    },
    {
      icon: <Zap className="w-8 h-8 text-accent" />,
      title: "Automated Evaluation Engine",
      description: "Get instant feedback powered by intelligent validation algorithms"
    },
    {
      icon: <Target className="w-8 h-8 text-accent" />,
      title: "Instant Feedback",
      description: "Real-time scoring and detailed explanations for every configuration"
    }
  ];

  const steps = [
    { number: "01", title: "Launch Lab", description: "Select from our curated collection of networking scenarios" },
    { number: "02", title: "Configure via CLI", description: "Use authentic Cisco-style commands in the web terminal" },
    { number: "03", title: "Get Scored", description: "Receive instant evaluation with detailed performance metrics" }
  ];

  const team = [
    { name: "Ahmed Hassan", role: "DevOps Engineer", avatar: "AH" },
    { name: "Sara Mohamed", role: "Full-Stack Developer", avatar: "SM" },
    { name: "Omar Khaled", role: "Network Specialist", avatar: "OK" },
    { name: "Nour Ali", role: "Security Expert", avatar: "NA" },
    { name: "Youssef Ibrahim", role: "UI/UX Designer", avatar: "YI" },
    { name: "Fatma Ahmed", role: "Backend Developer", avatar: "FA" },
    { name: "Karim Samir", role: "DevOps Engineer", avatar: "KS" },
  ];

  const supervisor = { name: "Dr. Mohamed Ashraf", role: "Project Supervisor", avatar: "MA" };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Network className="w-6 h-6 text-accent" />
            <span className="font-mono text-xl tracking-tight">Smart IT Lab</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-sm text-muted-foreground hover:text-accent transition-colors">Home</Link>
            <Link to="/pricing" className="text-sm text-muted-foreground hover:text-accent transition-colors">Pricing</Link>
            {isAuthenticated ? (
              <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-accent transition-colors">Dashboard</Link>
            ) : (
              <Link to="/auth" className="text-sm text-muted-foreground hover:text-accent transition-colors">Sign In</Link>
            )}
          </nav>
          <Link to={isAuthenticated ? "/dashboard" : "/auth"}>
            <Button className="bg-[#3B82F6] hover:bg-[#2563EB] text-white">
              {isAuthenticated ? "Go to Dashboard" : "Start Free Trial"}
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <Badge className="bg-card text-accent border-border font-mono">
            v1.0.0 - Now in Beta
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Master Enterprise Networking <br />
            <span className="text-accent">in a Virtual Lab</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Hands-on simulation, automated grading, zero hardware required. 
            Perfect for CCNA, CompTIA, and networking students.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth">
              <Button size="lg" className="bg-[#00FF41] hover:bg-[#00DD35] text-[#0F172A] font-semibold">
                Start Free Trial
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="border-border hover:bg-card">
              View Documentation
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <Card key={i} className="bg-card border-border hover:border-primary transition-colors">
              <CardHeader>
                <div className="mb-4">{feature.icon}</div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-muted-foreground">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* How it Works */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">How it Works</h2>
          <p className="text-muted-foreground text-lg">Get started in three simple steps</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {steps.map((step, i) => (
            <div key={i} className="relative">
              <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-card border-2 border-primary">
                  <span className="text-2xl font-mono text-primary">{step.number}</span>
                </div>
                <h3 className="text-xl font-semibold">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-8 left-[calc(50%+2rem)] w-[calc(100%-4rem)] h-0.5 bg-secondary" />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Team Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Our Team</h2>
          <p className="text-muted-foreground text-lg">Meet the engineers behind Smart IT Lab</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto mb-8">
          {team.map((member, i) => (
            <Card key={i} className="bg-card border-border hover:border-primary transition-colors">
              <CardContent className="pt-6 text-center">
                <div className="w-16 h-16 rounded-full bg-[#3B82F6] flex items-center justify-center text-white font-bold text-lg mx-auto mb-3">
                  {member.avatar}
                </div>
                <h4 className="font-semibold">{member.name}</h4>
                <p className="text-sm text-muted-foreground font-mono">{member.role}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="bg-card border-[#00FF41] max-w-md mx-auto">
          <CardContent className="pt-6 text-center">
            <div className="w-20 h-20 rounded-full bg-[#00FF41] flex items-center justify-center text-[#0F172A] font-bold text-xl mx-auto mb-3">
              {supervisor.avatar}
            </div>
            <h4 className="font-semibold text-lg">{supervisor.name}</h4>
            <p className="text-sm text-accent font-mono">{supervisor.role}</p>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-background mt-16">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Network className="w-5 h-5 text-accent" />
                <span className="font-mono font-semibold">Smart IT Lab</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Enterprise networking education platform for the next generation.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/pricing" className="hover:text-accent transition-colors">Pricing</Link></li>
                <li><Link to="/dashboard" className="hover:text-accent transition-colors">Dashboard</Link></li>
                <li><a href="#" className="hover:text-accent transition-colors">Labs</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-accent transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-accent transition-colors">API Reference</a></li>
                <li><a href="#" className="hover:text-accent transition-colors">Tutorials</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-accent transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-accent transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground">© 2026 Smart IT Lab. All rights reserved.</p>
            <div className="flex gap-4 mt-4 md:mt-0">
              <a href="#" className="text-muted-foreground hover:text-accent transition-colors">
                <Github className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-accent transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-accent transition-colors">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}