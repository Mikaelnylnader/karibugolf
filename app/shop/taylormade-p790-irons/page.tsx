import type { Metadata } from "next";
import GolfProductTemplate from "@/components/golf-product-template";
import {p790} from "@/lib/karibu-products";
export const metadata:Metadata={title:"TaylorMade P790 Irons | Karibu Golf",description:"Explore P790 irons with a multi-angle gallery, features and specifications. 4–PW steel, Regular and Stiff in stock. KSh 130,000."};
export default function Product(){return <GolfProductTemplate product={p790}/>;}
