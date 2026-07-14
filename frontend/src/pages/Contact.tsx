import { PageShell } from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Contact = () => {
  const { toast } = useToast();
  return (
    <PageShell>
      <section className="container mx-auto px-4 lg:px-8 py-16 max-w-xl">
        <div className="w-12 h-12 rounded-2xl bg-primary/15 text-primary flex items-center justify-center mb-4">
          <Mail className="w-6 h-6" />
        </div>
        <p className="text-xs uppercase tracking-[0.25em] text-primary mb-2">Contact</p>
        <h1 className="font-display text-4xl sm:text-5xl font-extrabold mb-6">Écris à Lovanet</h1>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            toast({ title: "Message envoyé", description: "Lovanet te répond rapidement." });
            (e.target as HTMLFormElement).reset();
          }}
          className="tilt-card space-y-4 p-6 rounded-2xl bg-card border border-border neon-edge"
        >
          <div className="space-y-2">
            <Label htmlFor="name">Nom</Label>
            <Input id="name" required placeholder="Ton nom" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" required placeholder="toi@email.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea id="message" required rows={5} placeholder="Ton message..." />
          </div>
          <Button type="submit" className="w-full rounded-full bg-primary hover:bg-primary/90">Envoyer</Button>
        </form>
      </section>
    </PageShell>
  );
};

export default Contact;