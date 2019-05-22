// var total = 2201;
// var c1Total = 325;
// var c2Total = 1876;
// var c1Yes = 203;
// var c1No = 122;
// var c2Yes = 508;
// var c2No = 1368;

// var result = 0.9077 - (c1Total/total)*(-(c1Yes/c1Total)*Math.log2(c1Yes/c1Total) - 
//     (c1No/c1Total) * Math.log2(c1No/c1Total)) - (c2Total/total)*(-(c2Yes/c2Total)*Math.log2(c2Yes/c2Total) - 
//     (c2No/c2Total) * Math.log2(c2No/c2Total))
// console.log(result);

var Entropy = (a, b, total) => {
    return -a/total * Math.log2(a/total) - b/total * Math.log2(b/total);
};

x = Entropy(126, 344, 470);
console.log(x * 470/2201);