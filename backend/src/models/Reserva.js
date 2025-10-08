class Reserva {
    constructor(id, id_instituicao, id_usuario, data, status, descricao) {
        this.id = id;
        this.id_instituicao = id_instituicao;
        this.id_usuario = id_usuario;
        this.data = data;
        this.status = status;
        this.descricao = descricao;
    }
}

module.exports = Reserva;
