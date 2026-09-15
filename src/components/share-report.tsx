"use client";
import {Button} from "@/components/ui";
export function ShareReport({title}:{title:string}){async function share(){const data={title,text:`${title} · TanıdıkVar katkı karnesi`,url:location.href};if(navigator.share)await navigator.share(data);else await navigator.clipboard.writeText(location.href);}return <Button tone="secondary" type="button" onClick={()=>void share()}>Karneyi paylaş</Button>}
