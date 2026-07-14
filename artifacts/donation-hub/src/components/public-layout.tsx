import { Link, useLocation } from 'wouter';
import { ReactNode } from 'react';
import { Target, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

interface PublicLayoutProps {
  children: ReactNode;
}

export default function PublicLayout({ children }: PublicLayoutProps) {
  const [location] = useLocation();

  const navLinks = [
    { title: "Home", url: "/" },
    { title: "Donate", url: "/donate" },
    { title: "About", url: "/about" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground relative overflow-hidden selection:bg-primary/30">
      {/* Abstract Background Elements */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-secondary/10 blur-[100px] rounded-full"></div>
        <div className="absolute top-[40%] right-[10%] w-[20%] h-[20%] bg-accent/5 blur-[80px] rounded-full"></div>
      </div>

      <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-background/60 backdrop-blur-xl">
        <div className="container mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded bg-primary/20 flex items-center justify-center border border-primary/30 group-hover:bg-primary/30 transition-all group-hover:scale-105 duration-300">
              <Target className="w-5 h-5 text-primary" />
            </div>
            <span className="font-heading font-bold text-2xl tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-primary via-highlight to-secondary">
              IMUZAKI
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link 
                key={link.title} 
                href={link.url}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  location === link.url ? 'text-primary drop-shadow-[0_0_8px_rgba(123,46,255,0.5)]' : 'text-muted-foreground'
                }`}
              >
                {link.title}
              </Link>
            ))}
            <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold neon-border px-6">
              <Link href="/donate">Support Stream</Link>
            </Button>
          </nav>

          {/* Mobile Nav */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-foreground hover:bg-white/5">
                  <Menu className="w-6 h-6" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-card/95 backdrop-blur-xl border-white/10 p-6">
                <nav className="flex flex-col gap-6 mt-10">
                  {navLinks.map((link) => (
                    <Link 
                      key={link.title} 
                      href={link.url}
                      className={`text-xl font-heading font-semibold transition-colors hover:text-primary ${
                        location === link.url ? 'text-primary' : 'text-muted-foreground'
                      }`}
                    >
                      {link.title}
                    </Link>
                  ))}
                  <div className="pt-4 border-t border-white/10 mt-4">
                    <Button asChild className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold neon-border">
                      <Link href="/donate">Support Stream</Link>
                    </Button>
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main className="flex-1 relative z-10 w-full">
        {children}
      </main>

      <footer className="border-t border-white/5 bg-background/80 backdrop-blur-md relative z-10 py-8">
        <div className="container mx-auto px-4 md:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-primary" />
            <span className="font-heading font-bold text-lg tracking-wider text-muted-foreground">IMUZAKI</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link href="/terms" className="hover:text-primary transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
            <Link href="/admin/login" className="hover:text-primary transition-colors">Admin</Link>
          </div>
          <p className="text-xs text-muted-foreground/50">
            &copy; {new Date().getFullYear()} Imuzaki Hub. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
