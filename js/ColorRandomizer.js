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