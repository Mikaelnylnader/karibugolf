"use client";

import { useState } from "react";
import { MessageCircle } from "lucide-react";
import type { ProductConfiguration } from "@/lib/product-page-details";

type Props = {
  name: string;
  sku: string;
  price: string;
  available: boolean;
  configuration: ProductConfiguration[];
};

export default function CatalogProductConfigurator({ name, sku, price, available, configuration }: Props) {
  const [selected, setSelected] = useState<Record<string, string>>(
    Object.fromEntries(configuration.map((group) => [group.label, group.values[0] ?? ""])),
  );
  const preferences = configuration.map((group) => `${group.label}: ${selected[group.label]}`).join(", ");
  const message = encodeURIComponent(
    `Hi Karibu Golf! I'd like to ask about ${name} (${sku}) at ${price}.${preferences ? ` My preferred configuration is ${preferences}.` : ""} Please confirm the exact item, availability and delivery options.`,
  );

  const valuesFor = (group: ProductConfiguration) => {
    if (group.label !== "Flex" || !selected.Shaft) return group.values;
    if (selected.Shaft === "Steel") return group.values.filter((value) => !value.startsWith("Senior"));
    return group.values;
  };

  const selectOption = (label: string, value: string) => {
    setSelected((current) => {
      const next = { ...current, [label]: value };
      if (label === "Shaft" && value === "Steel" && next.Flex?.startsWith("Senior")) {
        next.Flex = configuration.find((group) => group.label === "Flex")?.values.find((flex) => flex.startsWith("Regular")) ?? "";
      }
      return next;
    });
  };

  return <div className="catalog-configurator">
    {configuration.map((group) => <fieldset key={group.label}>
      <legend>{group.label}</legend>
      <div className="catalog-option-grid">
        {valuesFor(group).map((value) => <button
          type="button"
          key={value}
          className={selected[group.label] === value ? "selected" : ""}
          aria-pressed={selected[group.label] === value}
          onClick={() => selectOption(group.label, value)}
        >{value}</button>)}
      </div>
    </fieldset>)}
    <a className="contact-button" href={`https://wa.me/254116416105?text=${message}`}>
      <MessageCircle size={19}/>{available ? "Order on WhatsApp" : "Ask about availability"}
    </a>
    <p>A selection records your enquiry preference. We’ll confirm exact stock, specification, delivery cost and payment details directly.</p>
  </div>;
}
