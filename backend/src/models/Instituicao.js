class Instituicao {
  constructor(id_instituicao, nome, descricao, email, telefone, status, data_fundacao, site, quant_funcionarios, id_usuario) {
    this.id_instituicao = id_instituicao;
    this.nome = nome;
    this.descricao = descricao;
    this.email = email;
    this.telefone = telefone;
    this.status = status;
    this.data_fundacao = data_fundacao;
    this.site = site;
    this.quant_funcionarios = quant_funcionarios;
    this.id_usuario = id_usuario;
  }
}

module.exports = Instituicao;
