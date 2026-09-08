import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const titles:Record<string,string>={'/':'Sorular','/questions':'Sorular','/popular':'Popülerler','/admins':'Adminler','/login':'Giriş','/register':'Kayıt','/verify-email':'E-posta doğrulama','/resend-verification':'Doğrulama bağlantısı','/forgot-password':'Şifremi unuttum','/reset-password':'Şifre sıfırlama','/questions/new':'Soru sor','/my-questions':'Sorularım','/my-answers':'Topluluk yorumlarım','/profile':'Profilim','/account':'Hesabım','/account/status':'Hesap durumu','/applications':'Başvurularım','/admin':'Admin yorumlarım','/about':'Hakkımızda','/durum':'Sistem durumu','/manager':'Yönetim özeti','/manager/analytics':'Grafikler','/manager/applications':'Admin başvuruları','/manager/users':'Kullanıcılar','/manager/content':'Sorular ve yorumlar','/manager/catalog':'Üniversiteler ve bölümler','/manager/tags':'Tagler','/manager/actions':'İşlem geçmişi','/manager/account':'Yönetim hesabım'}
function title(path:string){
 if(titles[path])return titles[path]
 if(/^\/manager\/users\/[^/]+\/applications$/.test(path))return 'Kullanıcının başvuru geçmişi'
 if(/^\/manager\/applications\/[^/]+$/.test(path))return 'Başvuru incelemesi'
 if(/^\/manager\/users\/[^/]+$/.test(path))return 'Kullanıcı detayı'
 if(/^\/manager\/questions\/[^/]+$/.test(path))return 'Soru ve yorum incelemesi'
 if(/^\/manager\/actions\/[^/]+$/.test(path))return 'İşlem detayı'
 if(/^\/(admins|profiles)\/[^/]+$/.test(path))return 'Kullanıcı profili'
 if(/^\/questions\/[^/]+\/edit$/.test(path))return 'Soru düzenleme'
 if(/^\/questions\/[^/]+$/.test(path))return 'Soru detayı'
 return 'Sayfa bulunamadı'
}
export function PageAnnouncement(){
 const {pathname}=useLocation(),name=title(pathname)
 useEffect(()=>{document.title=name+' · TanıdıkVar'},[name])
 return <span className="sr-only" role="status" aria-live="polite" key={pathname}>{name}</span>
}
