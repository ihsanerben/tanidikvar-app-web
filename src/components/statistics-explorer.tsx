"use client";
import {useState} from "react";
import type {LabelCount} from "@/lib/api/catalog";

type Dataset={label:string;description:string;items?:LabelCount[]};
const colors=["#2f8f57","#6f8f50","#3f83c5","#d4a619","#bd3e4d","#8557b5","#d87b36","#488b82","#9c6b45","#66776b"];

export function StatisticsExplorer({datasets}:{datasets:Dataset[]}){
 const [selected,setSelected]=useState(0),active=datasets[selected]??datasets[0],items=active?.items??[],rawTotal=items.reduce((sum,item)=>sum+item.count,0),chartTotal=rawTotal||1;
 if(!active)return null;
 let cursor=0;const gradient=items.length?items.map((item,index)=>{const start=cursor;cursor+=item.count/chartTotal*100;return `${colors[index%colors.length]} ${start}% ${cursor}%`;}).join(","):"#e5e7eb 0% 100%";
 return <section className="statistics-explorer"><h2>Türkiye kataloğunu keşfet</h2><p>Butonlardan bir görünüm seç; sonuçlar 2026 YÖK katalog ve yerleşen verilerinden hesaplanır.</p><div className="statistics-selector">{datasets.map((dataset,index)=><button type="button" className={selected===index?"active":""} aria-pressed={selected===index} onClick={()=>setSelected(index)} key={dataset.label}>{dataset.label}</button>)}</div><div className="donut-card"><div className="donut-chart" style={{background:`conic-gradient(${gradient})`}} aria-label={`${active.label} daire grafiği`}><span>{rawTotal.toLocaleString("tr-TR")}</span></div><div><h3>{active.label}</h3><p>{active.description}</p>{items.length?<ol className="donut-legend">{items.map((item,index)=><li key={item.label}><i style={{background:colors[index%colors.length]}}/><span>{item.label}</span><strong>{item.count.toLocaleString("tr-TR")}</strong></li>)}</ol>:<p role="status">Bu istatistik backend güncellemesi tamamlandığında gösterilecek.</p>}</div></div></section>;
}
