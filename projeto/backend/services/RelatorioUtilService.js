module.exports = class RelatorioUtilService {

  static gerarCabecalho = (titulo) => {
    return `<html><head><link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-GLhlTQ8iRABdZLl6O3oVMWSktQOp6b7In1Zl3/Jr59b6EGGoI1aFkw7cmDA6j6gD" crossorigin="anonymous"></head><body> <p class="text-center h1 mt-3">${titulo}<p>`;
  };

  static gerarFim = () => {
    return '</body></html>';
  }

  static gerarTabela = (registros, campos, titulos, transformacoes) => {
    let retorno = '';

    retorno += '<div class="grid gap-3 px-3 pb-3 pt-3 me-3 mb-3">';
    retorno += '<table class="table">';
    retorno += '<thead>';
    retorno += '<tr>';
    retorno += '<th scope="col">#</th>';
    for (let i in campos) {
      retorno += `<th scope="col">${titulos[i]}</th>`;
    }
    retorno += '</tr>';
    retorno += '</thead>';
    retorno += '<tbody>';
    for (let i in registros) {
      retorno += '<tr>';
      retorno += `<th scope="row">${i}</th>`;
      for (let j in campos) {
        let valor = registros[i][campos[j]];
        if (transformacoes[j]) {
          valor = transformacoes[j](valor);
        };
        retorno += `<td>${valor}</td>`;
      }
      retorno += '</tr>';
    }
    retorno += '</tbody>';
    retorno += '</table>';
    retorno += '</div>';
    return retorno;
  }
}
