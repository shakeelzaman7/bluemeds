import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core'; 
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { ResourcesService } from 'src/app/core/data/resources/resources-service.service';
import { Application } from 'src/app/models/app';

@Injectable({
  providedIn: 'root'
})
export class ApplicationsService {
  private defaultColor =  "#1b46b7"
  private _apps:Application[];
  async apps(): Promise<Application[]> {
    if(this._apps == null)
      await this.refresh();

    return this._apps;
  }
  constructor(@Inject(DOCUMENT) private document: Document, private router: Router, private resourcesService: ResourcesService, private titleService: Title)
  {}

  async refresh() {
    let resource = this.resourcesService.getResource(Application);
    this._apps = (await resource.index()).data
  }

  navigateToApp(app: Application) {
    this.router.navigateByUrl(app.url);
  }

  async setAppColorByUrl(url: string)
  {    
    this.setAppColors((await this.apps()).find(a => url.includes(a.url)))
  }

  setAppColors(app:Application)
  {
    const color = app?.color ?? this.defaultColor;
  
    if (this.document) {
      this.document.documentElement.style.setProperty('--color-primary', this.hexToRgb(color).replace('rgb(', '').replace(')', ''));
      this.document.documentElement.style.setProperty('--color-primary-contrast', this.hexToRgb(this.contrastingColor(color.replace("#", ""))).replace('rgb(', '').replace(')', ''));
    }

    if(app)
    {
      this.titleService.setTitle("Bluemeds - " + app.name)
    }

    const favIcon: HTMLLinkElement = this.document.querySelector('#favIcon');
    favIcon.href = 'assets/favicon.ico';  
  }

  contrastingColor(color:string)
  {
      return (this.luma(color) >= 165) ? '#000000' : '#ffffff';
  }
  luma(color:string) // color can be a hx string or an array of RGB values 0-255
  {
      var rgb = (typeof color === 'string') ? this.hexToRGBArray(color) : color;
      return (0.2126 * rgb[0]) + (0.7152 * rgb[1]) + (0.0722 * rgb[2]); // SMPTE C, Rec. 709 weightings
  }
  hexToRGBArray(color:string)
  {
      
      if (color.length === 3)
          color = color.charAt(0) + color.charAt(0) + color.charAt(1) + color.charAt(1) + color.charAt(2) + color.charAt(2);
      else if (color.length !== 6)
          throw('Invalid hex color: ' + color);
      var rgb = [];
      for (var i = 0; i <= 2; i++)
          rgb[i] = parseInt(color.substr(i * 2, 2), 16);
      return rgb;
  }

  hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? "rgb(" +
      parseInt(result[1], 16) + "," +
      parseInt(result[2], 16) + "," + 
      parseInt(result[3], 16) + ")"
       : null;
  }
}
