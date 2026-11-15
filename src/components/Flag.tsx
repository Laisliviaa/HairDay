import { ui } from '../styles'
import type { Lang } from '../i18n'

// bandeiras desenhadas em SVG (o emoji de bandeira não aparece no Windows)
export function Flag({ lang }: { lang: Lang }) {
  return (
    <svg className={ui.flag} viewBox="0 0 24 16" width="24" height="16" aria-hidden="true">
      {lang === 'pt' && (<><rect width="24" height="16" fill="#009b3a" /><path d="M12 2.5 21 8l-9 5.5L3 8z" fill="#ffdf00" /><circle cx="12" cy="8" r="3.2" fill="#002776" /></>)}
      {lang === 'en' && (<><rect width="24" height="16" fill="#b22234" /><path d="M0 3.4h24M0 7.4h24M0 11.4h24" stroke="#fff" strokeWidth="1.6" /><rect width="10" height="8.6" fill="#3c3b6e" /></>)}
      {lang === 'es' && (<><rect width="24" height="16" fill="#aa151b" /><rect y="4" width="24" height="8" fill="#f1bf00" /></>)}
    </svg>
  )
}
