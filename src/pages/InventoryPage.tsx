import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Package, Pencil, Trash2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { defaultInventory } from "@/lib/mockData";
import type { InventoryItem } from "@/lib/mockData";

const categories = ["seeds", "fertilizers", "tools"] as const;
const categoryIcons: Record<string, string> = { seeds: "🌱", fertilizers: "🧪", tools: "🔧" };

const InventoryPage = () => {
  const [items, setItems] = useLocalStorage<InventoryItem[]>("smartfarm-inventory", defaultInventory);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", category: "seeds" as InventoryItem["category"], quantity: "", unit: "", lowStockThreshold: "" });
  const [filter, setFilter] = useState<string>("all");

  const openAdd = () => { setEditId(null); setForm({ name: "", category: "seeds", quantity: "", unit: "kg", lowStockThreshold: "5" }); setOpen(true); };
  const openEdit = (item: InventoryItem) => { setEditId(item.id); setForm({ name: item.name, category: item.category, quantity: String(item.quantity), unit: item.unit, lowStockThreshold: String(item.lowStockThreshold) }); setOpen(true); };

  const save = () => {
    if (!form.name || !form.quantity) return;
    const entry: InventoryItem = {
      id: editId || Date.now().toString(),
      name: form.name, category: form.category,
      quantity: Number(form.quantity), unit: form.unit,
      lowStockThreshold: Number(form.lowStockThreshold),
    };
    setItems(editId ? items.map(i => i.id === editId ? entry : i) : [...items, entry]);
    setOpen(false);
  };

  const remove = (id: string) => setItems(items.filter(i => i.id !== id));
  const filtered = filter === "all" ? items : items.filter(i => i.category === filter);
  const lowStockCount = items.filter(i => i.quantity <= i.lowStockThreshold).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-header">📦 Inventory</h1>
          <p className="page-subtitle">Manage your farm supplies</p>
        </div>
        <Button onClick={openAdd} className="gap-2"><Plus className="w-4 h-4" /> Add Item</Button>
      </div>

      {lowStockCount > 0 && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-warning/10 text-warning text-sm">
          <AlertTriangle className="w-4 h-4" />
          <span>{lowStockCount} item{lowStockCount > 1 ? "s" : ""} running low on stock</span>
        </div>
      )}

      <div className="flex gap-2">
        {["all", ...categories].map(c => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === c ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent"
            }`}
          >
            {c === "all" ? "All" : `${categoryIcons[c]} ${c.charAt(0).toUpperCase() + c.slice(1)}`}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((item, i) => {
          const low = item.quantity <= item.lowStockThreshold;
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className={`stat-card ${low ? "border-warning/40" : ""}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{categoryIcons[item.category]}</span>
                  <div>
                    <h3 className="font-semibold">{item.name}</h3>
                    <p className="text-xs text-muted-foreground capitalize">{item.category}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(item)} className="p-1.5 rounded hover:bg-muted"><Pencil className="w-3.5 h-3.5 text-muted-foreground" /></button>
                  <button onClick={() => remove(item.id)} className="p-1.5 rounded hover:bg-muted"><Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" /></button>
                </div>
              </div>
              <div className="mt-3 flex items-end justify-between">
                <div>
                  <p className="text-2xl font-bold">{item.quantity}</p>
                  <p className="text-xs text-muted-foreground">{item.unit}</p>
                </div>
                {low && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-warning/10 text-warning font-medium">Low Stock</span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editId ? "Edit" : "Add"} Item</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-2">
            <Input placeholder="Item name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            <Select value={form.category} onValueChange={v => setForm({ ...form, category: v as InventoryItem["category"] })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {categories.map(c => <SelectItem key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</SelectItem>)}
              </SelectContent>
            </Select>
            <div className="grid grid-cols-2 gap-3">
              <Input type="number" placeholder="Quantity" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} />
              <Input placeholder="Unit (kg, pcs...)" value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} />
            </div>
            <Input type="number" placeholder="Low stock threshold" value={form.lowStockThreshold} onChange={e => setForm({ ...form, lowStockThreshold: e.target.value })} />
            <Button onClick={save} className="w-full">{editId ? "Update" : "Add"} Item</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InventoryPage;
