pragma circom 2.0.0;

include "../../node_modules/circomlib/circuits/comparators.circom";
// hint: you can use more than one templates in circomlib-matrix to help you
include "../../node_modules/circomlib-matrix/circuits/matMul.circom";
include "../../node_modules/circomlib-matrix/circuits/matSub.circom";
include "../../node_modules/circomlib-matrix/circuits/matElemPow.circom";
include "../../node_modules/circomlib-matrix/circuits/matElemSum.circom";
include "../../node_modules/circomlib-matrix/circuits/transpose.circom";


template SystemOfEquations(n) { // n is the number of variables in the system of equations
    signal input x[n]; // this is the solution to the system of equations
    signal input A[n][n]; // this is the coefficient matrix
    signal input b[n]; // this are the constants in the system of equations
    signal output out; // 1 for correct solution, 0 for incorrect solution

    // [bonus] insert your code here
    // Matrix dimension nxn and nx1
    component product = matMul(n, n, 1);

    // Calculate left hand side product of Ax = b
    for (var i = 0; i < n;i++) {
        for (var j = 0; j < n; j++) {
            product.a[i][j] <== A[i][j];
        }
        product.b[i][0] <== x[i];
    }

  // Generate array of subractions results b[i] - b'[i]
    // and check if sum(b[i] - b'[i]) == 0 and sum((b[i] - b'[i])^2) == 0 for all i
    component difference = matSub(n, 1);
    component sumOfDifference = matElemSum(n, 1);
    component sumOfPower = matElemSum(n, 1);
    component elemPow = matElemPow(n, 1, 2);
    component isSumOfDifferenceZero = IsZero();
    component isSumOfPowerZero = IsZero();

    // Calculate difference between left hand side and right hand side
    for (var i = 0; i < n; i++) {
        difference.a[i][0] <== b[i];
        difference.b[i][0] <== product.out[i][0];
    }

    // Sum the difference and calculate square of the difference
    for (var i = 0; i < n; i++) {
        sumOfDifference.a[i][0] <== difference.out[i][0];
        elemPow.a[i][0] <== difference.out[i][0];
    }

    // Sum the (b[i] - b'[i])^2
    for (var i = 0; i < n; i++) {
        sumOfPower.a[i][0] <== elemPow.out[i][0];
    }

    // Check if sum(b[i] - b'[i]) == 0
    isSumOfDifferenceZero.in <== sumOfDifference.out;

    // Check if sum((b[i] - b'[i])^2) == 0
    isSumOfPowerZero.in <== sumOfPower.out;

    // Check if both comparisons returned 1
    out <== isSumOfDifferenceZero.out * isSumOfPowerZero.out;
}

component main {public [A, b]} = SystemOfEquations(3);