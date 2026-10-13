"use client";

import { useEffect, useRef, useState } from "react";
import { MessageCircle } from "lucide-react";
import type { ProductConfiguration } from "@/lib/product-page-details";
import { initialIronSelection, ironStockMatch, type IronStock, type StockMatch } from "@/lib/iron-options";

type Props = {
  name: string;
  sku: string;
  price: string;
  available: boolean;
  configuration: ProductConfiguration[];
  ironStock?:IronStock;
  onStockMatchChange?:(match:StockMatch)=>void;
};

export default function CatalogProductConfigurator({ name, sku, price, available, configuration, ironStock, onStockMatchChange }: Props) {
  const touched=useRef(false);
  const [selected, setSelected] = useState<Record<string, string>>(
    {...Object.fromEntries(configuration.map((group) => [group.label, group.values[0] ?? ""])),...(ironStock ? initialIronSelection(ironStock) : {})},
  );
  const material=ironStock?.shaftMaterial, stockFlex=ironStock?.shaftFlex;
  useEffect(()=>{
    if ((material || stockFlex) && !touched.current) setSelected(current=>({...current,...initialIronSelection({shaftMaterial:material,shaftFlex:stockFlex})}));
  },[material,stockFlex]);
  const match=ironStock ? ironStockMatch(available,ironStock,selected) : available ? "in-stock" : "out-of-stock";
  useEffect(()=>{onStockMatchChange?.(match);},[match,onStockMatchChange]);
  const preferences = configuration.map((group) => `${group.label}: ${selected[group.label]}`).join(", ");
  const message = encodeURIComponent(
    `Hi Karibu Golf! I'd like to ask about ${name} (${sku}) at ${price}.${preferences ? ` My preferred configuration is ${preferences}.` : ""} Please confirm the exact item, availability and delivery options.`,
  );

  const selectOption = (label: string, value: string) => {
    touched.current=true;
    window.dispatchEvent(new CustomEvent("karibu:product-configuration", { detail: { sku, label, value } }));
    const next={...selected,[label]:value};
    setSelected(next);
    if (ironStock) onStockMatchChange?.(ironStockMatch(available,ironStock,next));
  };

  return <div className="catalog-configurator">
    {configuration.map((group) => <fieldset key={group.label}>
      <legend>{group.label}</legend>
      <div className="catalog-option-grid">
        {group.values.map((value) => <button
          type="button"
          key={value}
          className={selected[group.label] === value ? "selected" : ""}
          aria-pressed={selected[group.label] === value}
          aria-label={value}
          onClick={() => selectOption(group.label, value)}
        ><span>{value}</span>{ironStock && ["Shaft","Flex"].includes(group.label) && ironStockMatch(available,ironStock,{...selected,[group.label]:value})==="in-stock" && <small className="option-in-stock">In stock</small>}</button>)}
      </div>
    </fieldset>)}
    {ironStock && <p className={`selected-stock-status ${match}`} data-selected-stock={sku} aria-live="polite">Selected shaft/flex: {match==="in-stock" ? "In stock" : match==="unconfirmed" ? "Confirm availability" : "Not currently in stock"} · {selected.Shaft} · {selected.Flex}</p>}
    <a className="contact-button" href={`https://wa.me/254116416105?text=${message}`}>
      <MessageCircle size={19}/>{match==="in-stock" ? "Order on WhatsApp" : "Ask about availability"}
    </a>
    <p>A selection records your enquiry preference. We’ll confirm exact stock, specification, delivery cost and payment details directly.</p>
  </div>;
}
