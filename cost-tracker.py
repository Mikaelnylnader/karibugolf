#!/usr/bin/env python3
import json, sys, urllib.request
from collections import defaultdict
SID="1f9njWpqERHIbwKIfbPalauXJdkgQGZuvSYvEluwVuPY"
URL=f"https://docs.google.com/spreadsheets/d/{SID}/gviz/tq?tqx=out:json"
FX=21.24
def F():
    r=urllib.request.Request(URL)
    with urllib.request.urlopen(r,timeout=30) as f: raw=f.read().decode()
    s=raw.index("{"); e=raw.rindex("}")+1
    d=json.loads(raw[s:e])
    rows=[[c.get("v","")if c else"" for c in r.get("c",[])] for r in d["table"]["rows"]]
    P=[]
    for row in rows:
        if not row or not row[2]: continue
        p={"sku":str(row[1]or"").strip(),"name":str(row[2]or"").strip(),"cat":str(row[3]or"").strip(),"desc":str(row[4]or"").strip(),"cny":N(row[7]),"ksh":N(row[8]),"mar":N(row[9]),"sell":N(row[10]),"profit":N(row[14]),"status":str(row[16]or"").strip()}
        if p["sell"]and p["ksh"]and not p["profit"]: p["profit"]=round(p["sell"]-p["ksh"],0)
        P.append(p)
    return P
def N(v):
    if v==""or v is None: return 0.0
    try: return float(v)
    except: return 0.0
def K(a): return f"Ksh {a:,.0f}"if a else"Ksh 0"
def Y(a): return f"\u00a5{a:,.0f}"if a else"\u00a50"
def Pv(v): return f"{v:.1f}%"
def S(c="-",w=72): print(c*w)
def H(t): S("=");print(f"  {t}");S("=")
def Q(ps,q,sku=False):
    q=q.lower().strip()
    return[x for x in ps if(q==x["sku"].lower()if sku else(q in x["name"].lower()or q in x["sku"].lower()))]
def D(p,i=None):
    t=f"#{i} "if i else""
    print(f"\n  {t}{p['name']}");S(".")
    print(f"    SKU:{p['sku']}  Cat:{p['cat']}  Status:{p['status']}")
    print(f"    Cost CNY:{Y(p['cny']):>8s}  Cost Ksh:{K(p['ksh']):>10s}  Margin:{Pv(p['mar'])}")
    print(f"    Sell Ksh:{K(p['sell']):>10s}  Profit:{K(p['profit']):>10s}")
    if p["desc"]: print(f"    {p['desc']}")
def dash(ps):
    ac=[p for p in ps if p["status"]in("In Stock","")]
    tc=sum(p["ksh"]for p in ac);ts=sum(p["sell"]for p in ac)
    am=sum(p["mar"]for p in ac if p["mar"])/max(len([p for p in ac if p["mar"]]),1)
    H("GOLF COST DASHBOARD - KENYA")
    print(f"  Products:{len(ac)}  Invest:{K(tc)}  Revenue:{K(ts)}  Profit:{K(ts-tc)}  Avg Margin:{Pv(am)}  FX:1CNY={FX}Ksh")
    S()
    cg=defaultdict(list)
    for p in ac: cg[p["cat"]or"Other"].append(p)
    for cn in sorted(cg.keys()):
        it=cg[cn]
        print(f"  {cn}({len(it)}):Cost{K(sum(x['ksh']for x in it)):>14}Sell{K(sum(x['sell']for x in it)):>14}Profit{K(sum(x['profit']for x in it)):>14}")
def lookup(ps,args):
    sku="--sku"in args
    q=[a for a in args[1:]if not a.startswith("--")]
    if not q: print("Usage: lookup [--sku] <query>");return
    r=Q(ps," ".join(q),sku)
    if not r: print("No match");return
    for i,p in enumerate(r,1): D(p,i)
def catcmd(ps,args):
    if len(args)<2:
        for c in sorted(set(p["cat"]for p in ps if p["cat"])):print(f"  {c}({len([p for p in ps if p['cat']==c])})")
        return
    cn=" ".join(args[1:]).lower().strip()
    m=[p for p in ps if p["cat"].lower()==cn]
    if not m: print("Category not found");return
    H(f"{m[0]['cat']}({len(m)})")
    m.sort(key=lambda x:x["sell"])
    for i,p in enumerate(m,1):
        print(f"\n  {i:2d}.{p['name']}")
        print(f"      {K(p['ksh']):>10s}->{K(p['sell']):>10s}Profit{K(p['profit']):>10s}@{Pv(p['mar'])}")
