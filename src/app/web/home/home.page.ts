import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import icFlag from '@iconify/icons-ic/twotone-flag';
import icAttachMoney from '@iconify/icons-ic/twotone-attach-money';
import icContactSupport from '@iconify/icons-ic/twotone-contact-support';
import icBook from '@iconify/icons-ic/twotone-book';
import { stagger40ms } from 'src/app/@vex/animations/stagger.animation';
import { fadeInUp400ms } from 'src/app/@vex/animations/fade-in-up.animation';
import { LayoutService } from 'src/app/@vex/services/layout.service';
import { ApiService } from 'src/app/core/api/api.service';
import { Publication } from '../../models/publication';
import { PublicationModalComponent } from '../components/publication-modal/publication-modal.component';
import { IonSlides, ModalController } from '@ionic/angular';
import { snakeToCamel } from '../../core/helpers/string-helper';
import { AuthService } from 'src/app/core/auth/auth.service';
import { ListService } from '../services/list/list.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  animations: [
    stagger40ms,
    fadeInUp400ms
  ]
})
export class HomePage implements OnInit {
  @ViewChild('slidesVideo') slides: IonSlides;

  testimonialVideos: { src: SafeResourceUrl, id: string }[] = [];

  links = [
    { label: 'Getting Started', route: 'getting-started', icon: icFlag },
    { label: 'Pricing & Plans', route: 'pricing', icon: icAttachMoney },
    { label: 'FAQ', route: 'faq', icon: icContactSupport },
    { label: 'Guides', route: 'guides', icon: icBook }
  ];

  slider_images: any[] = [
    {
      image: '/assets/bluemeds/NEW-CARRUSEL-BLUEMEDS_1D.png',
      responsiveImage: '/assets/bluemeds/NEW-CARRUSEL-BLUEMEDS_1M.png',
      show: true,
      position: 1,
      fadeout: false,
      goToWithoutLogin: '/web/search',
      goToWithLogin: '/web/search'
    },
    {
      image: '/assets/bluemeds/NEW-CARRUSEL-BLUEMEDS_2D.png',
      responsiveImage: '/assets/bluemeds/NEW-CARRUSEL-BLUEMEDS_2M.png',
      show: false,
      position: 2,
      fadeout: false,
      goToWithoutLogin: '/web/search',
      goToWithLogin: '/web/search'
    },
    {
      image: '/assets/bluemeds/NEW-CARRUSEL-BLUEMEDS_3D.png',
      responsiveImage: '/assets/bluemeds/NEW-CARRUSEL-BLUEMEDS_3M.png',
      show: false,
      position: 3,
      fadeout: false,
      goToWithoutLogin: '/web/register',
      goToWithLogin: '/web/search'
    }
  ];
  positionImg = 0;
  timerToChange = null;

  showMedsCarousel = true;
  medsToShowCarousel = { data: [] };
  carousel = null;
  fistCardWidth = 0;
  isDragging = false;
  faqTitleSelected = '';
  starX = 0;
  startScrollLeft = 0;
  isAuthenticated: boolean;

  benefitItems = [
    {
      label: `Ahorro inmediato de <br> hasta 33%`,
      iconName: "savings-bluemeds"
    },
    {
      label: `Entregas automáticas <br> todos los meses`,
      iconName: "shipping-bluemeds"
    },
    {
      label: `Sin costo de <br> suscripción`,
      iconName: "subscrip-no-cost-bluemeds"
    },
    {
      label: `Te ayudamos a gestionar <br> con tu aseguradora <br> los medicamentos`,
      iconName: "secure-bluemeds"
    },
    {
      label: `Te ayudamos a hacer el <br> canje de tus <br> medicamentos`,
      iconName: "trade-bluemeds"
    },
  ];

  benefitMobileItems = [
    {
      label: `Ahorro inmediato <br> de hasta 33%`,
      iconName: "savings-bluemeds"
    },
    {
      label: `Entregas automáticas todos los meses`,
      iconName: "shipping-bluemeds"
    },
    {
      label: `Sin costo de <br> suscripción`,
      iconName: "subscrip-no-cost-bluemeds"
    },
    {
      label: `Te ayudamos a gestionar con tu aseguradora los medicamentos`,
      iconName: "secure-bluemeds"
    },
    {
      label: `Te ayudamos a hacer <br> el canje de tus medicamentos`,
      iconName: "trade-bluemeds"
    },
  ];

