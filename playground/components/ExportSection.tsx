import { useId, useState, type RefObject } from "react";
import { captureFrames, encodeGif } from "../gif";

interface ExportSectionProps {
  stageRef: RefObject<HTMLElement | null>;
  backgroundColor: string;
}

type Phase = "idle" | "recording" | "encoding";

function clampInt(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, Math.floor(value)));
}

// Let React paint the status before a long synchronous block.
const nextPaint = () =>
  new Promise<void>((resolve) => requestAnimationFrame(() => setTimeout(resolve, 0)));

interface NumberFieldProps {
  label: string;
  value: number;
  min: number;
  max: number;
  disabled?: boolean;
  onChange: (value: number) => void;
}

function NumberField({ label, value, min, max, disabled, onChange }: NumberFieldProps) {
  const id = useId();
  return (
    <div className="export-field">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type="number"
        min={min}
        max={max}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(clampInt(Number(event.target.value) || min, min, max))}
      />
    </div>
  );
}

export function ExportSection({ stageRef, backgroundColor }: ExportSectionProps) {
  const [duration, setDuration] = useState(3);
  const [fps, setFps] = useState(20);
  const [width, setWidth] = useState(480);
  const [phase, setPhase] = useState<Phase>("idle");
  const [progress, setProgress] = useState("");

  const busy = phase !== "idle";

  const handleExport = async () => {
    const source = stageRef.current?.querySelector("canvas");
    if (!source || busy) return;
    setPhase("recording");
    try {
      const frames = await captureFrames(source, {
        duration,
        fps,
        width,
        backgroundColor,
        onProgress: (elapsed, total) => setProgress(`Recording ${elapsed.toFixed(1)} / ${total} s`),
      });
      setPhase("encoding");
      setProgress("Encoding…");
      await nextPaint();
      const blob = encodeGif(frames, {
        width: frames[0].width,
        height: frames[0].height,
        fps,
        transparent: backgroundColor === "transparent",
      });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "organic-particles.gif";
      anchor.click();
      // Revoking synchronously can cancel the download in some browsers.
      window.setTimeout(() => URL.revokeObjectURL(url), 10_000);
      setProgress("");
    } catch (error) {
      setProgress(`Export failed: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setPhase("idle");
    }
  };

  return (
    <section className="panel">
      <h2>Export</h2>
      <div className="export-grid">
        <NumberField
          label="Duration (s)"
          value={duration}
          min={1}
          max={10}
          disabled={busy}
          onChange={setDuration}
        />
        <NumberField label="FPS" value={fps} min={10} max={30} disabled={busy} onChange={setFps} />
        <NumberField
          label="Width (px)"
          value={width}
          min={240}
          max={960}
          disabled={busy}
          onChange={setWidth}
        />
      </div>
      <button
        type="button"
        className="button-primary export-button"
        disabled={busy}
        onClick={handleExport}
      >
        {busy ? "Working…" : "Save as GIF"}
      </button>
      {progress !== "" && <p className="hint">{progress}</p>}
      <p className="hint">
        Keep the tab visible while recording. Transparency is quantized to on/off alpha (GIF
        limitation), so glow edges look harder than on screen.
      </p>
    </section>
  );
}
