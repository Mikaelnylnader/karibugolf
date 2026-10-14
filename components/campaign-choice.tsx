"use client";
import { createContext, useContext, useState, type ReactNode } from "react";
import { rewards } from "@/lib/campaign";
type RewardId=typeof rewards[number]["id"];
const CampaignChoice=createContext<{selected:RewardId|null;choose:(id:RewardId)=>void}>({selected:null,choose:()=>{}});
export function CampaignChoiceProvider({children}:{children:ReactNode}){const [selected,choose]=useState<RewardId|null>(null);return <CampaignChoice.Provider value={{selected,choose}}>{children}</CampaignChoice.Provider>;}
export const useCampaignChoice=()=>useContext(CampaignChoice);
