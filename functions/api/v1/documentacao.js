const fb = require("../../firebase");
const Documentacao = require("../../model/Documentacao");
const fs = require('fs');
const carbone = require('carbone');
var path = require('path');

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

async function getDocumentacaoByIdToDownload(id) {
    const ref = await fb.firebaseApp.firestore().collection("Documentacao").doc(id).get();
    const atividades = await fb.firebaseApp.firestore().collection('Documentacao').doc(id).collection('atividades').get();
    var documentacao = ref.data();
    documentacao.id = ref.id;
    documentacao.atividades = atividades.docs.map((doc) => {
        var dados = doc.data();
        //
        var endPoints = [];
        for (var key in dados.endPoints) {
            if (dados.endPoints.hasOwnProperty(key)) {
                endPoints.push(dados.endPoints[key])
            }
        }
        dados.endPoints = endPoints;
        //
        var componentes = [];
        for (var key in dados.componentes) {
            if (dados.componentes.hasOwnProperty(key)) {
                componentes.push(dados.componentes[key])
            }
        }
        dados.componentes = componentes;
        //
        var contatos = [];
        for (var key in dados.contatos) {
            if (dados.contatos.hasOwnProperty(key)) {
                contatos.push(dados.contatos[key])
            }
        }
        dados.contatos = contatos;
        //
        var roteiros = [];
        for (var key in dados.roteiros) {
            if (dados.roteiros.hasOwnProperty(key)) {
                roteiros.push(dados.roteiros[key])
            }
        }
        dados.roteiros = roteiros;
        //
        //
        var faqs = [];
        for (var key in dados.faqs) {
            if (dados.faqs.hasOwnProperty(key)) {
                faqs.push(dados.faqs[key])
            }
        }
        dados.faqs = faqs;
        //

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

async function downloadDocumentacaoById() {
    // Data to inject
    var data = {
        firstname: 'John',
        lastname: 'Doe'
    };

    // Generate a report using the sample template provided by carbone module
    // This LibreOffice template contains "Hello {d.firstname} {d.lastname} !"
    // Of course, you can create your own templates!
    carbone.render('./node_modules/carbone/examples/simple.odt', data, function (err, result) {
        if (err) {
            return console.log(err);
        }
        // write the result
        fs.writeFileSync('result.odt', result);
    });
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

slugify = function (textSlug) {
    return textSlug.toString().toLowerCase()
        .replace(/[àÀáÁâÂãäÄÅåª]+/g, 'a')       // Special Characters #1
        .replace(/[èÈéÉêÊëË]+/g, 'e')       	// Special Characters #2
        .replace(/[ìÌíÍîÎïÏ]+/g, 'i')       	// Special Characters #3
        .replace(/[òÒóÓôÔõÕöÖº]+/g, 'o')       	// Special Characters #4
        .replace(/[ùÙúÚûÛüÜ]+/g, 'u')       	// Special Characters #5
        .replace(/[ýÝÿŸ]+/g, 'y')       		// Special Characters #6
        .replace(/[ñÑ]+/g, 'n')       			// Special Characters #7
        .replace(/[çÇ]+/g, 'c')       			// Special Characters #8
        .replace(/[ß]+/g, 'ss')       			// Special Characters #9
        .replace(/[Ææ]+/g, 'ae')       			// Special Characters #10
        .replace(/[Øøœ]+/g, 'oe')       		// Special Characters #11
        .replace(/[%]+/g, 'pct')       			// Special Characters #12
        .replace(/\s+/g, '-')           		// Replace spaces with -
        .replace(/[^\w\-]+/g, '')       		// Remove all non-word chars
        .replace(/\-\-+/g, '-')         		// Replace multiple - with single -
        .replace(/^-+/, '')             		// Trim - from start of text
        .replace(/-+$/, '');            		// Trim - from end of text
};

api.download = function (req, res) {
    if (req.params.id) {
        getDocumentacaoByIdToDownload(req.params.id).then(documentacao => {
            if (documentacao) {
                carbone.render('report_template.odt', documentacao, function (err, result) {
                    if (err) {
                        return console.log(err);
                    }
                    fs.writeFileSync('/tmp/result.odt', result);
                    res.download('/tmp/result.odt', slugify(documentacao.modeloProcessoNegocio) + '-' + slugify(documentacao.dataCriacao) + '-' + slugify(documentacao.versao) + '.odt');
                    /*
                   fs.writeFileSync('result.odt', result);
                    res.download('result.odt', slugify(documentacao.modeloProcessoNegocio) + '-' + slugify(documentacao.dataCriacao) + '-' + slugify(documentacao.versao) + '.odt');
                    */
                });
            } else {
                req.flash("error", "Documentacao não encontrada!");
                api.documentacoes(req, res);
            }
        });
    } else {
        res.render("documentacao/documentacao", { title: "Nova documentacao" });
    }
};

module.exports = api;
