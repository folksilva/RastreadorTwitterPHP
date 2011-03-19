// Variáveis

/**
 * Tweets por consulta
 */
var tpc = 20;
/**
 * Intervalo das consultas em segundos (5 segundos por padrão)
 */
var idc = 60*3;
/**
 * Arquivo JSON com os termos de consulta padrão
 */
var defaultTermsFile = "data/defaultQuery.json";
/**
 * Array de termos de consulta
 */
var termsList = new Array();
/**
 * Array de termos de consulta
 */
var termsColorsList = new Array();
/**
 * Lista de tweets salvos
 */
var tweetsList = new Array();
/**
 * Lista de consultas executadas
 */
var queriesList = new Array();
/**
 * Lista de gráficos de pizza das consultas
 */
var pieChartsList = new Array();
/**
 * Número inteiro do próximo termo a ser criado
 */
var termNextId = 0;
/**
 * Número inteiro da próxima consula a ser criada
 */
var queryNextId = 0;
/**
 * Temporizador de consulta
 */
var queryTimer = null;
/**
 * Lista de registro histórico para o gráfico
 */
var historyList = new Array();
/**
 * Soma total de tweets
 */
var sumTweets = 0;
// Ouvintes de ação

/**
 * Adiciona um novo termo na lista
 */
function doAddTerm(){
	var termText = $("#txtTermo").val();
	if(termText != ""){
		$("#txtTermo").val("");
		addTerm(termText);
		consultar();
		return;
	}
	alert("Digite o texto a ser usado como termo da consulta.");
}

/**
 * Salva as alterações feitas nas configurações
 */
function doChangeSettings(){
	var tpcVal = $("#tpc").val();
	var idcVal = $("#idc").val();
	tpc = tpcVal != "" ? tpcVal : tpc;
	idc = idcVal != "" ? idcVal : idc;
	if(confirm("Quer realizar uma nova consulta com as novas configurações imediatamente?")){
		consultar();
	}
}

/**
 * Realiza uma nova consulta
 */
function doConsult(){
	consultar();
}

/**
 * Exibe/Oculta a consulta com o id informado
 * @param id O id da consulta
 */
function doToggle(id){
	$("#tb-query"+id).slideToggle("slow");
}

// Funções

/**
 * Inicializa a aplicação
 */
function init(){
	console.log("Ready...");
	$("#modalText").html("Iniciando o rastreador...");
	/**
	 * Gráfico de linha de histórico das consultas
	 */
	historyChart = new google.visualization.LineChart(document.getElementById('top-panel'));
	historyData = new google.visualization.DataTable();
    historyData.addColumn('string', 'Hora');
    historyData.addColumn('number', 'Total');
    gaugeData = new google.visualization.DataTable();
    gaugeData.addColumn('string', 'Label');
    gaugeData.addColumn('number', 'Value');
    gaugeData.addRows(1);
    gaugeChart = new google.visualization.Gauge(document.getElementById('gauge'));
	// Carregar os termos de consulta padrão
	loadDefaultQueryTerms();
	// Mostrando os valores padrão
	$("#tpc").val(tpc);
	$("#idc").val(idc);
	
}

/**
 * Carrega os termos de consulta padrão
 */
function loadDefaultQueryTerms(){
	$.getJSON(defaultTermsFile).success(function(data){
		if(data.q){
			for(var i = 0; i < data.q.length; i++){
				addTerm(data.q[i]);
			}
			consultar();
		}else{
			$("#terms").html("<div align='center' style='font-size:80%;color:#666666;'>Nenhum termo na consulta, adicione os termos que deseja.</div>");
			$("#modal").fadeOut();
		}
	}).error(function(xhr,status){
		var message = "Ocorreu um erro desconhecido, tente recarregar a página";
		switch(status){
			case "timeout":message = "A consulta atingiu o tempo limite. Tente novamente.";break;
			case "error":message = "O servidor respondeu com um erro: <i>(" + xhr.status + ") " + getHttpErrorText(xhr.status) + "</i>";break;
			case "abort":message = "A consulta foi cancelada.";break;
			case "parserror":message = "Não foi possível interpretar os dados recebidos.";break;
		}
		$("#terms").html("<div align='center' style='font-size:80%;color:#666666;'>"+message+"</div>");
		$("#modal").fadeOut();
		
	});
}

/**
 * Cria um objeto termo no array de termos da consulta
 * @param {String} text O texto a ser adicionado como termo da consulta
 */
function addTerm(text){
	var term = {
			text:text,
			color:getColor(),
			total:0,
			id:termNextId,
			enabled:true
	};
	termsColorsList.push(term.color);
	termsList.push(term);
	termNextId++;
	var termHTML = '<div class="qryItem" id="query'+term.id+'">';
	termHTML += '<label title="Clique para (des)ativar esse termo" style="font-size:90%;"><input onchange="changeTermEnabled('+term.id+')" type="checkbox" class="check" checked="'+(term.enabled ? "true" : "false")+'" id="ck-query'+term.id+'" />';
	termHTML += '<div class="color" title="'+term.text+'" style="background-color:'+term.color+';"></div>';
	termHTML += '<div class="text" title="'+term.text+'">'+term.text+'</div></label>';
	termHTML += '<div class="bullet" id="bullet'+term.id+'">'+Math.floor(term.total)+'</div></div>';
	$("#terms").append(termHTML);
	$("#query"+term.id).hide().fadeIn();
}

