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
  user = {} as User;
  userVetor: User[] = [];
  segmentChange: String = 'visualizar';

  mensagem: String = 'Lista de nomes:\nEduardo\nMaria\nJosé';

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
      message: 'mensagem',
      buttons: [
        {
          text: 'Editar',
          cssClass: 'alert-button-confirm',
          handler: () => {
            this.alertEditar();
          },
        },
        {
          text: 'Excluir',
          cssClass: 'alert-button-confirm',
          handler: () => {
            this.alertExcluir();
          },
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
          text: 'Criar',
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
          placeholder: 'CEP',
        },
        {
          placeholder: 'Cidade',
        },
        {
          placeholder: 'Endereço',
        },
        {
          placeholder: 'Email',
        },
      ],
    });
    await alert.present();
  }

  async alertEditar() {
    const alert = await this.alertCtrl.create({
      header: 'Edite as informações',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Editar',
          role: 'confirm',
          handler: () => {
            //funcao para sobrescrever
          },
        },
      ],
      inputs: [
        {
          placeholder: 'Nome',
          value: 'Nome do Usuario',
        },
        {
          placeholder: 'CPF',
          attributes: {
            maxlength: 11,
          },
          value: '22222222222',
        },
        {
          placeholder: 'CEP',
          attributes: {
            maxlength: 8,
          },
          value: '4444444',
        },
        {
          placeholder: 'Cidade',
          value: 'Gotham City',
        },
        {
          placeholder: 'Endereço',
          value: 'Rua das Flores',
        },
        {
          placeholder: 'Email',
          value: 'usuario@gmail.com',
        },
      ],
    });
    await alert.present();
  }

  async alertExcluir() {
    const alert = await this.alertCtrl.create({
      header: 'Tem certeza disso?',
      buttons: [
        {
          text: 'Sim',
          cssClass: 'alert-button-confirm',
          handler: () => {
            //funcao para excluir do banco
          },
        },
        {
          text: 'Não',
          cssClass: 'alert-button-cancel',
        },
      ],
    });

    await alert.present();
  }
}
