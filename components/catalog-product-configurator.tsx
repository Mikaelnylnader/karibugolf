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

  return <div className="catalog-configurator">
    {configuration.map((group) => <fieldset key={group.label}>
      <legend>{group.label}</legend>
      <div className="catalog-option-grid">
        {group.values.map((value) => <button
          type="button"
          key={value}
          className={selected[group.label] === value ? "selected" : ""}
          aria-pressed={selected[group.label] === value}
          onClick={() => setSelected((current) => ({ ...current, [group.label]: value }))}
        >{value}</button>)}
      </div>
    </fieldset>)}
    <a className="contact-button" href={`https://wa.me/254116416105?text=${message}`}>
      <MessageCircle size={19}/>{available ? "Order on WhatsApp" : "Ask about availability"}
    </a>
    <p>A selection records your enquiry preference. We’ll confirm exact stock, specification, delivery cost and payment details directly.</p>
  </div>;
}
