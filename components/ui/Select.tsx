"use client";

import { Check, ChevronDown } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

type SelectOption = {
  value: string;
  label: string;
  description?: string;
};

type SelectProps = {
  label?: string;
  value: string;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  onChange: (value: string) => void;
};

export default function Select({
  label,
  value,
  options,
  placeholder = "Seleccionar opción",
  disabled = false,
  onChange,
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();

  const selectedOption = options.find(
    (option) => option.value === value,
  );

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const selectOption = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      {label ? (
        <label className="mb-2 block text-sm font-semibold text-admin-text">
          {label}
        </label>
      ) : null}

      <button
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        onClick={() => setIsOpen((current) => !current)}
        className={[
          "flex h-12 w-full items-center justify-between gap-3 rounded-xl",
          "border border-admin-border bg-white px-4 text-left",
          "text-sm text-admin-text transition-colors",
          "hover:border-admin-border-strong",
          "focus:border-primary focus:outline-none",
          "disabled:cursor-not-allowed disabled:opacity-60",
          isOpen ? "border-primary" : "",
        ].join(" ")}
      >
        <span
          className={[
            "min-w-0 flex-1 truncate",
            selectedOption ? "text-admin-text" : "text-admin-text-muted",
          ].join(" ")}
        >
          {selectedOption?.label ?? placeholder}
        </span>

        <ChevronDown
          aria-hidden="true"
          size={18}
          strokeWidth={1.8}
          className={[
            "shrink-0 text-admin-text-muted transition-transform duration-200",
            isOpen ? "rotate-180 text-primary-dark" : "",
          ].join(" ")}
        />
      </button>

      {isOpen ? (
        <div
          id={listboxId}
          role="listbox"
          className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 overflow-hidden rounded-2xl border border-admin-border bg-white p-2 shadow-dropdown"
        >
          <div className="max-h-72 overflow-y-auto">
            {options.map((option) => {
              const selected = option.value === value;

              return (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() => selectOption(option.value)}
                  className={[
                    "flex min-h-11 w-full items-center gap-3 rounded-xl px-3 py-2",
                    "text-left text-sm transition-colors",
                    selected
                      ? "bg-admin-accent-soft text-admin-text"
                      : "text-admin-text hover:bg-admin-surface-soft",
                  ].join(" ")}
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold">
                      {option.label}
                    </span>

                    {option.description ? (
                      <span className="mt-0.5 block text-xs leading-5 text-admin-text-soft">
                        {option.description}
                      </span>
                    ) : null}
                  </span>

                  {selected ? (
                    <Check
                      aria-hidden="true"
                      size={18}
                      strokeWidth={2}
                      className="shrink-0 text-accent-dark"
                    />
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
