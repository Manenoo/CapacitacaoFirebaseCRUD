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
import { BuscaCEPService } from 'src/app/services/busca-cep.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  newData = {} as User;
  cep: string = '';
  endCol = {};
  user = {} as User;
  userVetor: User[] = [];
  segmentChange: String = 'visualizar';

  constructor(
    private fireStore: AngularFirestore,
    private alertCtrl: AlertController,
    private auth: AngularFireAuth,
    private firebaseService: FirebaseService,
    private toast: ToastService,
    private actionSheetCtrl: ActionSheetController,
    private buscaCep: BuscaCEPService
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
  async addProdutoFirestore(): Promise<void> {
    const produtoId = await this.fireStore.collection('user').add(this.user);
  }

  async alertComum(index: number) {
    this.user = this.userVetor[index];
    const alert = await this.alertCtrl.create({
      header: this.user.nome,
      subHeader: 'Informações do usuário',
      message: `<ul><li> CPF: ${this.user.cpf} </li><p></p><li> CEP: ${this.user.cep} </li><p></p><li> Cidade: ${this.user.cidade} </li><p></p><li> Endereço: ${this.user.endereco} </li><p></p><li> Email: ${this.user.email} </li></ul>`,

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
            this.alertExcluir(this.user);
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
          handler: (data) => {
            this.user = data;
            this.adicionaDados(data);
          },
        },
      ],
      inputs: [
        {
          name: 'nome',
          placeholder: 'Nome',
        },
        {
          name: 'cpf',
          placeholder: 'CPF',
          attributes: {
            maxlength: 11,
          },
        },
        {
          name: 'cep',
          placeholder: 'CEP',
          attributes: {
            maxlength: 8,
          },
        },
        {
          name: 'cidade',
          placeholder: 'Cidade',
        },
        {
          name: 'endereco',
          placeholder: 'Endereço',
        },
        {
          name: 'email',
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
          handler: (data) => {
            this.newData = data;
            this.atualizaDados();
          },
        },
      ],
      inputs: [
        {
          name: 'nome',
          placeholder: 'Nome',
          value: this.user.nome,
        },
        {
          name: 'cpf',
          placeholder: 'CPF',
          attributes: {
            maxlength: 11,
          },
          value: this.user.cpf,
        },
        {
          name: 'cep',
          placeholder: 'CEP',
          attributes: {
            maxlength: 8,
          },
          value: this.user.cep,
        },
        {
          name: 'cidade',
          placeholder: 'Cidade',
          value: this.user.cidade,
        },
        {
          name: 'endereco',
          placeholder: 'Endereço',
          value: this.user.endereco,
        },
        {
          name: 'email',
          placeholder: 'Email',
          value: this.user.email,
        },
      ],
    });
    await alert.present();
  }

  async alertExcluir(usuario: User) {
    const alert = await this.alertCtrl.create({
      header: 'Tem certeza disso?',
      buttons: [
        {
          text: 'Sim',
          cssClass: 'alert-button-confirm',
          handler: () => {
            this.deletaDados(usuario);
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
  async adicionaDados(data: User) {
    this.user = data;
    const enderecoColocado = await this.buscaCep.consultaCEP(this.user.cep);
    this.user.endereco = enderecoColocado.logradouro;
    this.user.cidade = enderecoColocado.localidade;
    const collectionRef = this.fireStore.collection('users');
    const newDocumentRef = this.fireStore.collection('users').add(this.user);

    newDocumentRef.then((docRef) => {
      const newDocumentId = docRef.id;

      // atualize o UID do documento com o ID gerado pelo Firebase
      const updatedData = { ...data, uid: newDocumentId };

      // atualize o documento com o UID atualizado
      const updatedDocumentRef = collectionRef
        .doc(newDocumentId)
        .set(updatedData);

      // verifique se o documento foi adicionado com sucesso e obtenha o UID
      updatedDocumentRef.then(() =>
        console.log(
          `Novo documento adicionado com sucesso! UID: ${newDocumentId}`
        )
      );
    });
  }

  async atualizaDados() {
    this.newData.uid = this.user.uid;
    const enderecoColocado = await this.buscaCep.consultaCEP(this.newData.cep);
    this.newData.endereco = enderecoColocado.logradouro;
    this.newData.cidade = enderecoColocado.localidade;
    this.fireStore.collection('users').doc(this.user.uid).set(this.newData);
    console.log(this.newData.cidade, this.newData.endereco);
  }

  async deletaDados(usuario: User) {
    await this.fireStore.collection('users').doc(usuario.uid).delete();
  }

  async adicionaEndereco2() {
    console.log(this.newData);
    const enderecoColocado = await this.buscaCep.consultaCEP(this.newData.cep);
    this.newData.endereco = enderecoColocado.logradouro;
    this.newData.cidade = enderecoColocado.localidade;
    console.log(this.newData.cidade, this.newData.endereco);
  }

  async adicionaEndereco(data: User) {
    console.log(data.cep);
    const enderecoColocado = await this.buscaCep.consultaCEP(data.cep);
    data.endereco = enderecoColocado.logradouro;
    data.cidade = enderecoColocado.localidade;
    console.log(data);
  }
}
