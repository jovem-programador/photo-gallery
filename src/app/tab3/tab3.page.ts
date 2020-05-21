import { Component } from '@angular/core';
import { Plugins } from '@capacitor/core';

const { Device, Geolocation } = Plugins;

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page {

  info: any;
  batinfo: any;
  lang: any;
  outBat: any;
  outBatCharge: any;
  outSystemOp: any;

  constructor() {}

  async ngOnInit() {

    // Acesso ao status do sistema
    this.info = await Device.getInfo();
    console.log(this.info);
    this.outSystemOp = this.info.operatingSystem;

    // Acesso ao status da bateria
    this.batinfo = await Device.getBatteryInfo();
    console.log(this.batinfo);
    this.outBat = this.batinfo.batteryLevel;
    this.outBatCharge = this.batinfo.isCharging;

    // Qual o idioma do dispositivo
    this.lang = await Device.getLanguageCode();
    console.log(this.lang);
    
    // Localização
    const coordinates = await Geolocation.getCurrentPosition();
    console.log('Onde estou? ', coordinates.coords);

    const wait = Geolocation.watchPosition({}, (position, err) => {
      console.log('Bússola: ', position);
    });
  
   
  };


} 