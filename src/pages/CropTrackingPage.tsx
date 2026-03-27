import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Sprout, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { defaultCrops, growthStages } from "@/lib/mockData";
import type { Crop, GrowthStage } from "@/lib/mockData";

const CropTrackingPage = () => {
  const [crops, setCrops] = useLocalStorage<Crop[]>("smartfarm-crops", defaultCrops);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [stage, setStage] = useState<GrowthStage>("Seed");

  const addCrop = () => {
    if (!name || !date) return;
    const newCrop: Crop = {
      id: Date.now().toString(),
      name,
      plantingDate: date,
      stage,
      status: Math.random() > 0.3 ? "healthy" : "attention",
      daysToHarvest: Math.floor(Math.random() * 90) + 20,
    };
    setCrops([...crops, newCrop]);
    setName(""); setDate(""); setStage("Seed"); setOpen(false);
  };

  const removeCrop = (id: string) => setCrops(crops.filter(c => c.id !== id));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-header">🌿 Crop Tracking</h1>
          <p className="page-subtitle">Monitor your crops' growth journey</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="w-4 h-4" /> Add Crop</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add New Crop</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-2">
              <Input placeholder="Crop name" value={name} onChange={e => setName(e.target.value)} />
              <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
              <Select value={stage} onValueChange={v => setStage(v as GrowthStage)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {growthStages.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
              <Button onClick={addCrop} className="w-full">Add Crop</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {crops.map((crop, i) => {
          const stageIndex = growthStages.indexOf(crop.stage);
          const progress = ((stageIndex + 1) / growthStages.length) * 100;
          return (
            <motion.div
              key={crop.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="stat-card"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Sprout className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold">{crop.name}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    crop.status === "healthy" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
                  }`}>
                    {crop.status === "healthy" ? "Healthy" : "Needs Attention"}
                  </span>
                  <button onClick={() => removeCrop(crop.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Planted: {new Date(crop.plantingDate).toLocaleDateString()}</span>
                  <span>{crop.daysToHarvest}d to harvest</span>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium">{crop.stage}</span>
                    <span className="text-muted-foreground">{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
                <div className="flex gap-1">
                  {growthStages.map((s, idx) => (
                    <div
                      key={s}
                      className={`h-1.5 flex-1 rounded-full ${
                        idx <= stageIndex ? "bg-primary" : "bg-muted"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default CropTrackingPage;
