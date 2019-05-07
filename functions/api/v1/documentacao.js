const fb = require("../../firebase");
const Documentacao = require("../../model/Documentacao");
var path = require('path')

var api = {};

const bucket = fb.firebaseApp.storage().bucket();


/**
 * Upload the image file to Google Storage
 * @param {File} file object that will be uploaded to Google Storage
 */
async function uploadImageToStorage(file) {
    let prom = new Promise((resolve, reject) => {
        if (!file) {
            reject('No image file');
        }
        let newFileName = "Empresas/" + file.name + path.extname(file.originalname); //uqiue name

        let fileUpload = bucket.file(newFileName);
        const blobStream = fileUpload.createWriteStream({
            metadata: {
                contentType: file.mimetype
            }
        });

        blobStream.on('error', (error) => {
            reject('Something is wrong! Unable to upload at the moment.');
        });

        blobStream.on('finish', () => {
            /*
            const options = {
              action: 'read',
              expires: '03-17-2025'
            };
            // Get a signed URL for the file
            fileUpload
              .getSignedUrl(options)
              .then(results => {
                const url = results[0];
                resolve(url);
              })
            */
            const url = `https://storage.googleapis.com/${bucket.name}/${fileUpload.name}`; //image url from firebase server
            resolve(url);
        });

        blobStream.end(file.buffer);
    });
    return prom;
}

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

async function getDocumentacaoById(id) {
    const ref = await fb.firebaseApp.firestore().collection("Documentacao").doc(id).get();
    return ref.data();
}

async function deleteDocumentacaoById(id) {
    const ref = await fb.firebaseApp.firestore().collection("Documentacao").doc(id);
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
        res.render("documentacao");
    });

};

api.documentacao = function (req, res) {
    if (req.params.id) {
        getDocumentacaoById(req.params.id).then(documentacao => {
            if (documentacao) {
                res.render("documentacao", { documentacao: documentacao, error: req.flash("error"), success: req.flash("success") });
            } else {
                req.flash("error", "Documentacao não encontrada!");
                api.documentacoes(req, res);
            }
        });
    } else {
        res.render("documentacao", { title: "Nova documentacao" });
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
        res.render("documentacoes", { documentacoes, error: req.flash("error"), success: req.flash("success") });
    });
};

module.exports = api;
