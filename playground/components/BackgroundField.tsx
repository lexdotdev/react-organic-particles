import { useId } from "react";
import { Field } from "./fields";

interface BackgroundFieldProps {
  value: string;
  hex: string;
  onHexChange: (hex: string) => void;
  onChange: (value: string) => void;
}

export function BackgroundField({ value, hex, onHexChange, onChange }: BackgroundFieldProps) {
  const id = useId();
  const transparent = value === "transparent";

  return (
    <Field id={id} label="Background" value={transparent ? "transparent" : hex}>
      <div className="background-row">
        <input
          id={id}
          type="color"
          value={hex}
          disabled={transparent}
          onChange={(event) => {
            onHexChange(event.target.value);
            onChange(event.target.value);
          }}
        />
        <label className="checkbox-field">
          <input
            type="checkbox"
            checked={transparent}
            onChange={(event) => onChange(event.target.checked ? "transparent" : hex)}
          />
          <span>Transparent</span>
        </label>
      </div>
    </Field>
  );
}