  howItWorksItems = [
    {
      label: "Busca tus medicamentos en Bluemeds",
      iconName: "lens-bluemeds"
    },
    {
      label: "Elige todos los medicamentos que tomas con recurrencia y agrégalos a tu lista",
      iconName: "white-meds-bluemeds"
    },
    {
      label: "Escoge el día en el que quieres recibir tus medicamentos de forma mensual",
      iconName: "calendar-bluemeds"
    },
    {
      label: "Agrega tus datos personales, de entrega y de pago",
      iconName: "white-mobile-app-bluemeds",
    }
  ]

  faqs = [
    {
      question: "¿Qué es Bluemeds?",
      answer: "Bluemeds es un programa de suscripción diseñado para simplificar la compra mensual de medicamentos, para aquellos que los necesitan diariamente. Nos aseguramos de que nunca te falten a la hora de tomarlos entregándotelos todos los meses.",
      selected: false,
    },
    {
      question: "¿Qué beneficios tiene Bluemeds?",
      answer: "Con Bluemeds, tendrás la tranquilidad de recibir tus medicamentos sin tener que pedirlos. Nuestro programa es completamente gratuito al igual que el costo de envío. Aparte de esto, todos los medicamentos tienen un 5% de descuento, y si el medicamento tiene un plan de salud (canje), te damos un beneficio inmediato ahorrándote hasta un 33%. Si tienes seguro médico, te ayudamos a hacer la gestión con tu aseguradora.",
      selected: false,
    },
    {
      question: "¿Quién usa Bluemeds?",
      answer: "Bluemeds es un programa para personas con enfermedades crónicas o que toman múltiples medicamentos al día.",
      selected: false,
    },
    {
      question: "¿Cuánto cuesta la suscripción en Bluemeds?",
      answer: "La suscripción es completamente gratuita, tú solo pagas por los medicamentos.",
      selected: false,
    },
    {
      question: "¿Cuál es el tiempo mínimo al suscribirme?",
      answer: "Bluemeds tiene un mínimo de suscripción de 3 meses.",
      selected: false,
    },
    {
      question: "¿Qué pasa cuando me suscribo?",
      answer: "Cuando te suscribes, agrega los medicamentos que tomas con recurrencia a tu lista Bluemeds. Te pedimos que elijas tu día de entrega mensual, tu dirección y método de pago. A partir de eso, te enviaremos tus medicamentos de forma recurrente todos los meses en el día indicado.",
      selected: false,
    },
    {
      question: "¿Cómo funciona la entrega recurrente?",
      answer: "En Bluemeds ofrecemos entregas recurrentes. Esto significa que te llevaremos tus medicamentos a la dirección de entrega, todos los meses en el día que elijas.",
      selected: false,
    },
    {
      question: "¿Cómo me suscribo?",
      answer: "Crea una cuenta, agrega tus medicamentos, detalles de entrega y método de pago ¡y listo!.",
      selected: false,
    },
    {
      question: "¿Qué día me cobran los medicamentos?",
      answer: "Te cobraremos automáticamente entre 1 a 3 días antes de tu fecha de entrega. Esto para que podamos entregarte sin problema.",
      selected: false,
    },
    {
      question: "¿Cómo me notifican de mis entregas?",
      answer: "Recibirás un recordatorio por WhatsApp y correo electrónico días antes de tu entrega.",
      selected: false,
    },
    {
      question: "¿Qué significa cuando mi cuenta está cancelada?",
      answer: "Significa que tu cuenta estará desactivada en nuestro sistema y deberás suscribirte de nuevo para recibir tus medicamentos mensualmente.",
      selected: false,
    },
    {
      question: "¿Cómo se manejan las devoluciones y reembolsos?",
      answer: "Si llegaras a tener algún inconveniente con tu cobro o medicamentos, llama al 1750 opción 5, o escríbenos por Whatsapp al 24272000 y con gusto te solucionaremos de acuerdo a nuestra política de devoluciones.",
      selected: false,
    },
    {
      question: "¿Puedo cambiar la fecha de entrega?",
      answer: 'Sí, puedes modificar tu día de entrega desde tu cuenta en la plataforma de Bluemeds ingresando a "Mi lista Bluemeds".',
      selected: false,
    },
    {
      question: "¿Puedo modificar los medicamentos de mi lista?",
      answer: 'Sí, puedes agregar o eliminar medicamentos desde "Mi cuenta" en la plataforma de Bluemeds.',
      selected: false,
    },
    {
      question: "¿Puedo agregar a mi lista Bluemeds un medicamento que no es recurrente?",
      answer: 'Sí, al seleccionar un medicamento nuevo, define su duración como "1 mes” y escoge el día de entrega para ese medicamento.',
      selected: false,
    },
    {
      question: "¿Cuánto cobran por el envío?",
      answer: "El envío siempre es gratuito, tú solo pagas por los medicamentos.",
      selected: false,
    },
    {
      question: "¿Con qué aseguradoras/corredores trabajan?",
      answer: "Trabajamos con las principales aseguradoras del país, incluyendo Mediprocesos, Panamerican Life, Aseguradora General, Mapfre, BAM, BUPA, y muchas más.",
      selected: false,
    },
    {
      question: "¿Cuál es el método de pago?",
      answer: "Cobramos tus medicamentos suscritos todos los meses a tu tarjeta de crédito o débito. Esta tiene que estar activa para asegurarnos que podamos realizar el cobro y entregarte sin inconvenientes.",
      selected: false,
    },
    {
      question: "¿Qué pasa si mi medicamento requiere receta médica?",
      answer: "Adjunta tu receta médica con la recurrencia a tu cuenta en línea de Bluemeds o envíanosla por WhatsApp, nosotros nos encargamos del resto. Si necesitas renovar tu receta, te agendaremos una cita con un médico de Blue Medical.",
      selected: false,
    },
    {
      question: "¿Hacen entregas fuera de la ciudad?",
      answer: "Sí, hacemos entregas en todo el país.",
      selected: false,
    },
    {
      question: "¿Qué es Vivolife?",
      answer: "Es nuestro programa de descuentos en salud y bienestar personal que te ofrece hasta un 80% de descuento en servicios médicos de Blue Medical y otras instituciones médicas del país.",
      selected: false,
    }
  ]

