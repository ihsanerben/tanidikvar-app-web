import { pilotMode } from '../config/pilot'
export function PilotNotice(){
 if(!pilotMode)return null
 return <aside className="pilot-notice" aria-label="Pilot sürüm bilgisi"><strong>Pilot sürüm</strong><span>Fotoğraf ve belge yükleme kapalıdır. İlk açılış biraz sürebilir. Sorunları seni davet eden kişiye sayfa ve işlem adımlarıyla ilet.</span><a href="/about#nasil-calisir">Kullanım bilgileri</a></aside>
}
