"use client"

import * as React from "react"
import { Check, ChevronDown, LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils/cn"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import * as Icons from "lucide-react";
import { Input } from "./input";
import { Label } from "./label";

interface IconPickerProps {
  value: string;
  onChange: (iconName: string) => void;
  label?: string;
}

const iconNames = Object.keys(Icons).filter(name => name !== "createReactComponent" && name !== "type Icon");

export function IconPicker({ value, onChange, label }: IconPickerProps) {
  const [open, setOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState("");

  const currentIcon = iconNames.find(name => name === value) || "";
  const CurrentIconComponent = (Icons as { [key: string]: LucideIcon })[currentIcon];

  const filteredIcons = iconNames.filter(name =>
    name.toLowerCase().includes(searchValue.toLowerCase())
  );

  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outlined"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between pr-2"
          >
            <div className="flex items-center gap-2">
              {CurrentIconComponent && <CurrentIconComponent className="h-5 w-5" />}
              {value || "Wybierz ikonę"}
            </div>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput
              placeholder="Szukaj ikony..."
              value={searchValue}
              onValueChange={setSearchValue}
            />
            <CommandEmpty>Brak ikon.</CommandEmpty>
            <CommandList>
              <CommandGroup>
                {filteredIcons.map((iconName) => {
                  const IconComponent = (Icons as { [key: string]: LucideIcon })[iconName];
                  return (
                    <CommandItem
                      key={iconName}
                      value={iconName}
                      onSelect={(currentValue) => {
                        onChange(currentValue === value ? "" : currentValue);
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          value === iconName ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {IconComponent && <IconComponent className="mr-2 h-4 w-4" />}
                      {iconName}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
