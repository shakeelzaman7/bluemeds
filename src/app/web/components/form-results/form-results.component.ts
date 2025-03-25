import { Component, Input, OnInit, Output, ViewChild, EventEmitter } from '@angular/core';
import { ResourcesService } from 'src/app/core/data/resources/resources-service.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MedicineRequest } from 'src/app/models/medicine-request';
import { Resource } from 'src/app/core/data/resources/resource';
import { ValidatableFormComponent } from 'src/app/core/components/validatable-form/validatable-form.component';

@Component({
  selector: 'app-form-results',
  templateUrl: './form-results.component.html',
  styleUrls: ['./form-results.component.scss'],
})
export class FormResultsComponent implements OnInit {

  @ViewChild(ValidatableFormComponent) validateForm: ValidatableFormComponent;
  @Input() searchParams: any = { key: null }
  @Output() onResetSearchParams: EventEmitter<string> = new EventEmitter<string>();

  public medicineRequest: MedicineRequest = new MedicineRequest();
  private resource: Resource<MedicineRequest>
  saving:boolean;
  pharmacies:string[] = [
    "Farmacias Galeno",
    "Farma Value",
    "Farmacias Batres",
    "Farmacias Cruz Verde",
    "Farmacias Meykos",
    "Farmacias Kielsa",
    "Farmacias Fayco",
    "Farmacosto",
    "Farmacias del Ahorro",
    "Otros",
    "Médicos",
    "Patronatos",
    "ONG",
    "Farmacias Sociales",
    "Farmacias de colonia",
    "Farmacias mayoristas",
  ];
  otherPharmacy: boolean = false;
  
  alreadySentForms = {
    
  }

  constructor(private resourcesService: ResourcesService, private matSnackbar:MatSnackBar) { 
    this.resource = resourcesService.getResource(MedicineRequest)
  }

  ngOnInit() {
    this.medicineRequest.medicine_name = this.searchParams;
    // this.medicineRequest.pharmacy = "Sin definir";
  }

  newSearchQuery() {
    return this.alreadySentForms[this.searchParams]?.sent;
  }

  async save() {
    this.validateForm.clear();
    this.saving = true;

    try {
      
      await this.handleSave();

      this.matSnackbar.open('Enviado correctamente', null, {
        duration: 3000,
        panelClass: "bg-success",
        horizontalPosition: 'right',
        verticalPosition: 'top'
      });

      this.alreadySentForms[this.searchParams] = {sent: true};
      this.onResetSearchParams.emit();
    }
    catch (e) {
      let msg = "Ocurrió un error";
      if (e.status == 422) {
        msg = e.error?.message;
        this.validateForm.validate(e);
      }
      else {
        //
      }

      this.matSnackbar.open(msg, null, {
        duration: 3000,
        panelClass: "bg-danger",
        horizontalPosition: 'right',
        verticalPosition: 'top'
      });
    }
    this.saving = false;

    this.medicineRequest.contact_email = ""
    this.medicineRequest.contact_name = ""
    this.medicineRequest.contact_phone = ""
    this.medicineRequest.medicine_name = ""
    this.medicineRequest.pharmacy = ""
  }
  
  async handleSave() {
    await this.resource.store(this.medicineRequest);
  }
}