def compare(ps,args):
    if len(args)<3: print('Usage: compare "A" "B"');return
    a,b=Q(ps,args[1]),Q(ps," ".join(args[2:]))
    if not a or not b: print("Not found");return
    a,b=a[0],b[0]
    H("COMPARE")
    for l,f in[("Cost CNY","cny"),("Cost Ksh","ksh"),("Margin","mar"),("Sell Ksh","sell"),("Profit","profit")]:
        va,vb=a[f],b[f];fm=K if f in("ksh","sell","profit")else(Y if f=="cny"else Pv)
        print(f"  {l:15s}{fm(va):>12s}vs{fm(vb):>12s}")
    pd=a["profit"]-b["profit"]
    if pd: print(f"\n  Winner:{K(abs(pd))}more profit")
def whatif(ps,args):
    if len(args)<3: print('Usage: whatif "name" <pct>');return
    try: t=float(args[-1])
    except: print("Bad margin");return
    r=Q(ps," ".join(args[1:-1]))
    if not r: print("No match");return
    p=r[0]
    c=p["ksh"]if p["ksh"]else p["cny"]*FX
    ns=c/(1-t/100)
    H(f"WHAT-IF:{p['name']}")
    print(f"  Current:Cost{K(c)}Margin{Pv(p['mar'])}Sell{K(p['sell'])}Profit{K(p['profit'])}")
    print(f"  At {Pv(t)}:Sell{K(ns)}({Y(ns/FX)}CNY)Profit{K(ns-c)}")
def margins(ps):
    H("MARGIN REPORT")
    mp=sorted([p for p in ps if p["mar"]>0],key=lambda x:x["profit"],reverse=True)
    print(f"  {'#':>3s}{'Product':40s}{'Cost':>10s}{'Sell':>10s}{'Profit':>10s}{'Margin':>7s}")
    S(".")
    for i,p in enumerate(mp,1):
        print(f"  {i:3d}{p['name'][:38]:38s}{K(p['ksh']):>10s}{K(p['sell']):>10s}{K(p['profit']):>10s}{Pv(p['mar']):>7s}")
    avg=sum(x["mar"]for x in mp)/len(mp)
    print(f"\n  Avg Margin:{Pv(avg):>17s}Total Profit:{K(sum(x['profit']for x in mp)):>17s}")
def cheapest(ps):
    H("CHEAPEST PER CATEGORY")
    cg=defaultdict(list)
    for p in ps:
        if p["sell"]:cg[p["cat"]or"Other"].append(p)
    for cn in sorted(cg.keys()):
        it=cg[cn];ch=min(it,key=lambda x:x["sell"]);mx=max(it,key=lambda x:x["sell"])
        print(f"\n  {cn}({len(it)}):Cheapest{K(ch['sell']):>12s}Costliest{K(mx['sell']):>12s}")
def balls(ps):
    bl=[p for p in ps if p["cat"].lower()=="balls"]
    if not bl: print("No balls");return
    H(f"GOLF BALLS({len(bl)})")
    bl.sort(key=lambda x:x["sell"])
    for i,p in enumerate(bl,1):
        print(f"\n  {i:2d}.{p['name']}")
        print(f"      {K(p['ksh']):>10s}->{K(p['sell']):>10s}Profit{K(p['profit']):>10s}@{Pv(p['mar'])}")
    pv=[b for b in bl if"pro v1"in b["name"].lower()]
    if pv:
        S("=")
        for p in pv:
            print(f"\n  ** {p['name']} **")
            print(f"      Cost:{Y(p['cny']):>8s}CNY->{K(p['ksh']):>10s}Ksh/dozen")
            print(f"      Sell:{K(p['sell']):>10s}Ksh({K(p['sell']/12):>8s}/ball)")
            print(f"      Profit:{K(p['profit']):>10s}/dozen({K(p['profit']/12):>8s}/ball)@{Pv(p['mar'])}")
def main():
    try: ps=F()
    except Exception as e: print(f"Fetch failed:{e}");sys.exit(1)
    if not ps: print("No products");sys.exit(1)
    args=sys.argv[1:]
    if not args or args[0]in("dashboard","dash","summary",""):dash(ps)
    elif args[0]in("lookup","search","find","get"):lookup(ps,args)
    elif args[0]in("category","cat"):catcmd(ps,args)
    elif args[0]in("compare","diff","vs"):compare(ps,args)
    elif args[0]in("whatif","what-if","simulate"):whatif(ps,args)
    elif args[0]in("margin-report","margins","profit"):margins(ps)
    elif args[0]in("cheapest","cheap","budget"):cheapest(ps)
    elif args[0]in("balls","ball","golf-balls"):balls(ps)
    elif args[0]in("help","--help","-h"):print(__doc__)
    else:
        r=Q(ps,args[0])
        if r:D(r[0])
if __name__=="__main__": main()
