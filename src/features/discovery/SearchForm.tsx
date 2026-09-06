import { type ReactNode } from 'react'
export function SearchForm({value,onSearch,label='Soru ara',filterButton}:{value:string;onSearch:(q:string)=>void;label?:string;filterButton?:ReactNode}) {
 return <form role="search" className="discovery-search" onSubmit={e=>{e.preventDefault();onSearch(String(new FormData(e.currentTarget).get('q')??'').trim())}}>
 <div><input key={value} aria-label={label} name="q" type="search" maxLength={100} defaultValue={value}/>{filterButton}<button className="button" type="submit">Ara</button></div></form>
}
