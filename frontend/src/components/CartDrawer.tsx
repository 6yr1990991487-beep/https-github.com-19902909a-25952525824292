import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export const CartDrawer = () => {
  const { items, open, setOpen, remove, setQty, clear, total, count } = useCart();
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 font-display">
            <ShoppingBag className="w-5 h-5 text-primary" />
            Panier · {count} article{count > 1 ? "s" : ""}
          </SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto -mx-6 px-6 py-4 space-y-3">
          {items.length === 0 && <p className="text-sm text-muted-foreground py-12 text-center">Votre panier est vide.</p>}
          {items.map((i) => (
            <div key={i.id} className="flex items-start gap-3 rounded-lg border border-border/60 bg-card/60 p-3">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm leading-snug line-clamp-2">{i.name}</p>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">{i.category}</p>
                <div className="flex items-center gap-2 mt-2">
                  <button onClick={() => setQty(i.id, i.qty - 1)} className="w-7 h-7 rounded-md border border-border grid place-items-center hover:bg-secondary" aria-label="Diminuer"><Minus className="w-3 h-3" /></button>
                  <span className="text-sm font-semibold min-w-[1.5rem] text-center">{i.qty}</span>
                  <button onClick={() => setQty(i.id, i.qty + 1)} className="w-7 h-7 rounded-md border border-border grid place-items-center hover:bg-secondary" aria-label="Augmenter"><Plus className="w-3 h-3" /></button>
                </div>
              </div>
              <div className="text-right">
                <p className="font-display font-bold text-sm">{(i.qty * i.price).toFixed(2)} €</p>
                <button onClick={() => remove(i.id)} className="mt-2 text-muted-foreground hover:text-destructive" aria-label="Retirer"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
        <div className="border-t border-border pt-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Total</span>
            <span className="font-display text-2xl font-extrabold gradient-text">{total.toFixed(2)} €</span>
          </div>
          <p className="text-[10px] text-muted-foreground">Livraison estimée 3–7 jours · dropshipping suivi</p>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={clear} disabled={!items.length}>Vider</Button>
            <Button className="flex-1" disabled={!items.length}
              onClick={() => toast({ title: "Commande simulée", description: `Merci ! ${count} article(s) — ${total.toFixed(2)} €.` })}>
              Commander
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
