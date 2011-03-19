// Variáveis
var queries = Array();
var historyarr = Array();
var historyChartTitle = "";
var nextId = 0;
var pieData = null;
var historyData = null;
var updateInterval = null;

// Ouvintes de ação
function formSubmitHandler(){
    var text = $("#txtQueryAdd").val();
    if(text.length > 0){
        addQuery(text);
        $("#txtQueryAdd").val("");
    }
}
function btnRefreshHandler(){
    updateQueries();
}

// Funções
function init(){
    // Carregar dados primarios
    loadDefaultQuery();
    // Atribuir ouvintes de ação
    $("#btnRefresh").click(function(){btnRefreshHandler();});
    
    $("#modal").hide();    
}

function drawCharts(colors){
    drawHistoryChart(colors);
    drawPieChart(colors);
}

function drawHistoryChart(colors) { 
    var chart = new google.visualization.LineChart(document.getElementById('history_graph'));
    chart.draw(historyData, {title: historyChartTitle,titleTextStyle:{textAlign:"center"},legend:"none",colors:colors});
}

function drawPieChart(colors) {
    var chart = new google.visualization.PieChart(document.getElementById('composite_graph'));
    chart.draw(pieData, {chartArea:{width:"90%",height:"90%"},is3D:false,legend:"bottom",colors:colors});
}

function loadDefaultQuery(){
    $("#h").html("Iniciando...");
    $.getJSON("data/defaultQuery.json",function(data){
        if(data.q){
            for(var i = 0; i < data.q.length; i++){
                var q = data.q[i];
                queries.push({text:q,color:getColor(),id:nextId,history:new Array()});
                nextId++;
            }
            updateQueries();
        }
    });
}

function addQuery(text){
    var h = new Array();
    for(var i = 0; i < historyarr.length; i++){
        h.push(0);
    }
    queries.push({text:text,color:getColor(),id:nextId,history:h});
    nextId++;
    updateQueries();
}

function removeQuery(id){
    var finalQueries = new Array();
    for(var i = 0; i < queries.length; i++){
        if(queries[i].id != id){
            finalQueries.push(queries[i]);    
        }
    }
    queries = finalQueries;
    updateQueries();
}

function updateQueries(){
    $("#modal").fadeIn();
    $("#h").html("Atualizando...");
    $("#btnRefresh").attr("disabled",true);
    $("#btnQueryAdd").attr("disabled",true);
    $("#txtQueryAdd").attr("disabled",true);
    window.clearInterval(updateInterval);
    var today = new Date();
    var TwitterURL  = "http://search.twitter.com/search.json?result_type=recent&rpp=100&q=";
    for(var i = 0; i < queries.length; i++){
        TwitterURL += i>0 ? "+OR+" : "";
        TwitterURL += escape(trim(queries[i].text));
    }
    console.log("Requisitando " + TwitterURL + "...");
    $.getJSON("rastreador-proxy.php",{u:TwitterURL},function(d){
        data = d;
        $("#last_twitts").html("");
        var results = data.results;
        for(i=0;i<results.length;i++){
            var result = results[i];
            $("#last_twitts").append("<div class='twitt'><table border='0' cellpadding='0' cellspacing='0' width='100%'><tr><td width='32' valign='middle'><img src='"+result.profile_image_url+"' class='avatar' /></td><td><div class='text'><b>"+result.from_user+"</b><br>"+result.text+"</div></td></tr></table></div>");
        }
        $("#queries").html("");
        
        pieData = new google.visualization.DataTable();
        pieData.addColumn('string', 'Busca');
        pieData.addColumn('number', 'Twitts');
        pieData.addRows(queries.length);
        
        historyData = new google.visualization.DataTable();
        historyData.addColumn('string', 'Hora');
        
        var totalTwitts = 0;
        colors = new Array();
        var historyLength = historyarr.push({timestamp:null,total:null});
        historyData.addRows(historyLength);
        
        for(var i = 0; i < queries.length; i++){
            var queryTwitts = 0;
            for(var t = 0; t < results.length; t++){
                if(isInTwitt(results[t],queries[i].text)){
                    queryTwitts++;
                }
            }
            queries[i].history.push(queryTwitts);
            var query = queries[i];
            var total = query.history[query.history.length-1];
            totalTwitts += parseInt(total);
            pieData.setValue(i, 0, query.text);
            pieData.setValue(i, 1, Math.floor(total));
            historyData.addColumn('number', query.text);
            colors.push(query.color);
            $("#queries").append('<div title="Clique para remover" class="qryItem" onclick="removeQuery('+query.id+')" id="query'+query.id+'"><div class="color" style="background-color:'+query.color+';"></div>'+query.text+' <div class="bullet">'+Math.floor(total)+'</div></div>');
        }
        
        historyarr[historyLength-1].timestamp = new Date();
        historyarr[historyLength-1].total = totalTwitts;
        
        var absolutelyTotalTwitts = 0;
        var startTime = historyarr[0].timestamp;
        for(var k = 0; k < historyarr.length; k++){
            absolutelyTotalTwitts += parseInt(historyarr[k].total);
            h = historyarr[k].timestamp;
            historyData.setValue(k, 0, addZero(h.getHours())+":"+addZero(h.getMinutes())+":"+addZero(h.getSeconds()));
            for(var j = 0; j < queries.length; j++){
                historyData.setValue(k, j+1, Math.floor(queries[j].history[k]));
            }
        }
        var finalTime = historyarr[k-1].timestamp;
        var totalTime = finalTime.getTime() - startTime.getTime();
        var strTotal = "";
        if(totalTime < 1000*60){
            strTotal = Math.floor(totalTime / 1000) + " segundo(s)";
        }else if(totalTime < 1000*60*60){
            strTotal = Math.floor(totalTime / (1000*60)) + " minuto(s)";
        }else if(totalTime < 1000*60*60*24){
            strTotal = Math.floor(totalTime / (1000*60*60)) + " hora(s)";
        }else{
            strTotal = Math.floor(totalTime / (1000*60*60*24)) + " dia(s)";
        }
        historyChartTitle = "Histórico do Twitter - " + absolutelyTotalTwitts + " twitts em " + strTotal + " de rastreamento";
        $("#h").html(totalTwitts + " Twitts");
        drawCharts(colors);
        $("#btnRefresh").html("Atualizar em 120s...");
        var secondsToUpdate = 120;
        updateInterval = window.setInterval(function(){
            secondsToUpdate --;
            $("#btnRefresh").html("Atualizar em "+secondsToUpdate+"s...");
            if(secondsToUpdate == 0){
                window.clearInterval(updateInterval);
                updateQueries();
            }
        },1000);
        
        $("#btnRefresh").attr("disabled",false);
        $("#btnQueryAdd").attr("disabled",false);
        $("#txtQueryAdd").attr("disabled",false);
        $("#modal").fadeOut();
    });
}

function isInTwitt(t,q){
    q = q.toUpperCase();
    from_q = q.substring(1);
    from = t.from_user.toUpperCase();
    text = t.text;
    console.log("Buscando por " + from_q + " em " + from);
    if(from.toUpperCase() == q){
        console.warn("Encontrado!");
        return true;
    }
    console.log("Buscando por " + q + " em " + text);
    qIdx = text.toUpperCase().indexOf(q);
    if(qIdx >= 0){
        console.warn("Encontrado!");
        return true;
    }
    return false;
}

function trim(text){
    return text.replace(/^\s+|\s+$/g,"");
}

function addZero(i){
    if(i<10){
        return "0"+i;
    }
    return ""+i;
}