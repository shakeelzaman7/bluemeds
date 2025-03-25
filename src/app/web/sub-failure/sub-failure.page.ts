import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatInput } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AlertController, ModalController } from '@ionic/angular';
import moment, { Moment } from 'moment';
import { DeliveryItem } from 'src/app/models/delivery-item';
import { PublicationModalComponent } from '../components/publication-modal/publication-modal.component';
import { ListService } from '../services/list/list.service';
import icEditCalendar from '@iconify/icons-ic/round-edit-calendar';
import icDelete from '@iconify/icons-ic/delete-sweep';
import icEdit from '@iconify/icons-ic/round-edit-note';
import { Intervals, Semantics } from 'src/app/models/dosage-intervals';
import { InsuranceAgent } from 'src/app/models/insurance-agents';
import { ResourcesService } from 'src/app/core/data/resources/resources-service.service';
import { LayoutService } from 'src/app/@vex/services/layout.service';
let settings:any = null
@Component({
  selector: 'app-sub-failure',
  templateUrl: './sub-failure.page.html',
  styleUrls: ['./sub-failure.page.scss'],
})
export class SubFailurePage implements OnInit {
  
  constructor() {}
  ngOnInit() {}

}
