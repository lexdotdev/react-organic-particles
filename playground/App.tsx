import { useRef, useState } from "react";
import { OrganicParticleField } from "@lexdotdev/react-organic-particles";
import type { OrganicParticleFieldHandle } from "@lexdotdev/react-organic-particles";
import { CodePanel } from "./components/CodePanel";
import { ExportSection } from "./components/ExportSection";
import { ControlPanel } from "./ControlPanel";
import { DEFAULT_PROPS, EXAMPLES, type PlaygroundState } from "./defaults";
import { generateJsx } from "./generateJsx";

export function App() {
  const [state, setState] = useState<PlaygroundState>(DEFAULT_PROPS);
  const [bgHex, setBgHex] = useState("#f8fafc");
  const [ready, setReady] = useState(false);
  const fieldRef = useRef<OrganicParticleFieldHandle>(null);
  const stageRef = useRef<HTMLElement>(null);

  function update<K extends keyof PlaygroundState>(key: K, value: PlaygroundState[K]) {
    setState((prev) => ({ ...prev, [key]: value }));
  }

  function loadExample(props: Partial<PlaygroundState>) {
    const next = { ...DEFAULT_PROPS, ...props };
    setState(next);
    if (next.backgroundColor !== "transparent") {
      setBgHex(next.backgroundColor);
    }
  }

  const transparent = state.backgroundColor === "transparent";
  const status = ready ? "ready" : "initializing";

  return (
    <div className="app">
      <aside className="sidebar">
        <header className="sidebar-header">
          <h1>react-organic-particles</h1>
          <p>Playground</p>
        </header>

        <section className="panel">
          <h2>Examples</h2>
          <div className="button-row">
            {EXAMPLES.map((example) => (
              <button key={example.label} type="button" onClick={() => loadExample(example.props)}>
                {example.label}
              </button>
            ))}
          </div>
        </section>

        <section className="panel">
          <h2>Playback</h2>
          <div className="button-row">
            <button type="button" onClick={() => update("paused", !state.paused)}>
              {state.paused ? "Resume (prop)" : "Pause (prop)"}
            </button>
            <button type="button" onClick={() => fieldRef.current?.pause()}>
              Pause (ref)
            </button>
            <button type="button" onClick={() => fieldRef.current?.resume()}>
              Resume (ref)
            </button>
            <button type="button" onClick={() => fieldRef.current?.reset()}>
              Reset
            </button>
          </div>
          <p className="hint">The paused prop is declarative; the ref handle is imperative.</p>
        </section>

        <ControlPanel state={state} update={update} bgHex={bgHex} onBgHexChange={setBgHex} />

        <CodePanel code={generateJsx(state)} />

        <ExportSection stageRef={stageRef} backgroundColor={state.backgroundColor} />
      </aside>

      <main className="preview" ref={stageRef}>
        <div
          className={transparent ? "preview-stage checkerboard" : "preview-stage"}
          style={transparent ? undefined : { backgroundColor: state.backgroundColor }}
        >
          <OrganicParticleField ref={fieldRef} {...state} onReady={() => setReady(true)} />
        </div>
        <p className="preview-hint">
          The preview container defines the size; the field fills it. Status: {status}.
        </p>
      </main>
    </div>
  );
}