  constructor(
    public layoutService: LayoutService,
    private api: ApiService,
    private modalCtrl: ModalController,
    protected authService: AuthService,
    private listService: ListService,
    private router: Router,
    private sanitizer: DomSanitizer
  ) {
    try {
      this.testimonialVideos = [
        {
          src: this.sanitizer.bypassSecurityTrustResourceUrl('https://player.vimeo.com/video/911011837?badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479%22'),
          id: 'iframe-video-1'
        },
        {
          src: this.sanitizer.bypassSecurityTrustResourceUrl('https://player.vimeo.com/video/919222167?badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479'),
          id: 'iframe-video-2'
        },
        {
          src: this.sanitizer.bypassSecurityTrustResourceUrl('https://player.vimeo.com/video/869359733?autoplay=0&loop=0&muted=0&autopause=0&title=0&byline=0&controls=1&portrait=0&color=1c9ad6'),
          id: 'iframe-video-3'
        }
      ];
    } catch (error) {
      console.error('Error initializing testimonial videos:', error);
    }
  }

  async ngOnInit() {
    try {
      this.isAuthenticated = await this.authService.hasToken();

      const urlParams = new URLSearchParams(window.location.search);
      const showMeds = urlParams.get('show_meds');
      this.showMedsCarousel = showMeds !== 'false';

      try {
        this.medsToShowCarousel = await this.api.get('publications/favourites').toPromise<any>();
      } catch (error) {
        console.error('Error fetching carousel medications:', error);
      }

      setTimeout(() => {
        try {
          this.carousel = document.querySelector('.carousel');
          if (this.carousel) {
            this.fistCardWidth = this.carousel.querySelector('.card-meds')?.offsetWidth || 0;
          }
        } catch (error) {
          console.error('Error initializing carousel:', error);
        }
      }, 1500);

      this.timerToChange = setInterval(this.nextImage, 3000);
    } catch (error) {
      console.error('Error in ngOnInit:', error);
    }
  }

