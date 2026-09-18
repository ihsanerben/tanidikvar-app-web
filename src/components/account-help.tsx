"use client";
import {useState} from "react";
import {ModalShell} from "@/components/modal-shell";

export function AccountHelp(){const[open,setOpen]=useState(false);return <><button className="account-help-button" type="button" onClick={()=>setOpen(true)} aria-label="Hesap sayfası hakkında bilgi">?</button><ModalShell open={open} onClose={()=>setOpen(false)} title="Hesap alanı" className="page-help-dialog"><p>Bu alanda profilini, içeriklerini, takiplerini, kayıtlarını, bildirimlerini, rozetlerini ve Tanıdık başvurunu yönetebilirsin.</p><button className="button" type="button" onClick={()=>setOpen(false)}>Anladım</button></ModalShell></>}
