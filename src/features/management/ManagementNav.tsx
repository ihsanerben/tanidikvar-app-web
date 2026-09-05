import { NavLink } from 'react-router-dom'
export function ManagementNav(){return <nav className="catalog-tabs management-nav" aria-label="Manager bölümleri">
 <NavLink end to="/manager">Genel bakış</NavLink><NavLink to="/manager/users">Kullanıcılar</NavLink><NavLink to="/manager/content">İçerik moderasyonu</NavLink><NavLink to="/manager/applications">Admin başvuruları</NavLink><NavLink to="/manager/catalog">Katalog</NavLink>
</nav>}
