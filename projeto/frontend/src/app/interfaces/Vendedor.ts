export interface Vendedor {
    _id?: string
    nome: string,
    cpf: string,
    email: string,
    salario: number,
    endereco: {
       rua: string,
       numero: string,
       complemento: string
      }
  }