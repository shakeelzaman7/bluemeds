import { AfterViewInit, Component, Output, EventEmitter, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { LayoutService } from 'src/app/@vex/services/layout.service';
import { ApiService } from 'src/app/core/api/api.service';
import { ListService } from '../../services/list/list.service';
import { EventService } from 'src/app/services/event.service';

@Component({
  selector: 'app-upload-profile',
  templateUrl: './upload-profile.component.html',
  styleUrls: ['./upload-profile.component.scss'],
})

export class UploadProfileComponent implements OnInit, AfterViewInit {
  fileSelectorInput: HTMLElement;
  dropArea: HTMLElement;
  files: File[] = [];

  disabledButtons: boolean = false;
  list: any;
  deliveryId: number;

  constructor(
    private modalCtrl: ModalController,
    private matSnackbar: MatSnackBar,
    private translate: TranslateService,
    private api: ApiService,
    private listService: ListService,
    public layoutService: LayoutService,
    private eventService: EventService
  ) {
    translate.setDefaultLang('es');
    translate.use(navigator.language.slice(0, 2));
  }

  async close() {
    await this.modalCtrl.dismiss('cancel');
  }

  async closeFinished() {
    await this.modalCtrl.dismiss('finished');
  }

  openFileSelector() {
    // llamamos al input file para obtener el archivo
    this.fileSelectorInput.click();
  }

  dragOver(event) {
    event.preventDefault();
    this.dropArea.classList.add("drag-over-effect");
  }

  dragLeave(event) {
    event.preventDefault();
    this.dropArea.classList.remove("drag-over-effect");
  }

  drop(event) {
    event.preventDefault();
    this.dropArea.classList.remove("drag-over-effect");

    let filedDenied = false;
    // agregamos a this.files los archivos que cumplan con las extensiones permitidas y si ya existían no los agregamos
    let filesNames = this.files.map((file) => { // obtenemos el nombre de los archivos que ya existen en this.files
      return file.name;
    })

    event.dataTransfer.files.forEach((file) => {
      if (this.typeValidation(file.type) && !filesNames.includes(file.name) && this.sizeValidation(file.size)) {
        this.files.push(file);
      } else {
        filedDenied = true;
      }
    });

    if (filedDenied) {
      this.matSnackbar.open("Algunos archivos no se cargaron porque no son del tipo permitido, no cumplen con el máximo de tamaño o ya fueron seleccionados", null, {
        duration: 7000,
        panelClass: "bg-danger",
        horizontalPosition: 'center',
        verticalPosition: 'top'
      });
    }
  }

  changeFile(event) {
    let filedDenied = false;
    // agregamos a this.files los archivos que cumplan con las extensiones permitidas
    let filesNames = this.files.map((file) => { // obtenemos el nombre de los archivos que ya existen en this.files
      return file.name;
    })

    event.target.files.forEach((file) => {
      if (this.typeValidation(file.type) && !filesNames.includes(file.name) && this.sizeValidation(file.size)) {
        this.files.push(file);
      } else {
        filedDenied = true;
      }
    });

    if (filedDenied) {
      this.matSnackbar.open("Algunos archivos no se cargaron porque no son del tipo permitido, no cumplen con el máximo de tamaño o ya fueron seleccionados", null, {
        duration: 7000,
        panelClass: "bg-danger",
        horizontalPosition: 'center',
        verticalPosition: 'top'
      });
    }
  }

  typeValidation(type) {
    let splitType = type.split('/')[0]
    if (splitType == 'image') {
      return true
    }
  }

  sizeValidation(size) {
    // el archivo no puede ser mayor a 1 MB
    return size <= 1000000;
  }

  removeDocument(item) {
    setTimeout(() => {
      this.files.splice(this.files.indexOf(item), 1);
    }, 400);
  }

  uploadFiles() {
    // validamos que se haya cargado un archivo
    if (this.files.length == 0) {
      this.matSnackbar.open("Debe cargar un archivo", null, {
        duration: 2000,
      });
      return;
    }

    // consumiremos el endpoint para subir los archivos y mostraremos la barra de progreso por cada archivo
    this.disabledButtons = true;
    this.files.forEach((file) => {
      // obtenemos el li, el id de cada li es 'item-' + index
      let li = document.getElementById('item-' + this.files.indexOf(file));
      // removemos clase still y colocamos clase in-prog
      li.classList.remove('still');
      li.classList.add('in-prog');

      let http = new XMLHttpRequest();
      let formData = new FormData();
      formData.append('profile_picture_file', file);
      http.onload = async () => {
        li.classList.add('complete');
        li.classList.remove('in-prog');

        // cerramos modal si es el último archivo, esperamos 1200 ms para antes de cerrarlo
        if (this.files.indexOf(file) == this.files.length - 1) {
          setTimeout(() => {
            this.closeFinished();
          }, 500);
        }

        // Verifica si el código de estado HTTP indica éxito (200-299)
        if (http.status >= 200 && http.status < 300) {
          this.eventService.emitEvent();

          this.matSnackbar.open("Archivos cargados con éxito", null, {
            duration: 3500,
            panelClass: ["bg-success", "text-white", "flex", "justify-center"],
            horizontalPosition: 'center',
            verticalPosition: 'top'
          });
        } else {
          try {
              var errorData = JSON.parse(http.responseText);

              this.matSnackbar.open(errorData["message"], null, {
                duration: 3500,
                panelClass: ["bg-danger", "text-white", "flex", "justify-center"],
                horizontalPosition: 'center',
                verticalPosition: 'top'
              });
          } catch(e) {
            this.matSnackbar.open("No se logro cargar los archivos con exito ", null, {
              duration: 3500,
              panelClass: ["bg-danger", "text-white", "flex", "justify-center"],
              horizontalPosition: 'center',
              verticalPosition: 'top'
            });
          }
        }
      };

      http.upload.onprogress = (event) => {
        let percent = Math.round((event.loaded / event.total) * 100);
        li.querySelectorAll('span')[0].innerHTML = Math.round(percent) + '%';
        li.querySelectorAll('span')[1].style.width = percent + '%';
      };

      http.open('POST', this.api.url + '/' + `profile/store-picture`, true);
      http.setRequestHeader('Authorization', 'Bearer ' + this.listService.authService.token.token);
      http.setRequestHeader('Accept', 'application/json');
      http.send(formData);

      // obtenemos el elemento con la clase remove-file que está dentro del li para poder abortar la subida del archivo
      let removeFile = li.querySelector('.remove-file');
      removeFile.addEventListener('click', () => {
        http.abort();
      });
    });
  }

  async ngOnInit() {
    this.dropArea = document.querySelector(".drop-section");
    this.fileSelectorInput = document.querySelector('.file-selector-input');
  }

  ngAfterViewInit(): void {

  }
}
