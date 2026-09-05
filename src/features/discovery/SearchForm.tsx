import { useId } from 'react'
export function SearchForm({value,onSearch,label='Soru, üniversite, bölüm veya tag ara'}:{value:string;onSearch:(q:string)=>void;label?:string}) {
 const id=useId()
 return <form role="search" className="discovery-search" onSubmit={e=>{e.preventDefault();onSearch(String(new FormData(e.currentTarget).get('q')??'').trim())}}>
 <label htmlFor={id}>{label}</label><div><input key={value} id={id} name="q" type="search" maxLength={100} defaultValue={value}/><button className="button" type="submit">Ara</button></div></form>
}
