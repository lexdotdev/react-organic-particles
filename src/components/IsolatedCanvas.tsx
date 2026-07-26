import { Canvas } from "@react-three/fiber";
import type { ComponentProps, CSSProperties } from "react";
import { useEffect, useRef } from "react";
import { createRoot, type Root } from "react-dom/client";

const STYLE: CSSProperties = { width: "100%", height: "100%" };

type IsolatedCanvasProps = ComponentProps<typeof Canvas>;

export function IsolatedCanvas(props: IsolatedCanvasProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<Root | null>(null);
  const cleanupRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    clearTimeout(cleanupRef.current);
    rootRef.current ??= createRoot(host);

    return () => {
      cleanupRef.current = setTimeout(() => {
        rootRef.current?.unmount();
        rootRef.current = null;
      });
    };
  }, []);

  useEffect(() => {
    rootRef.current?.render(<Canvas {...props} />);
  });

  return <div ref={hostRef} style={STYLE} />;
}
