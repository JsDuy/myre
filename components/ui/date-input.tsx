"use client";

import React from "react";
import { Input } from "./input";

interface DateInputProps {
  value?: Date;
  onChange?: (date: Date) => void;
  placeholder?: string;
}

export function DateInput({
  value,
  onChange,
  placeholder = "Select date",
}: DateInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = new Date(e.target.value);
    if (!isNaN(date.getTime())) {
      onChange?.(date);
    }
  };

  const formatDateForInput = (date?: Date) => {
    if (!date) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  return (
    <Input
      type="date"
      value={formatDateForInput(value)}
      onChange={handleChange}
      placeholder={placeholder}
    />
  );
}
