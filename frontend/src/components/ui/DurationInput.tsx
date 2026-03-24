import { useState, useEffect, useRef } from 'react';
import { parseDuration, formatMinutesAsDuration } from '@/lib/time';

interface DurationInputProps {
  value: number;
  onChange: (minutes: number) => void;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
}

export function DurationInput({ value, onChange, className, placeholder, disabled }: DurationInputProps) {
  const [text, setText] = useState(() => formatMinutesAsDuration(value));
  const [focused, setFocused] = useState(false);
  const prevValue = useRef(value);

  // Sync display text when value changes externally (not while user is typing)
  useEffect(() => {
    if (!focused && value !== prevValue.current) {
      setText(formatMinutesAsDuration(value));
    }
    prevValue.current = value;
  }, [value, focused]);

  const handleFocus = () => {
    setFocused(true);
  };

  const handleBlur = () => {
    setFocused(false);
    const parsed = parseDuration(text);
    onChange(parsed);
    setText(formatMinutesAsDuration(parsed));
  };

  return (
    <input
      type="text"
      value={text}
      onChange={(e) => setText(e.target.value)}
      onFocus={handleFocus}
      onBlur={handleBlur}
      className={className}
      placeholder={placeholder ?? 'e.g. 1h 30m'}
      disabled={disabled}
    />
  );
}
