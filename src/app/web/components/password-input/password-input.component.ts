import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import icVisibility from '@iconify/icons-ic/twotone-visibility';
import icVisibilityOff from '@iconify/icons-ic/twotone-visibility-off';


@Component({
  selector: 'app-password-input',
  templateUrl: './password-input.component.html',
  styleUrls: ['./password-input.component.css']
})
export class PasswordInputComponent {
  @Input() message = '';
  @Input() placeHolder = '';
  @Input() passChecks: any[] = [];
  @Input() control: FormControl;
  @Output() allValidChecks = new EventEmitter<boolean>();
  @Output() hasSub = new EventEmitter<boolean>();
  @Output() loseFocus = new EventEmitter<boolean>();

  visible = false;
  inputType = 'password';
  allChecksValid = false;
  icVisibility = icVisibility;
  icVisibilityOff = icVisibilityOff;

  regexLength = new RegExp('^(?=.{8,})'); // regex para validar que la contraseña tenga al menos 8 caracteres
  regexUpperCase = new RegExp('^(?=.*[A-Z])'); // regex para validar que la contraseña tenga al menos una mayúscula
  regexLowerCase = new RegExp('^(?=.*[a-z])'); // regex para validar que la contraseña tenga al menos una minúscula
  regexNumber = new RegExp('^(?=.*[0-9])'); // regex para validar que la contraseña tenga al menos un número
  regexRepetitive = RegExp(/^(?!.*([a-zA-Z])\1{2}).*$/,'i');
  // regex para validar que no se permiten caracteres repetitivos (ej: bbb, Aaa)
  regexSequ = RegExp(/^(?!.*(?:abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|zyx|yxw|xwv|wvu|vut|uts|tsr|srq|rqp|qpo|pon|onm|nml|mlk|lkj|kji|jih|ihg|hgf|gfe|fed|edc|dcb|cba|012|123|234|345|456|567|678|789|890|987|876|765|654|543|432|321)).*$/,'i');
  // regex para validar que no tenga caracteres secuenciales (ej: abc, 123, 321 o cba)
  regexSymbol = /^(?=.*[\p{Z}\p{S}\p{P}])/u; // regex para validar que la contraseña tenga al menos un símbolo

  constructor( private cd: ChangeDetectorRef){}

  toggleVisibility() {
    this.inputType = this.visible ? 'password' : 'text';
    this.visible = !this.visible;
    this.cd.markForCheck();
  }


  validatePassword(event){
    this.hasSub.emit(false);
    const value = (event.target as HTMLInputElement).value;

    if (this.passChecks.length > 0) {
      this.passChecks[0].isValid = this.regexLength.test(value);
      this.passChecks[1].isValid = (this.regexLowerCase.test(value) && this.regexUpperCase.test(value));
      this.passChecks[2].isValid = this.regexNumber.test(value);
      this.passChecks[3].isValid = this.regexSymbol.test(value);
      this.allChecksValid = this.passChecks.every(check => check.isValid);
      this.allValidChecks.emit(this.allChecksValid);
    }
  }
}
