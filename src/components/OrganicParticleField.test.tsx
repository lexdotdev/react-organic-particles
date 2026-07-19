import { render, screen } from "@testing-library/react";
import { beforeAll, describe, expect, it, vi } from "vitest";

vi.mock("../utils/webgl", () => ({ isWebGLAvailable: () => false }));

import { OrganicParticleField } from "./OrganicParticleField";

beforeAll(() => {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    configurable: true,
    value: vi.fn((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(() => false),
    })),
  });
});

describe("OrganicParticleField fallback", () => {
  it("renders the consumer fallback when WebGL is unavailable", () => {
    render(<OrganicParticleField fallback={<p>no webgl here</p>} />);
    expect(screen.getByText("no webgl here")).toBeTruthy();
  });

  it("renders an empty div fallback by default", () => {
    const { container } = render(<OrganicParticleField />);
    const root = container.firstElementChild;
    expect(root?.firstElementChild?.tagName).toBe("DIV");
  });

  it("is aria-hidden unless an aria-label is provided", () => {
    const { container, rerender } = render(<OrganicParticleField />);
    const root = container.firstElementChild;
    expect(root?.getAttribute("aria-hidden")).toBe("true");

    rerender(<OrganicParticleField aria-label="Organic particle field" />);
    expect(root?.getAttribute("role")).toBe("img");
    expect(root?.getAttribute("aria-label")).toBe("Organic particle field");
    expect(root?.getAttribute("aria-hidden")).toBeNull();
  });

  it("merges className, style and background color on the root", () => {
    const { container } = render(
      <OrganicParticleField className="field" style={{ opacity: 0.5 }} backgroundColor="#000010" />,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toBe("field");
    expect(root.style.position).toBe("relative");
    expect(root.style.overflow).toBe("hidden");
    expect(root.style.opacity).toBe("0.5");
    expect(root.style.background).toContain("rgb(0, 0, 16)");
  });
});
