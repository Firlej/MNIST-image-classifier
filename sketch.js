let nn;

let minw = 9999999;
let maxw = -9999999;

let target = [
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 1, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 1, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 1]
];

let wrong_digits = [];
let random_wrong_digit;

function setup(callback) {
    resizeCanvas(windowWidth, windowHeight);

    nn = new NeuralNetwork(784, [16, 16, 16], 10);

    nn.prepare_draw();

    callback();
}

function draw() {
    background(rgb(50, 50, 50));

    train(100);

    nn.draw();

    if (random_wrong_digit) {
        random_wrong_digit.digit.drawDigit();
    }

    fill("lime");
    font("25px Arial");
    textAlign("left");
    text(frameCount, 10, 30);
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    nn.prepare_draw();
}

function mousePressed(event) {
    if (event.button === 0) {
        random_wrong_digit = null;
    } else if (event.button === 2) {
        if (random_wrong_digit == null) {
            test();
        }
        random_wrong_digit = wrong_digits.random();
        for (let i = 0; i < random_wrong_digit.output.length; i++) {
            random_wrong_digit.output[i] = floor(random_wrong_digit.output[i] * 100) / 100;
        }
        console.log(random_wrong_digit);
    }
}

function train(n) {
    for (let i = 0; i < n; i++) {
        let index = floor(random(0, 10));
        nn.backpropagation(data[index].random(), target[index]);
    }
}

function test() {
    wrong_digits = [];
    let all = 0;
    let correct = 0;
    for (let i = 0; i < data.length; i++) {
        for (let j = 0; j < data[i].length; j++) {
            let output = nn.feed_forward(data[i][j]);
            let maxx = 0;
            let max_index = -1;
            for (let k = 0; k < output.length; k++) {
                if (output[k] > maxx) {
                    maxx = output[k];
                    max_index = k;
                }
            }
            if (max_index == i) {
                correct++;
            } else {
                wrong_digits.push({
                    digit: data[i][j],
                    value: i,
                    prediction: max_index,
                    output: output
                });
            }
            all++;
        }
    }
    console.clear();
    console.log("Correctness: " + (correct / all));
}

Array.prototype.drawDigit = function () {
    let a = width / 28;
    let b = height / 28;
    background(rgb(50, 50, 50));
    for (let i = 0; i < 28; i++) {
        for (let j = 0; j < 28; j++) {
            let index = j * 28 + i;
            let c = this[index] * 255;
            fill(rgba(c, c, c, 1));
            rect(i * a, j * b, a, b);
        }
    }
}