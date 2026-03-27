import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Camera, RefreshCw, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { diseases } from "@/lib/mockData";

const DiseaseDetectionPage = () => {
  const [image, setImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<typeof diseases[0] | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => setImage(e.target?.result as string);
    reader.readAsDataURL(file);
    setResult(null);
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
  }, []);

  const analyze = () => {
    setAnalyzing(true);
    setResult(null);
    setTimeout(() => {
      setResult(diseases[Math.floor(Math.random() * diseases.length)]);
      setAnalyzing(false);
    }, 2500);
  };

  const reset = () => { setImage(null); setResult(null); };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-header">📸 Disease Detection</h1>
        <p className="page-subtitle">Upload a crop image for AI-powered analysis</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Upload area */}
        <div className="stat-card">
          {!image ? (
            <label
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
              className={`flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                dragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
              }`}
            >
              <Upload className="w-10 h-10 text-muted-foreground mb-3" />
              <p className="font-medium">Drop image here or click to upload</p>
              <p className="text-sm text-muted-foreground mt-1">JPG, PNG up to 10MB</p>
              <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
            </label>
          ) : (
            <div className="space-y-4">
              <img src={image} alt="Uploaded crop" className="w-full h-56 object-cover rounded-lg" />
              <div className="flex gap-2">
                <Button onClick={analyze} disabled={analyzing} className="flex-1 gap-2">
                  {analyzing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                  {analyzing ? "Analyzing..." : "Analyze"}
                </Button>
                <Button variant="outline" onClick={reset}>Reset</Button>
              </div>
            </div>
          )}
        </div>

        {/* Result */}
        <AnimatePresence mode="wait">
          {analyzing && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="stat-card flex flex-col items-center justify-center h-64"
            >
              <RefreshCw className="w-10 h-10 text-primary animate-spin mb-4" />
              <p className="font-medium">Analyzing crop image...</p>
              <p className="text-sm text-muted-foreground">Please wait</p>
            </motion.div>
          )}

          {result && !analyzing && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
              className="stat-card space-y-5"
            >
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-warning" />
                <h3 className="font-semibold text-lg">Detection Result</h3>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Crop</span>
                  <span className="font-medium">{result.crop}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Disease</span>
                  <span className="font-medium text-destructive">{result.name}</span>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-muted-foreground">Confidence</span>
                    <span className="font-medium">{result.confidence}%</span>
                  </div>
                  <Progress value={result.confidence} className="h-2.5" />
                </div>
              </div>

              <div className="p-3 rounded-lg bg-accent">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">Recommended Treatment</span>
                </div>
                <p className="text-sm text-muted-foreground">{result.remedy}</p>
              </div>

              <Button variant="outline" onClick={analyze} className="w-full gap-2">
                <RefreshCw className="w-4 h-4" /> Try Again
              </Button>
            </motion.div>
          )}

          {!result && !analyzing && (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="stat-card flex flex-col items-center justify-center h-64 text-muted-foreground">
              <Camera className="w-10 h-10 mb-3 opacity-40" />
              <p>Upload an image and click Analyze</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default DiseaseDetectionPage;
