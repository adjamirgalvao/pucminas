module.exports = class RelatorioUtilService {


  //https://stackoverflow.com/questions/3561493/is-there-a-regexp-escape-function-in-javascript
  //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions#escaping
  static escapeRegExp(string) {
    return '^' + string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + '$'; // $& means the whole matched string
  }

  //https://pt.stackoverflow.com/questions/77505/formatar-mascara-para-cnpj
  static getMascaraCPFCNPJ(identificacao) {
    if (identificacao) {
      if (identificacao.length == 11) {
        return identificacao.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
      } else if (identificacao.length == 14) {
        return identificacao.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
      } else {
        return identificacao;
      }
    } else {
      return '';
    }
  }

  //https://isotropic.co/how-to-format-a-date-as-dd-mm-yyyy-in-javascript/
  static getDataFormatada(data) {
    if (data) {
      return new Date(data).toLocaleDateString('pt-BR');
    } else {
      return '';
    }
  }  

  static getDinheiro(data) {
    if (data || data ==0) {
      return data.toLocaleString('pt-BR',{style: 'currency', currency: 'BRL'});
    } else {
      return '';
    }
  }  

  static gerarCabecalho = (titulo) => {
    return `<html><head><link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-GLhlTQ8iRABdZLl6O3oVMWSktQOp6b7In1Zl3/Jr59b6EGGoI1aFkw7cmDA6j6gD" crossorigin="anonymous"></head><body> <p class="text-center h1 mt-3">${titulo}<p>`;
  };

  static gerarFim = () => {
    return '</body></html>';
  }

  static gerarTabela = (registros, campos, titulos, transformacoes, rodape) => {
    let retorno = '';

    retorno += '<div class="grid gap-3 px-3 pb-3 pt-3 me-3 mb-3">';
    retorno += '<table class="table fs-6">';
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
      let linha = parseInt(i) + 1;
      retorno += '<tr>';
      retorno += `<th scope="row">${(linha)}</th>`;
      for (let j in campos) {
        let valor = registros[i][campos[j]];
        if (transformacoes[j]) {
          valor = transformacoes[j](valor, registros[i]);
        };
        retorno += `<td>${valor}</td>`;
      }
      retorno += '</tr>';
    }
    if (rodape) {
      retorno += rodape(registros);
    }
    retorno += '</tbody>';
    retorno += '</table>';
    retorno += '</div>';
    return retorno;
  }
}
