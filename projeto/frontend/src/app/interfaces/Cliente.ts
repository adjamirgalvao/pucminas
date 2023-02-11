export interface Cliente {
    _id?: string
    nome: string,
    email: string,
    dataNascimento: Date,
    cpf: string,
    endereco: {
       rua: string,
       numero: string,
       complemento: string
      }
  }