import { Component, EventEmitter, forwardRef, Input, OnInit, Output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import moment from 'moment';

// See the Moment.js docs for the meaning of these formats:
// https://momentjs.com/docs/#/displaying/format/
export const MY_FORMATS = {
  parse: {
    dateInput: 'DD/MM/YYYY',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: 'app-localized-datepicker',
  templateUrl: './localized-datepicker.component.html',
  styleUrls: ['./localized-datepicker.component.scss'],
  providers: [
    // `MomentDateAdapter` can be automatically provided by importing `MomentDateModule` in your
    // application's root module. We provide it at the component level here, due to limitations of
    // our example generation script.
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
    },

    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
    {  
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => LocalizedDatepickerComponent),
      multi: true
    }
  ],
})
export class LocalizedDatepickerComponent implements OnInit, ControlValueAccessor {

  private _value: string;
  // Whatever name for this (myValue) you choose here, use it in the .html file.
  public get model(): string { return this._value }
  public set model(v: string) {
    if (v !== this._value) {
      this._value = v;
      this.onChange(moment(v).format(this.outputFormat));
    }
  }

  @Output() dateChanged: EventEmitter<string> = new EventEmitter<string>();
  @Input() outputFormat: string = "YYYY-MM-DD";
  @Input() minDate: string | moment.Moment;
  @Input() maxDate: string | moment.Moment;
  @Input() name: string;
  @Input() required: boolean;
  @Input() label: string;

  dateFormat = MY_FORMATS.display.dateInput;
  
  constructor() { }
  
  ngOnInit() {
    
  }

  emitChange() {
    this.dateChanged.emit(moment(this.model).format(this.outputFormat))
  }

  onChange = (_) => { };
  onTouched = () => { };

  writeValue(value: any): void {
    this.model = value;
  }
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
  setDisabledState?(isDisabled: boolean): void {
    throw new Error("Method not implemented.");
  }

  get today() {
    return moment;
  }

  myDateFilter = (m: moment.Moment | null): boolean => {
    const date = (m || moment());
    return (this.minDate ? date >= moment(this.minDate) : true)
      && (this.maxDate ? date <= moment(this.maxDate) : true)
  }

}
