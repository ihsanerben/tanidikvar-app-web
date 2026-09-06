import type { Tone } from './notifications'
export function actionTone(label:string):Tone|undefined{
 const text=label.toLocaleLowerCase('tr-TR')
 if(/vazgeç|çıkış|\bsil\b|kaldır|gizle|pasifleştir|arşivle|reddet/.test(text))return 'danger'
 if(/güncelle|düzenle/.test(text))return 'warning'
 if(/kaydet|onayla/.test(text))return 'info'
 if(/ekle|yayınla|geri yükle|aktifleştir|kabul et/.test(text))return 'success'
}
