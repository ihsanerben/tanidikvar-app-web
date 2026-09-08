import { Component,type ReactNode } from 'react'

export class AppBoundary extends Component<{children:ReactNode},{failed:boolean}> {
  state={failed:false}
  static getDerivedStateFromError(){return {failed:true}}
  render(){
    if(this.state.failed)return <main className="status-page"><h1>Bu ekranı açarken bir sorun oluştu.</h1><p>Sayfayı yeniden yükleyerek tekrar deneyebilirsin. Kaydetmediğin alanları yeniden doldurman gerekebilir.</p><button className="button" onClick={()=>window.location.reload()}>Sayfayı yeniden yükle</button><a className="button button-secondary" href="/">Ana sayfaya dön</a></main>
    return this.props.children
  }
}
