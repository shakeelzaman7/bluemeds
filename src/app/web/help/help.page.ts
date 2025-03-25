import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-help',
  templateUrl: './help.page.html',
  styleUrls: ['./help.page.scss'],
})
export class HelpPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  faqs = [
    {
      iconName: "flag",
      question: "¿Cómo comenzar?",
      answer: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam placerat.",
      selected: false,
    },
    {
      iconName: "meds",
      question: "Medicamentos y entregas",
      answer: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam placerat.",
      selected: false,
    },
    {
      iconName: "health-sheet",
      question: "Pagos y seguros",
      answer: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam placerat.",
      selected: false,
    },
    {
      iconName: "delivery",
      question: "Programación y Envío",
      answer: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam placerat.",
      selected: false,
    },
    {
      iconName: "sec",
      question: "Seguridad y Privacidad",
      answer: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam placerat.",
      selected: false,
    },
  ]

  footerItems = [
    {
      iconName: "phone",
      text: "",
      label: "Hablá con nosotros"
    },
    {
      iconName: "whatsapp",
      text: "",
      label: "Escríbenos"
    },
    {
      iconName: "globe",
      text: "",
      label: "Visita nuestro sitio web"
    }
  ]

  select(faq) {
    this.faqs.forEach(f => f.selected = false);
    faq.selected = true;
  }
}
