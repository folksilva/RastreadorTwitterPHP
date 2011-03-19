/**
 * Retorna uma cor aleatória
 * @returns <String> Uma cor em formato hexadecimal
 */
function getColor(){
    var r = Math.floor(Math.random()*256);
    var g = Math.floor(Math.random()*256);
    var b = Math.floor(Math.random()*256);
    var R = r.toString(16);
    R = R.length < 2 ? "0"+R : R;
    var G = g.toString(16);
    G = G.length < 2 ? "0"+G : G;
    var B = b.toString(16);
    B = B.length < 2 ? "0"+B : B;
    return "#"+R+G+B;
}

/**
 * Remove os espaços em branco no início e no final de uma string
 * @param text O texto a ser tratado
 * @returns {String} O texto tratado
 */
function trim(text){
    return text.replace(/^\s+|\s+$/g,"");
}

/**
 * Adiciona zeros a números menores que 10
 * @param i O número a ser processado
 * @returns {String} O resultado do processamentos
 */
function addZero(i){
    if(i<10){
        return "0"+i;
    }
    return ""+i;
}

function removeAcents(text){
	text = text.replace(/[à|á|ã|â|ä]/i,"a");
	text = text.replace(/[è|é|ê|ë]/i,"e");
	text = text.replace(/[ì|í|î|ï]/i,"i");
	text = text.replace(/[ò|ó|õ|ô|ö]/i,"o");
	text = text.replace(/[ù|ú|û|ü]/i,"u");
	text = text.replace(/[ç]/i,"c");
	return text;
}
/**
 * Retorna o texto de um erro HTTP
 * @param errorCode O código de erro HTTP
 * @returns {String} O texto relacionado ao código de erro HTTP em Português Brasileiro.
 */
function getHttpErrorText(errorCode){
	var errors = {
			"100":"Continua",
			"101":"Trocando Protocolos",
			"200":"OK",
			"201":"Criado",
			"202":"Aceito",
			"203":"Informação não autorizada",
			"204":"Nenhum conteúdo",
			"205":"Redefinir conteúdo",
			"206":"Conteúdo parcial",
			"300":"Múltiplas escolhas",
			"301":"Movido Permanentemente",
			"302":"Encontrado",
			"303":"Veja outros",
			"304":"Não modificado",
			"305":"Use Proxy",
			"307":"Redirecionamento Temporário",
			"400":"Requisição mal formada",
			"401":"Não autorizado",
			"402":"Pagamento Obrigatório",
			"403":"Proíbido",
			"404":"Não Encontrado",
			"405":"Método não permitido",
			"406":"Não é aceitável",
			"407":"Proxy",
			"408":"Tempo limite da requisição",
			"409":"Conflito",
			"410":"Ido",
			"411":"Comprimento Necessário",
			"412":"Pré-condição falhou",
			"413":"Entidade de solicitação muito grande",
			"414":"URI da requisição é muito grande",
			"415":"Tipo de mídia não suportado",
			"416":"Faixa da requisição não satisfatória",
			"417":"Falha na expectativa",
			"500":"Error interno no servidor",
			"501":"Não Implementado",
			"502":"Gateway Ruim",
			"503":"Serviço indisponível",
			"504":"Tempo limite do Gateway",
			"505":"Versão do HTTP não suportada",
	};
	return errors[errorCode];
}
















/**
 * Set up Array Filter compability
 */
if (!Array.prototype.filter){
	Array.prototype.filter = function(fun /* , thisp */){
		"use strict";
		if (this === void 0 || this === null)
			throw new TypeError();
		var t = Object(this);
		var len = t.length >>> 0;
		if (typeof fun !== "function")
			throw new TypeError();
		var res = [];
		var thisp = arguments[1];
		for (var i = 0; i < len; i++){
			if (i in t){
				var val = t[i]; // in case fun mutates this
				if (fun.call(thisp, val, i, t))
				res.push(val);
			}
		}
		return res;
	};
}



