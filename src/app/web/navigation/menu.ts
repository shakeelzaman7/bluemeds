import { NavigationItem } from "src/app/@vex/interfaces/navigation-item.interface"
import icInfo from "@iconify/icons-ic/info"
import icHelp from "@iconify/icons-ic/help"
import icHealth from "@iconify/icons-ic/baseline-health-and-safety"

export const webMenu : NavigationItem[] = [
  {
    type: 'link',
    route: '/web/welcome',
    label: 'Mi cuenta',
    icon: icHealth,
    isLogged: true,
    isHeaderNav: true,
    routerLinkActiveOptions: { exact: true }
  },
  {
    type: 'link',
    route: '/web/list',
    label: 'Mi lista de medicamentos',
    icon: icInfo,
    isLogged: true,
    isHeaderNav: true,
    routerLinkActiveOptions: { exact: true }
  },
  {
    type: 'anchor',
    label: '¿Qué es Bluemeds?',
    href: '/web/home#benefits',
    icon: icInfo,
    isLogged: false,
    isHeaderNav: false,
    routerLinkActiveOptions: { exact: true }
  },
  {
    type: 'anchor',
    label: '¿Cómo me suscribo?',
    href: '/web/home#how',
    icon: icInfo,
    isLogged: false,
    isHeaderNav: false,
    routerLinkActiveOptions: { exact: true }
  },
  {
    type: 'anchor',
    href: '/web/home#benefits',
    label: 'Beneficios',
    icon: icHealth,
    isLogged: false,
    isHeaderNav: false,
    routerLinkActiveOptions: { exact: true }
  },
  {
    type: 'anchor',
    href: '/web/home#experiency',
    label: 'Experiencia Bluemeds',
    icon: icHealth,
    isLogged: false,
    isHeaderNav: false,
    routerLinkActiveOptions: { exact: true }
  },
  {
    type: 'anchor',
    label: 'Preguntas frecuentes',
    href: '/web/home#faq',
    icon: icHelp,
    isLogged: false,
    isHeaderNav: false,
    routerLinkActiveOptions: { exact: true }
  },
]
