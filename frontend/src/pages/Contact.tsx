import { PageShell } from "@/components/PageShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import leftCharacter from "@/assets/contact-left-character.png";
import rightCharacter from "@/assets/contact-right-character.png";

const floatingPortraitBase =
  "pointer-events-none absolute top-0 hidden md:block w-[180px] lg:w-[210px] xl:w-[230px] rounded-[2rem] border border-white/15 bg-white/[0.05] p-2 backdrop-blur-xl shadow-[0_24px_80px_-28px_rgba(0,0,0,0.75),0_0_26px_rgba(232,121,249,0.18),0_0_26px_rgba(34,211,238,0.16)]";

const Contact = () => {
  const { toast } = useToast();
  return (
    <PageShell>
      <section className="container mx-auto px-4 lg:px-8 py-16">
        <div className="relative mx-auto max-w-5xl pt-24 lg:pt-28" data-testid="contact-page-shell">
          <div className={`${floatingPortraitBase} left-0 -translate-x-[22%] -translate-y-[20%] animate-[float_7s_ease-in-out_infinite]`} data-testid="contact-left-character-overlay">
            <div className="relative overflow-hidden rounded-[1.5rem]">
              <img
                src={leftCharacter}
                alt="Portrait premium gauche"
                className="h-[220px] w-full object-cover scale-[1.08] contrast-[1.06] saturate-[1.12] brightness-[1.02]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
              <div className="absolute inset-0 opacity-30 mix-blend-screen bg-[linear-gradient(115deg,transparent_12%,rgba(255,255,255,0.26)_24%,transparent_38%,transparent_60%,rgba(255,255,255,0.18)_72%,transparent_86%)] animate-[shimmer_9s_linear_infinite]" />
              <div className="absolute inset-0 opacity-25 bg-[radial-gradient(circle_at_22%_22%,rgba(255,120,220,0.28),transparent_28%),radial-gradient(circle_at_80%_32%,rgba(34,211,238,0.22),transparent_26%)] animate-pulse-glow" />
            </div>
          </div>

          <div className={`${floatingPortraitBase} right-0 translate-x-[22%] -translate-y-[20%] animate-[float_8s_ease-in-out_infinite]`} data-testid="contact-right-character-overlay">
            <div className="relative overflow-hidden rounded-[1.5rem]">
              <img
                src={rightCharacter}
                alt="Portrait premium droite"
                className="h-[220px] w-full object-cover scale-[1.08] contrast-[1.06] saturate-[1.12] brightness-[1.02]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
              <div className="absolute inset-0 opacity-30 mix-blend-screen bg-[linear-gradient(115deg,transparent_12%,rgba(255,255,255,0.26)_24%,transparent_38%,transparent_60%,rgba(255,255,255,0.18)_72%,transparent_86%)] animate-[shimmer_10s_linear_infinite]" />
              <div className="absolute inset-0 opacity-25 bg-[radial-gradient(circle_at_78%_20%,rgba(255,120,220,0.28),transparent_28%),radial-gradient(circle_at_18%_34%,rgba(34,211,238,0.22),transparent_26%)] animate-pulse-glow" />
            </div>
          </div>

          <div className="mx-auto max-w-xl">
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
              data-testid="contact-form"
            >
              <div className="space-y-2">
                <Label htmlFor="name">Nom</Label>
                <Input id="name" required placeholder="Ton nom" data-testid="contact-name-input" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" required placeholder="toi@email.com" data-testid="contact-email-input" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea id="message" required rows={5} placeholder="Ton message..." data-testid="contact-message-input" />
              </div>
              <Button type="submit" className="w-full rounded-full bg-primary hover:bg-primary/90" data-testid="contact-submit-button">
                Envoyer
              </Button>
            </form>
          </div>
        </div>
      </section>
    </PageShell>
  );
};

export default Contact;
