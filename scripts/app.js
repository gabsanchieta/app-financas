//captura a data do sistema e guarda na variável
const data = new Date();
//pega o mês da data (de 0-11) e adiciona 1 para definir o mês
const mesAtual = data.getMonth() + 1;
const anoAtual = data.getFullYear(); //pega o ano da data

//Classe Registro para controlar as informações dos registros de entrada
class Registro {
  constructor(data, dia, mes, ano, nome, valor, categoria, descricao, tipo) {
    this.data = data;
    this.dia = dia;
    this.mes = mes;
    this.ano = ano;
    this.nome = nome;
    this.valor = valor;
    this.categoria = categoria;
    this.descricao = descricao;
    this.tipo = tipo;
  }
  //verifica se todos os dados estão preenchidos
  validarDados() {
    for (let i in this) {
      if (this[i] == undefined || this[i] == "" || this[i] == null) {
        return false;
      }
    }
    return true;
  }
}

//Classe Db para controlar as informações do banco de dados como o id dos Registros
class Db {
  constructor() {
    let id = localStorage.getItem("id");
    //verifica se já já foi criado o campo id para controle do banco, senão o cria
    if (id === null) {
      localStorage.setItem("id", 0);
    }
  }

  //verifica qual será o próximo id a ser usado
  getProximoId() {
    //pega o ultimo id usado e incrementa +1
    let proximoId = localStorage.getItem("id");
    return parseInt(proximoId) + 1;
  }
  //recebe o objeto entrada e grava no banco
  gravar(e) {
    let id = this.getProximoId();
    //muda o id do local storage
    localStorage.setItem("id", id);
    //adiciona um novo registro com o id atual
    localStorage.setItem(id, JSON.stringify(e));
  }
  //recebe o objeto alterado e o id do objeto a ser alterado e grava no banco
  alterar(id, e) {
    //altera o registro com o id passado
    localStorage.setItem(id, JSON.stringify(e));
  }
  excluir(id) {
    //exclui o registro com o id passado
    localStorage.removeItem(id);
  }
  //recupera uma lista com os registros em banco
  recuperarRegistros() {
    //cria um array para receber os registros
    let registros = Array();
    let id = localStorage.getItem("id");

    //recupera registros do banco enquanto for menor que o ultimo id
    for (let i = 1; i <= id; i++) {
      let registro = JSON.parse(localStorage.getItem(i));
      //se o registro estiver vazio (em caso de exclusão), pula pro próximo
      if (registro === null) {
        continue;
      }
      registro.id = i;
      //adiciona o registro ao array de registros
      registros.push(registro);
    }
    return registros;
  }
}

//inicializa um novo objeto db sempre que carrega a página para gerenciar o banco de dados
let db = new Db();

