export const targetLabels:Record<string,string>={USER:'Kullanıcı',ADMIN_APPLICATION:'Tanıdık başvurusu',QUESTION:'Soru',COMMUNITY:'Topluluk yorumu',TANIDIK:'Tanıdık yorumu',UNIVERSITY:'Üniversite',DEPARTMENT:'Bölüm',TAG:'Tag'}

export function targetLink(type:string,id:string):string|null {
 const encoded=encodeURIComponent(id)
 if(type==='USER')return '/manager/users/'+encoded
 if(type==='ADMIN_APPLICATION')return '/manager/applications/'+encoded
 if(type==='QUESTION')return '/manager/questions/'+encoded
 return null
}