/**
 * Retorna o objeto termo com o id informado
 * @param id O ID do termo a ser encontrado
 * @returns {Object} O termo encontrado ou NULL se não existir
 */
function getByIdOnTermList(id){
	var term = termsList.filter(function(e,i,a){
		if(e.id == id)
			return true;
		return false;
	});
	return term;
}

/**
 * Retorna o indice no array de termos do objeto termo com o id informado
 * @param id O ID do termo a ser encontrado
 * @returns {Number} O índice termo encontrado ou -1 se não existir
 */
function getIdxByIdOnTermList(id){
	term = termsList.filter(function(e,i,a){
		if(e.id == id){
			e.arrIdx = i;
			return true;
		}
		return false;
	});
	r = term[0] != null ? term[0].arrIdx : -1; 
	return r;
}

/**
 * Verifica se a caixa de checagem do termo relacionado está ou não ativa e aplica essas alterações no objeto
 * @param termId O id do termo a ser checado
 */
function changeTermEnabled(termId){
	var ckStatus = $('#ck-query'+termId).attr("checked");
	var termIdx = getIdxByIdOnTermList(termId);
	var isEnabled = ckStatus == true || ckStatus == 1 ? true : false;
	var fade = isEnabled ? 1 : 0.5;
	termsList[termIdx].enabled = isEnabled;
	console.log("O termo " + termsList[termIdx].text + " foi " + (isEnabled ? "ativado" : "desativado") + "!");
	$("#query"+termId).fadeTo("slow",fade);
}

/**
 * Contabiliza os termos existentes usando a lista de tweets fornecida
 * @param list A lista de tweets para contabilizar
 * @return {Array} A lista de termos contabilizados
 */
function contabilizeTermsOn(list){
	var tmp = new Array();
	for(var i = 0; i < termsList.length; i++){
		var text = termsList[i].text;
		var term = {"term_id":termsList[i].id,"term_text":text,"term_count":0,"term_enabled":termsList[i].enabled};
		var tweetsCount = 0;
		for(var j = 0; j < list.length; j++){
			if(isInTweet(list[j],text)){
				term.term_count++;
			}
		}
		termsList[i].total += term.term_count;
		termPercent = (termsList[i].total*100)/sumTweets;
		console.log(text+": "+termPercent+"%");
		$("#bullet"+termsList[i].id).html(termsList[i].total).attr("title",Math.round(termPercent) + "% dos tweets");
		tmp.push(term);
	}
	return tmp;
}

/**
 * Verifica se o termo está no tweet
 * @param t O Tweet a ser verificado
 * @param q O termo a ser procurado
 * @returns {Boolean}
 */
function isInTweet(t,q){
	_t = t;
    q = removeAcents(q.toUpperCase());
    from_q = removeAcents(q.substring(1));
    from = removeAcents(t.from_user.toUpperCase());
    text = removeAcents(t.text);
    if(from.toUpperCase() == q){
        console.warn("Encontrado!");
        return true;
    }
    qIdx = text.toUpperCase().indexOf(q);
    if(qIdx >= 0){
        console.warn("Encontrado!");
        return true;
    }
    return false;
}

/**
 * Realiza uma consulta e processa os dados
 */
function consultar(){
	window.clearInterval(queryTimer);
	$("#modalText").html("Realizando uma nova consulta...");
	$("#modal").fadeIn();
	// Pega o resultado da consulta
	var TwitterURL  = "http://search.twitter.com/search.json?result_type=recent&rpp="+tpc+"&q=";
    for(var i = 0; i < termsList.length; i++){
    	var term = termsList[i];
    	if(term.enabled){
    		TwitterURL += i>0 ? "+OR+" : "";
            TwitterURL += escape(trim(term.text));
    	}
    }
    console.log("Requisitando " + TwitterURL + "...");
    $.getJSON("php/proxy.php",{u:TwitterURL},function(result){
        var tmpTweetsList = new Array();
        // Compara os tweets do resultado com os tweets salvos
    	for(var i = 0; i < result.results.length; i++){
    		var text = result.results[i].text;
    		var presence = 0;
    		if(tweetsList.length>0){
	    		for(var j = 0; j < tweetsList.length; j++){
	    			if(text == tweetsList[j].text){
	    				presence++;
	    			}
	    		}
    		}
    		// Cria uma lista de tweets novos
    		if(presence == 0){ 
    			tmpTweetsList.push(result.results[i]);
    			tweetsList.push(result.results[i]);
    		}
    	}
    	// Cria um objeto consulta e preenche os parâmetros
    	var tmpQuery = {
    			id:queryNextId,
    			date:new Date(),
    			newTweets:tmpTweetsList.length,
    			terms:contabilizeTermsOn(tmpTweetsList)
    	}
    	queryNextId++;
    	queriesList.push(tmpQuery);
    	// Exibe os resultados
    	refreshUi(tmpTweetsList,tmpQuery);
    	// Prepara o temporizador
    	var time = idc;
    	queryTimer = window.setInterval(function(){
    		$("#consultDelay-label").html("Nova consulta em "+time+"s...");
    		var w = Math.round((100*time)/idc);
    		$("#consultDelay-progress").animate({width:w+"%"});
    		time--;
    		if(time == -1){
    			consultar();
    		}
    	},1000);
        $("#modal").fadeOut();
    });
}

