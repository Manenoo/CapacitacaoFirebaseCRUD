import { ToastService } from './../../services/toast.service';
import { FirebaseService } from 'src/app/services/firebase.service';
import { User } from 'src/app/interfaces/user';
import { Component } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import {
  ActionSheetController,
  AlertController,
  ToastController,
} from '@ionic/angular';
import { alertController } from '@ionic/core';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  userVetor: User[] = [];
  segmentChange: String = 'visualizar';
  message = 'Aqui tem que ficar a lista de atributos';

  constructor(
    private fireStore: AngularFirestore,
    private alertCtrl: AlertController,
    private auth: AngularFireAuth,
    private firebaseService: FirebaseService,
    private toast: ToastService,
    private actionSheetCtrl: ActionSheetController
  ) {
    this.getUserData();
  }

  private async getUserData(): Promise<void> {
    //primeira maneira de chamar todos os documentos de uma coleção
    const collectionRef = this.fireStore.collection('users');

    let userBanco = await collectionRef.get().toPromise();

    let users = userBanco?.docs.map((doc) => {
      return doc.data();
    });

    console.log(users);

    //segunda maneira de chamar todos os documentos de uma coleção
    collectionRef.valueChanges().subscribe((data) => {
      this.userVetor = data as User[];
      console.log(this.userVetor);
    });
  }

  async alertComum() {
    const alert = await this.alertCtrl.create({
      header: 'Usuário',
      message: this.message,

      buttons: [
        {
          text: 'Editar',
          cssClass: 'alert-button-confirm',
        },
        {
          text: 'Excluir',
          cssClass: 'alert-button-confirm',
        },
        {
          text: 'Cancelar',
          cssClass: 'alert-button-cancel',
        },
      ],
    });

    await alert.present();
  }

  async alertCreate() {
    const alert = await this.alertCtrl.create({
      header: 'Insira as informações',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'OK',
          role: 'confirm',
        },
      ],
      inputs: [
        {
          placeholder: 'Nome',
        },
        {
          placeholder: 'CPF',
          attributes: {
            maxlength: 11,
          },
        },
        {
          placeholder: 'Cidade',
        },
        {
          placeholder: 'Rua',
        },
      ],
    });
    await alert.present();
  }
}
