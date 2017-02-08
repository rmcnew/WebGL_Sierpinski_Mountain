// Richard McNew
// CS 5400
// Assignment 02:  Sierpinski Mountain

// Note:  I have commented out all of the console.log lines to improve performance.  
// Feel free to uncomment them if you would like to see the calculation details.
var gl;

var vertices = [0, 1, 0, 
                0.942809041582063, -1/3, 0,
               -0.471404520791032, -1/3, 0.816496580927726,
               -0.471404520791032, -1/3, -0.816496580927726 ];
                

// indexes into points to give triangles in draw order
var iterationTriangleIndices = {
    "iteration0":[0, 1, 2,
                  0, 2, 3,
                  0, 1, 3,
                  1, 2, 3 ]
};

// midpoint memoization hash
var midpoints = {};
 
var theta = 0;
var thetaLoc;

function indexPairHashcode(indexU, indexV) {
    return indexU.toString() + "_" + indexV.toString();
}

function v3(index) {
    return vec3(vertices[index*3], vertices[index*3 + 1], vertices[index*3 + 2]);
}

function getMidpoint(indexU, indexV) {
    //console.log(">>> getMidpoint with indexU: " + indexU + " = " + v3(indexU) + " and indexV: " + indexV  + " = " + v3(indexV) );
    var perturbFactor = 0.09;

    // get midpoint from hash if it is there
    if (midpoints[indexPairHashcode(indexU, indexV)]) {
        //console.log("getMidpoint:  Returning previously computed midpoint:  " + midpoints[indexPairHashcode(indexU, indexV)]);
        return midpoints[indexPairHashcode(indexU, indexV)];
    } else {  // otherwise, calculate and memoize it
        //console.log("getMidpoint:  No previously computed midpoint.  Calculating it . . .");
        // calculate midpoint
        var midpointUV = midpoint(v3(indexU), v3(indexV));
        //console.log("getMidpoint:  Calculated true midpoint:  " + midpointUV);
        // calculate line segment length
        var lengthUV = distance(v3(indexU), v3(indexV));
        //console.log("getMidpoint:  line segment length is:  " + lengthUV);
        // perturb midpoint
        var perturbedMidpointUV = perturb(midpointUV, lengthUV, perturbFactor);
        //console.log("getMidpoint:  perturbed midpoint is:  " + perturbedMidpointUV);
        // get next vertices array index
        var midpointUVvertexIndex = vertices.length / 3;
        //console.log("getMidpoint:  Next vertices index is:  " + midpointUVvertexIndex);
        // add newly calculated midpoint to vertices array
        vertices = vertices.concat(perturbedMidpointUV);
        //console.log("getMidpoint:  Saved perturbed midpoint to vertices.  vertices is now:  " + vertices + "  vertices.length is now:  " + vertices.length);
        // memoize the newly calculated midpoint for future lookup; hash both orderings
        midpoints[indexPairHashcode(indexU, indexV)] = midpointUVvertexIndex; 
        midpoints[indexPairHashcode(indexV, indexU)] = midpointUVvertexIndex; 
        //console.log("getMidpoint:  returning midpoint as:  " + midpoints[indexPairHashcode(indexU, indexV)]);
        return midpoints[indexPairHashcode(indexU, indexV)];
    }
}

function processSingleTriangle(indexA, indexB, indexC) {

    // calculate midpoints for each vertex pair
    var midpointAB = getMidpoint(indexA, indexB);
    var midpointAC = getMidpoint(indexA, indexC);
    var midpointBC = getMidpoint(indexB, indexC);

    // create four triangles from this triangle using new midpoint indices and previous indices (A, B, C)
    return [indexA, midpointAB, midpointAC,
            midpointAB, indexB, midpointBC,
            midpointAC, midpointBC, indexC,
            midpointAB, midpointBC, midpointAC]; 
}

