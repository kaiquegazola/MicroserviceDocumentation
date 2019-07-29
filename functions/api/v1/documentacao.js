const fb = require("../../firebase");
const Documentacao = require("../../model/Documentacao");
var path = require('path')

var api = {};

async function getDocumentacoes() {
    const ref = await fb.firebaseApp.firestore().collection("Documentacao").get();
    return ref.docs.map((doc) => {
        var dados = doc.data();
        dados.id = doc.id;
        return dados;
    });
}

async function insertDocumentacao(documentacao) {
    const ref = await fb.firebaseApp.firestore().collection("Documentacao");
    return ref.add(documentacao);
}

async function insertAtividade(idDocumentacao, atividade) {
    const ref = await fb.firebaseApp.firestore().collection("Documentacao").doc(idDocumentacao).collection('atividades');
    return ref.add(atividade);
}

async function getDocumentacaoById(id) {
    const ref = await fb.firebaseApp.firestore().collection("Documentacao").doc(id).get();
    const atividades = await fb.firebaseApp.firestore().collection('Documentacao').doc(id).collection('atividades').get();
    var documentacao = ref.data();
    documentacao.id = ref.id;
    documentacao.atividades = atividades.docs.map((doc) => {
        var dados = doc.data();
        dados.id = doc.id;
        dados.documentacaoID = documentacao.id;
        return dados;
    });
    return documentacao;
}


async function getAtividadeById(idDocumentacao, id) {
    const ref = await fb.firebaseApp.firestore().collection("Documentacao").doc(idDocumentacao).collection('atividades').doc(id).get();
    return ref.data();
}

async function deleteDocumentacaoById(id) {
    const ref = await fb.firebaseApp.firestore().collection("Documentacao").doc(id);
    return ref.delete();
}

async function deleteAtividadeById(idDocumentacao, id) {
    const ref = await fb.firebaseApp.firestore().collection("Documentacao").doc(idDocumentacao).collection('atividades').doc(id);
    return ref.delete();
}

api.adicionar = function (req, res) {

    insertDocumentacao(req.body).then(documentacao => {
        if (req.files) {
            file = req.files[0];
            /*file.name = documentacao.id;
            uploadImageToStorage(file).then((url) => {
                emp.imagem = url;
                updateDocumentacaoById(documentacao.id, emp).then(empUpdated => {
                    req.flash("success", "Documentação adicionada!");
                    res.redirect('/painel/documentacao/' + documentacao.id);
                }).catch((e) => {
                    req.flash("error", "Não foi possível inserir imagem:<br>" + e.message);
                    res.redirect('/painel/documentacao/' + documentacao.id);
                });
            });*/
        } else {
            req.flash("success", "Documentação adicionada!");
            res.redirect('/painel/documentacao/' + documentacao.id);
        }
    }).catch((e) => {
        req.flash("error", "Não foi possível adicionar documentação:<br>" + e.message);
        res.render("documentacao/documentacao");
    });

};

api.documentacao = function (req, res) {
    if (req.params.id) {
        getDocumentacaoById(req.params.id).then(documentacao => {
            if (documentacao) {
                res.render("documentacao/documentacao", { documentacao: documentacao, error: req.flash("error"), success: req.flash("success") });
            } else {
                req.flash("error", "Documentacao não encontrada!");
                api.documentacoes(req, res);
            }
        });
    } else {
        res.render("documentacao/documentacao", { title: "Nova documentacao" });
    }
};


api.excluir = function (req, res) {
    if (req.params.id) {
        deleteDocumentacaoById(req.params.id).then(documentacao => {
            if (documentacao) {
                req.flash("success", "Documentacao excluída!");
                api.documentacoes(req, res);
            } else {
                req.flash("error", "Documentacao não encontrada!");
                api.documentacoes(req, res);
            }
        });
    }
};

api.documentacoes = function (req, res) {
    getDocumentacoes().then(documentacoes => {
        res.render("documentacao/documentacoes", { documentacoes, error: req.flash("error"), success: req.flash("success") });
    });
};

api.atividade = async function (req, res) {
    if (req.params.idDocumentacao && req.params.id) {
        let documentacao = await getDocumentacaoById(req.params.idDocumentacao);
        getAtividadeById(req.params.idDocumentacao, req.params.id).then(atividade => {
            if (documentacao) {
                res.render("atividade/atividade", { documentacao: documentacao, atividade: atividade, error: req.flash("error"), success: req.flash("success") });
            } else {
                req.flash("error", "Atividade não encontrada!");
                api.documentacoes(req, res);
            }
        });
    } else if (req.params.idDocumentacao) {
        let documentacao = await getDocumentacaoById(req.params.idDocumentacao);
        res.render("atividade/atividade", { title: "Nova Atividade", documentacao: documentacao });
    } else {
        api.documentacoes(req, res);
    }
};

api.excluirAtividade = function (req, res) {
    if (req.params.id && req.params.idDocumentacao) {
        deleteAtividadeById(req.params.idDocumentacao, req.params.id).then(atividade => {
            if (atividade) {
                req.flash("success", "Atividade excluída!");
                api.documentacoes(req, res);
            } else {
                req.flash("error", "Atividade não encontrada!");
                api.documentacoes(req, res);
            }
        });
    }
};

api.adicionarAtividade = function (req, res) {
    if (req.params.idDocumentacao) {
        insertAtividade(req.params.idDocumentacao, req.body).then(documentacao => {
            req.flash("success", "Atividade adicionada!");
            api.documentacao(req, res);
        }).catch((e) => {
            req.flash("error", "Não foi possível adicionar atividade:<br>" + e.message);
            api.documentacao(req, res);
        });
    }
};


module.exports = api;