  async publicationSelected(publication: Publication) {
    try {
      if (await this.authService.isAuthenticated()) {
        await this.listService.getlist();
      }

      for (const key in publication.product) {
        if (Object.prototype.hasOwnProperty.call(publication.product, key)) {
          const element = publication.product[key];
          const newKey = snakeToCamel(key);
          publication.product[newKey] = element;
        }
      }

      for (const key in publication) {
        if (Object.prototype.hasOwnProperty.call(publication, key) && key !== 'product') {
          const element = publication[key];
          const newKey = snakeToCamel(key);
          publication[newKey] = element;
        }
      }

      await this.openPublicationModal(publication);
    } catch (error) {
      console.error('Error in publicationSelected:', error);
    }
  }

  async openPublicationModal(publication: Publication) {
    try {
      const modal = await this.modalCtrl.create({
        component: PublicationModalComponent,
        componentProps: { publication },
        cssClass: this.layoutService.isMobile() ? '' : 'publication-modal'
      });
      await modal.present();
      await modal.onWillDismiss();
    } catch (error) {
      console.error('Error opening publication modal:', error);
    }
  }

  nextImage = () => {
    try {
      this.slider_images[this.positionImg].fadeout = true;
      this.slider_images[this.positionImg].show = false;

      this.positionImg = (this.positionImg + 1) % this.slider_images.length;
      this.slider_images[this.positionImg].show = true;

      clearInterval(this.timerToChange);
      this.timerToChange = setInterval(this.nextImage, 5000);
    } catch (error) {
      console.error('Error in nextImage:', error);
    }
  };

  prevImage() {
    try {
      this.slider_images[this.positionImg].show = false;
      this.positionImg = (this.positionImg - 1 + this.slider_images.length) % this.slider_images.length;
      this.slider_images[this.positionImg].show = true;

      clearInterval(this.timerToChange);
      this.timerToChange = setInterval(this.nextImage, 5000);
    } catch (error) {
      console.error('Error in prevImage:', error);
    }
  }

  nextPrevImageButton(direction: string) {
    try {
      this.carousel.scrollLeft += direction === 'prev' ? -this.fistCardWidth : this.fistCardWidth;
    } catch (error) {
      console.error('Error in nextPrevImageButton:', error);
    }
  }

  dragStart = (event) => {
    try {
      this.isDragging = true;
      this.carousel?.classList.add('dragging');
      this.starX = event.pageX;
      this.startScrollLeft = this.carousel?.scrollLeft || 0;
    } catch (error) {
      console.error('Error in dragStart:', error);
    }
  };

  dragging = (event) => {
    try {
      if (!this.isDragging) return;
      this.carousel.scrollLeft = this.startScrollLeft - (event.pageX - this.starX);
    } catch (error) {
      console.error('Error in dragging:', error);
    }
  };

  dragStop = () => {
    try {
      this.isDragging = false;
      this.carousel?.classList.remove('dragging');
    } catch (error) {
      console.error('Error in dragStop:', error);
    }
  };

  showImageDefault(id_med) {
    try {
      const imageDefault = document.getElementById('med-img-carousel' + id_med);
      imageDefault?.setAttribute('src', '/assets/bluemeds/placeholder.png');
    } catch (error) {
      console.error('Error in showImageDefault:', error);
    }
  }

  nextPrevVideoSlide(direction: string) {
    try {
      const iframes = document.querySelectorAll('.pause-testimonial-video');
      iframes.forEach((iframe: HTMLIFrameElement) => {
        iframe.setAttribute('src', iframe.getAttribute('src'));
      });

      if (direction === 'next') this.slides.slideNext();
      else this.slides.slidePrev();
    } catch (error) {
      console.error('Error in nextPrevVideoSlide:', error);
    }
  }

  redirectTo(route: string): void {
    try {
      this.router.navigate([route]);
    } catch (error) {
      console.error('Error in redirectTo:', error);
    }
  }

  select(faq) {
    try {
      this.faqs.forEach(f => f.selected = false);
      if (this.faqTitleSelected !== faq.question) {
        faq.selected = true;
        this.faqTitleSelected = faq.question;
      } else {
        this.faqTitleSelected = '';
      }
    } catch (error) {
      console.error('Error in select:', error);
    }
  }

  openWindowsWhatsApp() {
    try {
      window.open('https://api.whatsapp.com/send/?phone=50224272000&text&type=phone_number&app_absent=0', '_blank');
    } catch (error) {
      console.error('Error in openWindowsWhatsApp:', error);
    }
  }
}