// return an array of triangles that gives the Serpinski Mountain with 
// iteration given by iterationCount parameter
function computeSerpinskiMountainTriangles(iterationCount) {
    //console.log(">>> computeSerpinskiMountainPoints with iterationCount=" + iterationCount);
    if ( (typeof iterationCount === 'number') && (iterationCount >= 0) ) {
        if (iterationTriangleIndices["iteration" + iterationCount]) {
            //console.log("computeSerpinskiMoutainPoints:  returning pre-computed points for iteration" + iterationCount + ":  " + iterationTriangleIndices["iteration" + iterationCount]);
            return iterationTriangleIndices["iteration" + iterationCount];
        } else {
            // get the previous iteration indices
            //console.log("computeSerpinskiMountainTriangles:  recursive call for iterationCount=" + (iterationCount - 1));
            var previousIterationTriangleIndices = computeSerpinskiMountainTriangles(iterationCount - 1);
            //console.log("computeSerpinskiMountainTriangles:  results from recursive call for iterationCount=" + (iterationCount - 1) + ";  Results are: " + previousIterationTriangleIndices);

            // calculate the indices for this iteration
            var currentIterationTriangleIndices = [];
            for (var i = 0; i < previousIterationTriangleIndices.length; i += 3) {
                //console.log("computeSerpinskiMountainTriangles:  calling processSingleTriangle with parameters: " + 
                //             previousIterationTriangleIndices[i] + ", " +
                //             previousIterationTriangleIndices[i + 1] + ", " +
                //             previousIterationTriangleIndices[i + 2] );
                var result = processSingleTriangle( previousIterationTriangleIndices[i],
                                                    previousIterationTriangleIndices[i + 1],
                                                    previousIterationTriangleIndices[i + 2] );
                //console.log("computeSerpinskiMountainTriangles:  processSingleTriangle result:  " + result);
                currentIterationTriangleIndices = currentIterationTriangleIndices.concat(result);
                //console.log("computeSerpinskiMountainTriangles:  currentIterationTriangleIndices is now:  " + currentIterationTriangleIndices);
            }

            // store this iteration's indices
            iterationTriangleIndices["iteration" + iterationCount] = currentIterationTriangleIndices;

            // return this iteration's indices
            return currentIterationTriangleIndices;
        }
    } else {
        //console.log("computeSerpinskiMountainPoints:  Illegal argument!");
        return undefined;
    }
}

function iterationUpdate() {
    //console.log(">>> iterationUpdate");
    var iteration = parseInt(document.getElementById("iterationTextBox").value);
    //console.log("iteration is:  " + iteration);
    //console.log("vertices start value:  " + vertices);
    var triangleIndices = computeSerpinskiMountainTriangles(iteration);
    //console.log("triangleIndices.length is:  " + triangleIndices.length);
    //console.log("triangleIndices is:  " + triangleIndices);
	// clear the canvas with the clearing color and also clear hidden surface
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT ); 
    gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW );
    gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(triangleIndices), gl.STATIC_DRAW);
    theta = parseFloat(document.getElementById("zSlider").value);
    //console.log("theta is:  " + theta);
    gl.uniform1f(thetaLoc, theta);

	var primitiveType = gl.TRIANGLES;  // what primitive should be used?
	var offset = 0;                    // is the data offset?
	var count = triangleIndices.length;       // how many times should the routine run?
	gl.drawElements(primitiveType, count, gl.UNSIGNED_SHORT, offset);
}

window.onload = function init()
{
    var canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    //  Configure WebGL viewport
    gl.viewport( 0, 0, canvas.width, canvas.height );
	// set clearing color to white
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
	// enable hidden surface removal
    gl.enable(gl.DEPTH_TEST); 
    
    //  Load shaders and initialize attribute buffers
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    // Load the data into the GPU
    // *** vertices ***
    var verticesBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, verticesBuffer );
    // Associate out shader variables with our data buffer
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.enableVertexAttribArray( vPosition );
	var size = 3;          // components per iteration (point dimension)
	var type = gl.FLOAT;   // the data is 32bit floats
	var normalize = false; // don't normalize the data
	var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
	var offset = 0;        // start at the beginning of the buffer
	gl.vertexAttribPointer(vPosition, size, type, normalize, stride, offset)

    // *** rotation ***
    thetaLoc = gl.getUniformLocation(program, "theta");

    // *** indices ***
    var verticesIndicesBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, verticesIndicesBuffer);

    iterationUpdate();
};

