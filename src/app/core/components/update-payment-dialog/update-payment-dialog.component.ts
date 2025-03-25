import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import icClose from '@iconify/icons-ic/twotone-close';
import {FormBuilder, AbstractControl, ValidationErrors, ValidatorFn, Validators} from '@angular/forms';


@Component({
  selector: 'app-confirmation-dialog',
  templateUrl: './update-payment-dialog.component.html',
  styleUrls: ['./update-payment-dialog.component.scss'],
})
export class UpdatePaymentDialogComponent implements OnInit {
  icClose = icClose;

  cardNumber: string = '';
  cardMonth: string = '';
  cardYear: string = '';
  cvv: string = '';

  currentYear: number = new Date().getFullYear() % 100; // Obtener los últimos dos dígitos del año actual

  validationMessages = {
    cardMonth: {
      required: 'Campo requerido.',
      pattern: 'El mes no es válido.',
      maxlength: 'El mes debe ser de 2 dígitos.',
      minlength: 'El mes debe ser de 2 dígitos.',
      invalidMonth: 'El mes debe estar entre 01 y 12.',
      invalidMonthCurrentYear: 'El mes debe ser mayor al mes actual para el año en curso.'
    },
    cardYear: {
      required: 'Campo requerido.',
      pattern: 'El año no es válido.',
      maxlength: 'El año debe ser de 2 dígitos.',
      minlength: 'El año debe ser de 2 dígitos.',
      invalidYear: `El año debe ser mayor o igual a ${this.currentYear}.`
    },
  };

  paymentMethodForm: any;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any, 
    private dialogRef: MatDialogRef<UpdatePaymentDialogComponent>,
    private formBuilder: FormBuilder,
  ) {
    if (data.paymentMethod) {
      this.cardNumber = (data.paymentMethod.card_type + ' ' + data.paymentMethod.card_number_hint).replace(/\*/g, '').toUpperCase();

      // separate month and year
      const date = data.paymentMethod.expiration_date.split('/')

      this.cardMonth = date[0];
      this.cardYear = date[1].replace('20', '');
    } 
  }

  ngOnInit() {
    this.paymentMethodForm = this.formBuilder.group({
      cardMonth: [
        '',
        [
          Validators.required,
          Validators.pattern('^(0?[1-9]|1[012])$'),
          Validators.maxLength(2),
          Validators.minLength(2),
          this.monthValidator(),
        ],
      ],
      cardYear: [
        '',
        [
          Validators.required, 
          Validators.maxLength(2), 
          Validators.minLength(2),
          this.yearValidator(this.currentYear),
        ],
      ],
    });

    // assign values to form
    this.paymentMethodForm.get('cardMonth').setValue(this.cardMonth);
    this.paymentMethodForm.get('cardYear').setValue(this.cardYear);

  }

  
  // Validador personalizado para el mes
  monthValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const formGroup = control.parent;
      if (!formGroup) return null;
  
      const month = control.value;
      const year = formGroup.get('cardYear')?.value;
  
      const currentMonth = new Date().getMonth() + 1; // Mes actual (de 1 a 12)
      const validMonth = /^(0?[1-9]|1[012])$/.test(month);
      if (!validMonth) {
        return { invalidMonth: 'El mes debe estar entre 01 y 12.' };
      }
      if (year == this.currentYear && month <= currentMonth) {
        return { invalidMonthCurrentYear: 'El mes debe ser mayor al mes actual para el año en curso.' };
      }
      return null;
    };
  }

  // Validador personalizado para el año
  yearValidator(currentYear: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const year = control.value;
      const valid = year >= currentYear;
      return valid ? null : { invalidYear: true };
    };
  }

  close(answer: boolean) {
    if (answer) {
      // validate form
      if (this.paymentMethodForm.invalid) {
        return;
      }

      // get values from form
      const month = this.paymentMethodForm.get('cardMonth').value;
      const year = this.paymentMethodForm.get('cardYear').value;

      // set expiration date
      const expirationDate = month + '/20' + year;

      // check if expiration date is the same
      if (this.data.paymentMethod.expiration_date == expirationDate) {
        return;
      }

      // set expiration date
      this.data.paymentMethod.expiration_date = expirationDate;

      this.dialogRef.close(this.data.paymentMethod);
    } else {
      this.dialogRef.close(null);
    }
  }

  getErrorMessage(controlName: string): string {
    const control = this.paymentMethodForm.get(controlName);
    for (const errorKey of Object.keys(this.validationMessages[controlName])) {
      if (control.hasError(errorKey)) {
        return this.validationMessages[controlName][errorKey];
      }
    }
    return '';
  }

  validateOnlyNumberDigits(event: any, maxLength: number) {
    let value = event.target.value;
  
    // Eliminar caracteres que no sean números
    value = value.replace(/[^0-9]/g, '');
  
    // Limitar a maxLength dígitos
    if (value.length > maxLength) {
      value = value.slice(0, maxLength);
    }
  
    event.target.value = value;
  }
}
