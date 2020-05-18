import { Injectable } from '@angular/core';

// Importação da biblioteca do capacitor
import { Plugins, CameraResultType, Capacitor, FilesystemDirectory, CameraPhoto, CameraSource } from '@capacitor/core';

// Comecando a criar a camera
const { Camera, Filesystem, Storage } = Plugins;

@Injectable({
  providedIn: 'root'
})
export class PhotoService {

  public photos: Photo[] = [];

  private PHOTO_STORAGE = 'photos';

  constructor() { }

public async addNewToGallery() {

  // Tirar foto
  const capturedPhoto = await Camera.getPhoto({
  resultType: CameraResultType.Uri,
  source: CameraSource.Camera,
  quality: 100
  });

  // Salve a foto e adicione-a à coleção de fotos
  const savedImageFile: any = await this.savePicture(capturedPhoto);

  this.photos.unshift(savedImageFile);

  Storage.set({
    key: this.PHOTO_STORAGE,
    value: JSON.stringify(this.photos.map(p => {
    // Não salve a representação base64 dos dados da foto,
    // já que ele já foi salvo no sistema de arquivos
    const photoCopy = { ...p };
    delete photoCopy.base64;
    return photoCopy;
    }))
  });
}

  // Salvar imagem em arquivo no dispositivo
  private async savePicture(cameraPhoto: CameraPhoto) {
    // Converte a foto para o formato base64, necessário para salvar com a API Filesystem API
    const base64Data = await this.readAsBase64(cameraPhoto);

    // Grava arquivo no diretório de dados
    const fileName = new Date().getTime() + '.jpeg';
    const savedFile = await Filesystem.writeFile({
      path: fileName,
      data: base64Data,
      directory: FilesystemDirectory.Data
});

// Use o webPath para exibir a nova imagem em vez da base64, pois já está carregada na memória
  return {
    filepath: fileName,
    webviewPath: cameraPhoto.webPath
};

  }
  private async readAsBase64(cameraPhoto: CameraPhoto) {
    // Busque a foto, leia como um blob e converta para o formato base64
    const response = await fetch(cameraPhoto.webPath!);
    const blob = await response.blob();
    return await this.convertBlobToBase64(blob) as string;
    }

    convertBlobToBase64 = (blob: Blob) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
    resolve(reader.result);
    };
    reader.readAsDataURL(blob);
    })

public async loadSaved() {
     // Recuperar dados da matriz de fotos em cache
      const photos = await Storage.get({ key: this.PHOTO_STORAGE });
      this.photos = JSON.parse(photos.value) || [];

     // Exiba a foto lendo no formato base64
     for (const photo of this.photos) {

      // Leia os dados de cada foto salva no sistema de arquivos
      const readFile = await Filesystem.readFile({
        path: photo.filepath,
        directory: FilesystemDirectory.Data
    });
     
    // Apenas plataforma da Web: salve a foto no campo base64
    photo.base64 = `data:image/jpeg;base64,${readFile.data}`;
    }
  }
}

interface Photo {
filepath: string;
webviewPath: string;
base64?: string;
}
