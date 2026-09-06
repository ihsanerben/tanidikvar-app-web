import { useEffect,useRef,useState,type ReactNode } from 'react'
import { notify,type Tone } from './notifications'
import { actionTone } from './actionTone'
export function NotificationProvider({children}:{children:ReactNode}){
 const [items,setItems]=useState<{id:number;message:string;tone:Tone}[]>([]),sequence=useRef(0)
 useEffect(()=>{const timers=new Set<ReturnType<typeof setTimeout>>()
  function receive(event:Event){const detail=(event as CustomEvent<{message:string;tone:Tone}>).detail,id=++sequence.current;setItems(v=>[...v.slice(-3),{...detail,id}]);const timer=setTimeout(()=>{setItems(v=>v.filter(n=>n.id!==id));timers.delete(timer)},4200);timers.add(timer)}
  function cancel(event:MouseEvent){const target=event.target instanceof Element?event.target.closest('button,a'):null;if(target?.textContent?.trim()==='Vazgeç'&&!target.hasAttribute('disabled'))notify('İşlem iptal edildi.','danger')}
  function colors(){document.querySelectorAll<HTMLButtonElement>('button').forEach(button=>{const tone=actionTone(button.textContent??'');if(tone)button.dataset.actionTone=tone;else delete button.dataset.actionTone})}
  const observer=new MutationObserver(colors);observer.observe(document.body,{childList:true,subtree:true,characterData:true});colors()
  window.addEventListener('app:notification',receive);document.addEventListener('click',cancel)
  return()=>{observer.disconnect();window.removeEventListener('app:notification',receive);document.removeEventListener('click',cancel);timers.forEach(clearTimeout)}
 },[])
 return <>{children}<div className="notification-stack" aria-live="polite" aria-atomic="false">{items.map(item=><div role="status" className={'notification notification-'+item.tone} key={item.id}>{item.message}</div>)}</div></>
}
