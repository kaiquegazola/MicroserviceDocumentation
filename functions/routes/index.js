var api_v1 = require("../api/v1");

module.exports = function (app) {
  app.route("/painel/documentacao").get(api_v1.documentacao.documentacao);
  app.route("/painel/documentacao").post(api_v1.documentacao.adicionar);
  app.route("/painel/documentacao/:id").get(api_v1.documentacao.documentacao);
  app.route("/painel/documentacao/:id/excluir").post(api_v1.documentacao.excluir);
  app.route("/painel/documentacoes").get(api_v1.documentacao.documentacoes);
  //app.route("/painel/empresa/:id").post(api_v1.documentacao.atualizar);
  //app.route("/painel/empresa/desativar/:id").get(api_v1.documentacao.desativar);

};