function refreshUi(newTweets, newQuery){
	historyLength = historyList.push({
		date:addZero(newQuery.date.getHours())+":"+addZero(newQuery.date.getMinutes())+":"+addZero(newQuery.date.getSeconds()),
		total:newQuery.newTweets
	});
	// Adiciona os tweets novos na timeline
	for(var t = 0; t < newTweets.length; t++){
		var tweet = newTweets[t];
		 tweetDate = new Date(tweet.created_at);
		var tweetHTML = "<div id='tweet"+tweet+"' class='twitt'>";
		tweetHTML += "<table border='0' cellpadding='0' cellspacing='0' width='100%'>";
		tweetHTML += "<tr><td width='32' valign='top'>";
		tweetHTML += "<img src='"+tweet.profile_image_url+"' class='avatar' />";
		tweetHTML += "</td><td>";
		tweetHTML += "<div class='tweet-text' title='"+addZero(tweetDate.getDate())+"/"+addZero(tweetDate.getMonth()+1)+"/"+tweetDate.getFullYear()+" às "+tweetDate.getHours()+":"+tweetDate.getMinutes()+"'><b>"+tweet.from_user+"</b><br>"+tweet.text+"</div>";
		tweetHTML += "</td></tr></table></div>";
		$("#timeline").prepend(tweetHTML);
	}
	// Cria os elementos DOM da consulta
	var newTweets = (newQuery.newTweets == 0 ? "nenhum" : newQuery.newTweets) + " novo" + (newQuery.newTweets > 1 ? "s tweets" : " tweet");
	var queryPieChartData = new google.visualization.DataTable();
	queryPieChartData.addColumn("string","Termo");
	queryPieChartData.addColumn("number","Total");
	queryPieChartData.addRows(newQuery.terms.length);
	var queryHTML = "<div id='query"+newQuery.id+"' onclick='doToggle("+newQuery.id+")' class='query-output'>"; 
	queryHTML += "<b>Consulta "+(newQuery.id+1)+" às "+addZero(newQuery.date.getHours())+":"+addZero(newQuery.date.getMinutes())+":"+addZero(newQuery.date.getSeconds())+": "+newTweets+"</b>";
	queryHTML += "<table id='tb-query"+newQuery.id+"' width='100%' cellspacing='0' cellpadding='0' border='0'><tr>";
	queryHTML += "<td width='150' height='150' id='pie"+newQuery.id+"'></td>";
	queryHTML += "<td>";
	
	// Alimenta os elementos DOM da consulta
	for(var i = 0; i < newQuery.terms.length; i++){
		var term = newQuery.terms[i];
		queryPieChartData.setValue(i,0,term.term_text);
		queryPieChartData.setValue(i,1,term.term_count);
		
		queryHTML += "<div class='queryTerm'><div class='queryTermText' title='"+term.term_text+"' "+(term.term_enabled ? "" : "style='text-decoration:line-through;'")+">"+term.term_text+"</div> "+(term.term_enabled ? term.term_count : '-')+"</div>";
	}
	queryHTML += "</td>";
	queryHTML += "</tr></table>";
	queryHTML += "</div>";
	$("#center-panel").prepend(queryHTML);
	$("#tb-query"+newQuery.id).hide().slideToggle("slow");
	$("#tb-query"+(newQuery.id-1)).slideUp("slow");
	// Cria o gráfico de Pizza da consulta
	var queryPieChart = new google.visualization.PieChart(document.getElementById("pie"+newQuery.id));
	queryPieChart.draw(queryPieChartData,{colors:termsColorsList,legend:'none',width:'100%',height:'100%'});
	// Atualiza o gráfico de linha
	historyData.addRows(historyLength);
	sumTweets = 0;
	var historyChartTitle = "Evolução dos Tweets - ";
	for(var h = 0; h < historyList.length; h++){
		historyData.setValue(h,0,historyList[h].date);
		historyData.setValue(h,1,historyList[h].total);
		sumTweets += historyList[h].total;
	}
	historyChartTitle += sumTweets + " no total";
    historyChart.draw(historyData, {title:historyChartTitle,legend:"none",chartArea:{width:"90%",height:"75%"}});
    // Atualiza as estatísticas
    var average = Math.round(sumTweets/historyLength);
    gaugeData.setValue(0,0,"Média");
    gaugeData.setValue(0,1,average);
    gaugeOptions = {max:tpc,min:0,redFrom: 0, redTo: tpc*0.125, yellowFrom:tpc*0.125, yellowTo: tpc*0.25, greenFrom: tpc*0.75, greenTo: tpc, minorTicks: 5};
    gaugeChart.draw(gaugeData, gaugeOptions);
}
