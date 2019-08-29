var api_v1 = require("../api/v1");

module.exports = function (app) {
  app.route("/painel/documentacao").get(api_v1.documentacao.documentacao);
  app.route("/painel/documentacao").post(api_v1.documentacao.adicionar);
  app.route("/painel/documentacao/:id").get(api_v1.documentacao.documentacao);
  app.route("/painel/documentacao/:id/excluir").post(api_v1.documentacao.excluir);
  app.route("/painel/documentacao/:id/download").get(api_v1.documentacao.download);
  app.route("/painel/documentacoes").get(api_v1.documentacao.documentacoes);
  
  app.route("/painel/documentacao/:idDocumentacao/atividade").get(api_v1.documentacao.atividade);
  app.route("/painel/documentacao/:idDocumentacao/atividade").post(api_v1.documentacao.adicionarAtividade);
  app.route("/painel/documentacao/:idDocumentacao/atividade/:id").get(api_v1.documentacao.atividade);
  app.route("/painel/documentacao/:idDocumentacao/atividade/:id/excluir").post(api_v1.documentacao.excluirAtividade);

};
