import { Component, ElementRef, QueryList, ViewChildren, AfterViewInit } from '@angular/core';
import { ApiService } from 'src/app/core/api/api.service';
import { ModalController } from '@ionic/angular';
import { environment } from 'src/environments/environment';


@Component({
  selector: 'app-account-verification',
  templateUrl: './account-verification.component.html',
  styleUrls: ['./account-verification.component.scss'],
})

export class AccountVerificationComponent {
  @ViewChildren('digit1, digit2, digit3, digit4') inputElements!: QueryList<ElementRef>;

  verificationCode: string[] = ['', '', '', ''];
  timeRemaining: number = environment.timeRemaining;
  timer: any;
  disabledButtons = false;
  deliveryId: number;
  showErrorMessage = false;
  errorMessage: string;

  constructor(
    private apiService: ApiService,
    private modalController: ModalController
  ) {}

  ngOnInit() {
    this.sendApiCode();
    this.startTimer();
  }

  ngAfterViewInit() {
    // Enfocar automáticamente el primer input
    this.inputElements.first?.nativeElement.focus();
  }

  startTimer() {
    this.timer = setInterval(() => {
      if (this.timeRemaining > 0) {
        this.timeRemaining--;
      } else {
        clearInterval(this.timer);
      }
    }, 1000);
  }

  get formattedTime(): string {
    const minutes = Math.floor(this.timeRemaining / 60);
    const seconds = this.timeRemaining % 60;
    return `${this.padNumber(minutes)}:${this.padNumber(seconds)}`;
  }

  padNumber(num: number): string {
    return num < 10 ? `0${num}` : `${num}`;
  }

  onInput(event: Event, index: number) {
    const input = event.target as HTMLInputElement;
    const value = input.value;

    if (/^\d$/.test(value)) {
      this.verificationCode[index] = value;
      if (index < 3) {
        this.inputElements.toArray()[index + 1]?.nativeElement.focus();
      }
    } else {
      input.value = ''; // Limpia el input si no es un dígito válido
    }

    this.showErrorMessage = false;
  }

  onKeyDown(event: KeyboardEvent, index: number) {
    const input = event.target as HTMLInputElement;
    if (event.key === 'Backspace') {
      this.verificationCode[index] = '';
      if (index > 0 && input.value === '') {
        this.inputElements.toArray()[index - 1]?.nativeElement.focus();
      }
    }
  }

  isCodeValid() {
    return this.verificationCode.every((digit) => /^\d$/.test(digit) && digit !== '');
  }  

  async save() {
    try {
      const code = this.verificationCode.join('');

      const response = await this.apiService.post('profile/verify-account', {
        code: code,
      });
  
      if (response.success) {
        this.modalController.dismiss('success');
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      this.showErrorMessage = true;
      this.errorMessage = "El código ingresado no es válido. Por favor, verifica el mensaje de WhatsApp y vuelve a intentarlo.";
    }
  }

  close() {
    this.modalController.dismiss('cancel');
  }

  resendCode() {
    this.sendApiCode();
    this.timeRemaining = 180; // Reinicia el temporizador
    this.startTimer();
  }

  // solicitar codigo de nuevo
  async sendApiCode() {
    await this.apiService.post('profile/send-account-verification-code', {});
  }

  ngOnDestroy() {
    clearInterval(this.timer);
  }
}
