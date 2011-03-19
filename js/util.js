/**
 * Retorna uma cor aleat�ria
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
 * Remove os espa�os em branco no in�cio e no final de uma string
 * @param text O texto a ser tratado
 * @returns {String} O texto tratado
 */
function trim(text){
    return text.replace(/^\s+|\s+$/g,"");
}

/**
 * Adiciona zeros a n�meros menores que 10
 * @param i O n�mero a ser processado
 * @returns {String} O resultado do processamentos
 */
function addZero(i){
    if(i<10){
        return "0"+i;
    }
    return ""+i;
}

function removeAcents(text){
	text = text.replace(/[�|�|�|�|�]/i,"a");
	text = text.replace(/[�|�|�|�]/i,"e");
	text = text.replace(/[�|�|�|�]/i,"i");
	text = text.replace(/[�|�|�|�|�]/i,"o");
	text = text.replace(/[�|�|�|�]/i,"u");
	text = text.replace(/[�]/i,"c");
	return text;
}
/**
 * Retorna o texto de um erro HTTP
 * @param errorCode O c�digo de erro HTTP
 * @returns {String} O texto relacionado ao c�digo de erro HTTP em Portugu�s Brasileiro.
 */
function getHttpErrorText(errorCode){
	var errors = {
			"100":"Continua",
			"101":"Trocando Protocolos",
			"200":"OK",
			"201":"Criado",
			"202":"Aceito",
			"203":"Informa��o n�o autorizada",
			"204":"Nenhum conte�do",
			"205":"Redefinir conte�do",
			"206":"Conte�do parcial",
			"300":"M�ltiplas escolhas",
			"301":"Movido Permanentemente",
			"302":"Encontrado",
			"303":"Veja outros",
			"304":"N�o modificado",
			"305":"Use Proxy",
			"307":"Redirecionamento Tempor�rio",
			"400":"Requisi��o mal formada",
			"401":"N�o autorizado",
			"402":"Pagamento Obrigat�rio",
			"403":"Pro�bido",
			"404":"N�o Encontrado",
			"405":"M�todo n�o permitido",
			"406":"N�o � aceit�vel",
			"407":"Proxy",
			"408":"Tempo limite da requisi��o",
			"409":"Conflito",
			"410":"Ido",
			"411":"Comprimento Necess�rio",
			"412":"Pr�-condi��o falhou",
			"413":"Entidade de solicita��o muito grande",
			"414":"URI da requisi��o � muito grande",
			"415":"Tipo de m�dia n�o suportado",
			"416":"Faixa da requisi��o n�o satisfat�ria",
			"417":"Falha na expectativa",
			"500":"Error interno no servidor",
			"501":"N�o Implementado",
			"502":"Gateway Ruim",
			"503":"Servi�o indispon�vel",
			"504":"Tempo limite do Gateway",
			"505":"Vers�o do HTTP n�o suportada",
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