function adicionar() {
  //captura os dados dos inputs e guarda nas variáveis
  let data = document.getElementById("data").value;
  let [ano, mes, dia] = data.split("-");
  let nome = document.getElementById("nome");
  let valor = document.getElementById("valor").value;
  //verifica se o valor digitado possui vírgula para trocar para ponto(padrão numérico)
  if (valor.indexOf(".") === -1) {
    // Não há ponto na string
    valorFinal = valor.replace(",", ".");
  }
  let categoria = document.getElementById("categoria");
  let descricao = document.getElementById("descricao");
  let tipo;
  var radios = document.getElementsByName("tipo");
  for (var i = 0; i < radios.length; i++) {
    if (radios[i].checked) {
      tipo = radios[i];
    }
  }

  //cria um novo objeto registro com os dados capturados
  let registro = new Registro(
    data,
    dia,
    mes,
    ano,
    nome.value,
    valorFinal,
    categoria.value,
    descricao.value,
    tipo.value
  );

  //se os dados inseridos forem validos, exibe alert e grava o registro no banco
  if (registro.validarDados()) {
    let alertsEl = document.getElementById("alerts");
    alertsEl.innerHTML = `
        <div id="alerta" class="alert alert-success alert-dismissible fade show">
          <button id="fecha-alerta" type="button" class="btn-close" data-bs-dismiss="alert"></button>
          <strong>Registro gravado!</strong> O registro foi inserido no Banco de Dados.
        </div>
  `;
    let botaoAlertaEl = document.getElementById("fecha-alerta");
    // Espera 2 segundos e fecha o alerta
    setTimeout(function () {
      botaoAlertaEl.dispatchEvent(new Event("click"));
    }, 2000);

    //grava o registro no banco através do método gravar do objeto db
    db.gravar(registro);

    //limpa e prepara os campos para adicionar um novo registro
    carregarDataAtual();
    nome.value = "";
    valor.value = "";
    categoria.value = "";
    descricao.value = "";
  } else {
    //se os dados forem inválidos
    let alertsEl = document.getElementById("alerts");
    alertsEl.innerHTML = `
        <div id="alerta" class="alert alert-danger alert-dismissible fade show">
          <button id="fecha-alerta" type="button" class="btn-close" data-bs-dismiss="alert"></button>
          <strong>Erro na Gravação!</strong> Preencha os campos corretamente.
        </div>
  `;
    let botaoAlertaEl = document.getElementById("fecha-alerta");
    //let alertaEl = document.getElementById("alerts");
    // Espera 2 segundos e fecha o alerta
    setTimeout(function () {
      botaoAlertaEl.dispatchEvent(new Event("click"));
    }, 2000);
  }
}
//função para exibir os detalhes do registro ao ser clicado na tabela
function exibirDetalhes(r, mes, ano) {
  //personaliza o modal
  document.getElementById("titulo-modal").innerHTML = r.nome;
  document.getElementById("titulo-modal").className = "modal-title";
  document.getElementById("form-edit").style.display = "block";
  document.getElementById("button-editar").innerHTML = "Salvar";
  document.getElementById("button-editar").className = "btn btn-warning";
  document.getElementById("button-excluir").innerHTML = "Excluir";
  document.getElementById("button-excluir").className = "btn btn-danger";
  $("#modalGravacao").modal("show");
  //preenche os dados dos campos no modal
  document.getElementById("nome").value = r.nome;
  document.getElementById("data").value = r.data;
  document.getElementById("valor").value = r.valor;
  document.getElementById("descricao").value = r.descricao;

  if (r.tipo == "tipodespesa") {
    document.querySelector("input[value=tipodespesa]").checked = true;
    document.getElementById("categoria").style.display = "block";
    document.getElementById("categoria").value = r.categoria;
  } else {
    document.querySelector("input[value=tiporeceita]").checked = true;
    document.getElementById("categoria").style.display = "none";
  }
  document.getElementById("button-editar").onclick = function () {
    let id = r.id;
    //chama a função pra alterar o registro passando o id do registro atual
    //passa também a data atual para manter o estado da aplicação
    alterarRegistro(id, mes, ano);
  };

  document.getElementById("button-excluir").onclick = function () {
    let id = r.id;
    //chama a função pra excluir o registro passando o id do registro atual
    //passa também a data atual para manter o estado da aplicação
    excluirRegistro(id, mes, ano);
  };
}
function excluirRegistro(id, mesSelecionado, anoSelecionado) {
  //chama a função excluir do banco com o id do registro a ser excluido
  db.excluir(id);
  //recarrega a lista de registros após a exclusão
  carregarRegistros(mesSelecionado, anoSelecionado);

  let alertsEl = document.getElementById("alerts");
  alertsEl.innerHTML = `
        <div id="alerta" class="alert alert-success alert-dismissible fade show">
          <button id="fecha-alerta" type="button" class="btn-close" data-bs-dismiss="alert"></button>
          <strong>Registro excluído!</strong> O registro foi excluído do Banco
          de Dados.
        </div>
  `;
  let botaoAlertaEl = document.getElementById("fecha-alerta");
  // Espera 2 segundos e fecha o alerta
  setTimeout(function () {
    botaoAlertaEl.dispatchEvent(new Event("click"));
  }, 2000);
}

