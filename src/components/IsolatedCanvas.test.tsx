import { render, waitFor } from "@testing-library/react";
import { StrictMode, useEffect, type PropsWithChildren } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { IsolatedCanvas } from "./IsolatedCanvas";

const lifecycle = vi.hoisted(() => ({ mounts: 0, unmounts: 0 }));

vi.mock("@react-three/fiber", () => ({
  Canvas({ children }: PropsWithChildren) {
    useEffect(() => {
      lifecycle.mounts += 1;
      return () => {
        lifecycle.unmounts += 1;
      };
    }, []);
    return <canvas>{children}</canvas>;
  },
}));

describe("IsolatedCanvas", () => {
  beforeEach(() => {
    lifecycle.mounts = 0;
    lifecycle.unmounts = 0;
  });

  it("does not replay the canvas lifecycle in StrictMode", async () => {
    const view = render(
      <StrictMode>
        <IsolatedCanvas />
      </StrictMode>,
    );

    await waitFor(() => expect(lifecycle.mounts).toBe(1));
    expect(lifecycle.unmounts).toBe(0);

    view.unmount();
    await waitFor(() => expect(lifecycle.unmounts).toBe(1));
  });
});
