function adminStarCount(educationStatus?:string|null){return educationStatus==='YKS_ADAYI'?1:educationStatus==='UNIVERSITE_OGRENCISI'?2:3}
export function AdminStars({educationStatus}:{educationStatus?:string|null}){return <>{Array.from({length:adminStarCount(educationStatus)},(_,index)=><span key={index}>★</span>)}</>}
export function ProfileAvatar({name,className='profile-photo',isAdmin=false,decorated=true,educationStatus}:{fileId?:string|null;name:string;className?:string;isAdmin?:boolean;decorated?:boolean;educationStatus?:string|null}){
 const roleClass=educationStatus?` avatar-role-${educationStatus.toLowerCase()}`:''
 const avatar=<span className={`${className} avatar-fallback${roleClass}`} aria-label="Profil baş harfleri">{name.trim().split(/\s+/).map(part=>part[0]).slice(0,2).join('').toLocaleUpperCase('tr')||'?'}</span>
 return decorated&&isAdmin?<span className="profile-avatar-motif">{avatar}<span aria-hidden="true"><AdminStars educationStatus={educationStatus}/></span></span>:avatar
}
export function OwnProfileAvatar({name,isAdmin=false,decorated=true,educationStatus}:{name:string;isAdmin?:boolean;decorated?:boolean;educationStatus?:string|null}){
 return <ProfileAvatar name={name} isAdmin={isAdmin} decorated={decorated} educationStatus={educationStatus}/>
}