function alterarRegistro(id, mesSelecionado, anoSelecionado) {
  //captura os dados dos inputs e guarda nas variáveis
  let data = document.getElementById("data").value;
  let [ano, mes, dia] = data.split("-");
  let nome = document.getElementById("nome");
  let valor = document.getElementById("valor").value;
  if (valor.indexOf(".") === -1) {
    // Não há ponto na string
    valorFinal = valor.replace(",", ".");
  }
  let categoria = document.getElementById("categoria");
  let descricao = document.getElementById("descricao");
  let tipo;
  var radios = document.getElementsByName("tipo");
  for (var i = 0; i < radios.length; i++) {
    if (radios[i].checked) {
      tipo = radios[i];
    }
  }

  //cria um novo objeto registro com os dados capturados
  let registro = new Registro(
    data,
    dia,
    mes,
    ano,
    nome.value,
    valorFinal,
    categoria.value,
    descricao.value,
    tipo.value
  );

  //se os dados inseridos forem validos, exibe alert e grava o registro no banco
  if (registro.validarDados()) {
    let alertsEl = document.getElementById("alerts");
    alertsEl.innerHTML = `
        <div id="alerta" class="alert alert-success alert-dismissible fade show">
          <button id="fecha-alerta" type="button" class="btn-close" data-bs-dismiss="alert"></button>
          <strong>Registro alterado!</strong> O registro foi alterado.
        </div>
  `;
    let botaoAlertaEl = document.getElementById("fecha-alerta");
    // Espera 2 segundos e fecha o alerta
    setTimeout(function () {
      botaoAlertaEl.dispatchEvent(new Event("click"));
    }, 2000);

    //grava o registro no banco através do método gravar do objeto db
    db.alterar(id, registro);
  } else {
    let alertsEl = document.getElementById("alerts");
    alertsEl.innerHTML = `
        <div id="alerta" class="alert alert-danger alert-dismissible fade show">
          <button id="fecha-alerta" type="button" class="btn-close" data-bs-dismiss="alert"></button>
          <strong>Erro na Gravação!</strong> Preencha os campos corretamente.
        </div>
  `;
    let botaoAlertaEl = document.getElementById("fecha-alerta");
    // Espera 2 segundos e fecha o alerta
    setTimeout(function () {
      botaoAlertaEl.dispatchEvent(new Event("click"));
    }, 2000);
  }

  //recarrega a lista de registros com o registro alterado
  carregarRegistros(mesSelecionado, anoSelecionado);
}
//responsável por exibir a lista de registros na tabela
function carregarRegistros(mes, ano) {
  let mesAtual = ("0" + mes).slice(-2);
  //cria um novo array para receber os registros
  let registros = Array();
  //chama o método recuperarRegistros do objeto db e atribui o resultado ao array registros
  registros = db.recuperarRegistros();

  let registrosFiltrados = registros.filter(
    (r) => r.mes == mesAtual && r.ano == ano
  );

  //Monta a tabela com base nos registros filtrados

  let saldo = 0.0;
  let listaRegistros = document.getElementById("listaRegistros");
  listaRegistros.innerHTML = "";

  //para cada registro do array, cria-se uma entrada na tabela e preenche com seus dados
  registrosFiltrados.forEach(function (r) {
    let linha = listaRegistros.insertRow();
    linha.onclick = function () {
      exibirDetalhes(r, mes, ano);
    };

    //exibe os nomes na tabela
    linha.insertCell(0).innerHTML = r.nome;
    linha.insertCell(1).innerHTML = r.data;

    let valor = linha.insertCell(2);

    //Formata e exibe os valores na tabela
    valor.innerHTML = new Intl.NumberFormat("pt-br", {
      style: "currency",
      currency: "BRL",
    }).format(parseFloat(r.valor));

    //formata e calcula as despesas e receitas
    let tipo = r.tipo;
    if (tipo == "tipodespesa") {
      valor.className = "text-danger";
      saldo = saldo - parseFloat(r.valor);
    } else {
      valor.className = "text-success";
      saldo = saldo + parseFloat(r.valor);
    }
  });
  //exibe o saldo no elemento
  document.getElementById("saldo-total").innerHTML = new Intl.NumberFormat(
    "pt-br",
    { style: "currency", currency: "BRL" }
  ).format(saldo);
}
//usada na página de saldo para mudar a exibição da data
function mudarMesEl(mes, ano) {
  //cria um array com o nome dos meses a ser exibido
  const nomesMeses = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ];
  //pega o nome do mês com base no valor da variável mes e a posição do array
  const nomeMes = nomesMeses[mes - 1];
  //pega os elementos mes e ano e atribui os valores de mes e ano definidos
  document.getElementById("mes").innerHTML = nomeMes;
  document.getElementById("ano").innerHTML = ano;

  const valorMes = ("0" + mes).slice(-2);
  //pega o seletor de data
  const dataEl = document.querySelector("#mesano");
  //atribui o mes e ano atual
  dataEl.value = `${ano}-${valorMes}`;
  carregarRegistros(mes, ano);
}
//usada na página de cadastro
function carregarDataAtual() {
  const data = new Date();
  const ano = data.getFullYear();
  const mes = ("0" + (data.getMonth() + 1)).slice(-2); // adiciona um zero à esquerda para meses de um dígito
  const dia = ("0" + data.getDate()).slice(-2); // adiciona um zero à esquerda para dias de um dígito

  const inputData = document.querySelector("#data");
  inputData.setAttribute("value", `${ano}-${mes}-${dia}`);
}
//categorias despesas: Moradia, Supermercado, TV / Internet / Telefone, Transporte, Lazer, Saúde, Bares e Restaurantes
//categorias receitas: não vai ter
//receita tem categoria 0, e despesas sem categoria é 0 também
function toggleCategloria() {
  //verifica se o tipo da entrada é despesa para exibir ou ocultar o campo de categoria
  let radios = document.getElementsByName("tipo");
  let categoria = document.getElementById("categoria");
  let tipo = "";
  for (var i = 0; i < radios.length; i++) {
    if (radios[i].checked) {
      tipo = radios[i].value;
    }
  }

  if (tipo == "tipodespesa") {
    categoria.style.display = "block";
  } else {
    categoria.style.display = "none";
  }
}

//captura o mês do select e muda o mês da aplicação
function mudarData() {
  const dataEl = document.querySelector("#mesano");
  let data = dataEl.value;
  let [ano, mes] = data.split("-");
  mudarMesEl(mes, ano);
}

//função que inicializa a aplicação ao carregar a página
function inicializar() {
  mudarMesEl(mesAtual, anoAtual);
}
