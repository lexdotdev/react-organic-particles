import { useEffect, useRef, useState } from "react";
import { MAX_COLOR_SLOTS } from "../../src/utils/colors";

const LONG_HEX = /^#[0-9a-f]{6}$/i;
const SHORT_HEX = /^#[0-9a-f]{3}$/i;
const isHex = (value: string) => LONG_HEX.test(value) || SHORT_HEX.test(value);

// Expand #rgb to #rrggbb; the color input rejects short hex.
function toPickerHex(color: string): string {
  if (SHORT_HEX.test(color)) {
    return color.replace(/[0-9a-f]/gi, (char) => char + char);
  }
  return color;
}

interface ColorRowProps {
  index: number;
  color: string;
  canRemove: boolean;
  onChange: (color: string) => void;
  onRemove: () => void;
}

function ColorRow({ index, color, canRemove, onChange, onRemove }: ColorRowProps) {
  const [draft, setDraft] = useState(color);
  const [editing, setEditing] = useState(false);

  // Sync the text field with external changes (example loaders).
  useEffect(() => {
    if (!editing) setDraft(color);
  }, [color, editing]);

  const commit = () => {
    const value = draft.trim().toLowerCase();
    if (isHex(value)) {
      onChange(value);
    } else {
      setDraft(color);
    }
  };

  return (
    <div className="color-row">
      <input
        type="color"
        aria-label={`Color ${index + 1} picker`}
        value={toPickerHex(color)}
        onChange={(event) => onChange(event.target.value)}
      />
      <input
        type="text"
        aria-label={`Color ${index + 1} hex`}
        spellCheck={false}
        value={editing ? draft : color}
        onFocus={() => {
          setDraft(color);
          setEditing(true);
        }}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={() => {
          commit();
          setEditing(false);
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter") event.currentTarget.blur();
        }}
      />
      <button
        type="button"
        className="color-remove"
        aria-label={`Remove color ${index + 1}`}
        disabled={!canRemove}
        onClick={onRemove}
      >
        ×
      </button>
    </div>
  );
}

interface ColorListFieldProps {
  colors: string[];
  onChange: (colors: string[]) => void;
}

export function ColorListField({ colors, onChange }: ColorListFieldProps) {
  // Stable row keys that survive edits, removals and replacements.
  const ids = useRef<number[]>(colors.map((_, index) => index));
  const nextId = useRef(colors.length);

  while (ids.current.length < colors.length) {
    ids.current.push(nextId.current);
    nextId.current += 1;
  }
  if (ids.current.length > colors.length) {
    ids.current.length = colors.length;
  }

  const replace = (index: number, value: string) => {
    onChange(colors.map((color, i) => (i === index ? value : color)));
  };

  const remove = (index: number) => {
    ids.current.splice(index, 1);
    onChange(colors.filter((_, i) => i !== index));
  };

  const add = () => {
    const last = colors[colors.length - 1] ?? "#ffffff";
    onChange([...colors, last]);
  };

  return (
    <div className="field">
      <div className="field-row">
        <span className="field-label">Colors</span>
        <span className="field-value">
          {colors.length}/{MAX_COLOR_SLOTS}
        </span>
      </div>
      {colors.map((color, index) => (
        <ColorRow
          key={ids.current[index] ?? index}
          index={index}
          color={color}
          canRemove={colors.length > 1}
          onChange={(value) => replace(index, value)}
          onRemove={() => remove(index)}
        />
      ))}
      <button type="button" onClick={add} disabled={colors.length >= MAX_COLOR_SLOTS}>
        Add color
      </button>
    </div>
  );
}
