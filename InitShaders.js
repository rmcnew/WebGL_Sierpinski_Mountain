//
//  initShaders.js
//

function createShader(gl, type, source) {
  var shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (success) {
    return shader;
  }
   
  console.log("Shader failed to compile.  The error log is <pre>" + gl.getShaderInfoLog(shader) + "</pre>");
  gl.deleteShader(shader);
}



function createProgram(gl, vertexShader, fragmentShader) {
  var program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  var success = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (success) {
    return program;
  }
 
  console.log("Shader program failed to link.  The error log is:  <pre>" + gl.getProgramInfoLog(program) + "</pre>");
  gl.deleteProgram(program);
}



function initShaders( gl, vertexShaderId, fragmentShaderId )
{
    var vertexShaderSource = document.getElementById(vertexShaderId).text;
    var fragmentShaderSource = document.getElementById(fragmentShaderId).text;
     
    var vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    var fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);


    var program = createProgram(gl, vertexShader, fragmentShader);
    return program;

}
