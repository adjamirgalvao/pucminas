export interface Cliente {
    _id?: string
    nome: string,
    email: string,
    dataNascimento?: Date,
    dataNascimentoStr?: string
    cpf: string,
    endereco: {
       rua: string,
       numero: string,
       complemento: string
      }
  }