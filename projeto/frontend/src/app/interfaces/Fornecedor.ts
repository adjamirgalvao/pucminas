export interface Fornecedor {
    _id?: string
    nome: string,
    tipo: string,
    identificacao: Number,
    endereco: {
       rua: string,
       numero: Number,
       complemento: string
      }
  }