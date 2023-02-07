export interface Usuario {
    _id?: string
    email?: string,
    login?: string,
    nome?: string,
    senha?: string,
    confirmacaoSenha?: string,
    roles?: String[],
  }