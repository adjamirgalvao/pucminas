export interface Fornecedor {
    _id?: string
    nome: string,
    tipo: string,
    identificacao: string,
    endereco: {
       rua: string,
       numero: string,
       complemento: string
      }
  }