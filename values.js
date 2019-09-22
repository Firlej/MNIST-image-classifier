let data = [];
let test_data = [];

if (typeof data_train !== 'undefined') {
    data = data_train;
} else if (typeof data_min !== 'undefined') {
    data = data_min;
}

if (typeof data_test !== 'undefined') {
    test_data = data_test;
} else if (typeof data_min !== 'undefined') {
    test_data = data_min;
}

let train_digits_count = 0;
let test_digits_count = 0;

for (let i = 0; i < data.length; i++) {
    train_digits_count += data[i].length;
}

for (let i = 0; i < test_data.length; i++) {
    test_digits_count += test_data[i].length;
}

let minw = 9999999;
let maxw = -9999999;

let nn;

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
let digit_to_draw;

let neuron_to_draw = null;

let train_n = 10;
let digits_seen = 0;

let drawing = false;
let picture = [];


let neron_radius = 6;
let neron_radius_sq = pow(neron_radius, 2);

const STATE = {
    current: 0,
    VISUALIZATION: 0,
    PICTURE: 1,
    DIGIT: 2,
    RANDOM_WRONG: 3,
    RANDOM: 4,
    TEST: 5,
    NEURON: 6,
    drawing: false,
};

let indexes = [0, 1, 2, 3, 24, 25, 26, 27, 28, 29, 30, 53, 54, 55, 56, 57, 82, 83, 84, 111, 672, 699, 700, 701, 726, 727, 728, 729, 730, 753, 754, 755, 756, 757, 758, 759, 780, 781, 782, 783];

let setState = (s) => {
    switch (s) {
        case STATE.VISUALIZATION: {
            STATE.current = STATE.VISUALIZATION;
            break;
        }
        case STATE.PICTURE: {
            STATE.current = STATE.PICTURE;
            break;
        }
        case STATE.DIGIT: {
            STATE.current = STATE.DIGIT;
            break;
        }
        case STATE.RANDOM_WRONG: {
            if (digit_to_draw == null) {
                nn.test();
            }
            digit_to_draw = wrong_digits.random();
            for (let i = 0; i < digit_to_draw.output.length; i++) {
                digit_to_draw.output[i] = floor(digit_to_draw.output[i] * 100) / 100;
            }
            console.log(digit_to_draw);
            setState(STATE.DIGIT);
            break;
        }
        case STATE.RANDOM: {
            let index = floor(random(0, 10))
            let digit = test_data[index].random();
            let output = nn.feed_forward(digit);
            let maxx = 0;
            let max_index = -1;
            for (let k = 0; k < output.length; k++) {
                if (output[k] > maxx) {
                    maxx = output[k];
                    max_index = k;
                }
            }
            digit_to_draw = {
                digit: digit,
                value: index,
                prediction: max_index,
                output: output
            };
            console.log(digit_to_draw);
            setState(STATE.DIGIT);
            break;
        }
        case STATE.TEST: {
            nn.test();
            setState(STATE.VISUALIZATION);
            break;
        }
        case STATE.NEURON: {
            if (neuron_to_draw === null) {
                neuron_to_draw = nn.layers[0].weights.data.random();
            }
            STATE.current = STATE.NEURON;
            break;
        }
        default: {
            console.log("STATE ERROR");
        }
    }
}

function drawPicture() {
    background(rgb(0, 0, 0));
    let size = height / 12;
    lineWidth(size);
    stroke(rgba(255, 255, 255, 1));
    fill(rgba(255, 255, 255, 1));
    let a = width / 28;
    let b = height / 28;
    for (let i = 0; i < picture.length; i++) {
        for (let j = 0; j < picture[i].length - 2; j++) {
            ellipse(picture[i][j].x, picture[i][j].y, size / 2, size / 2);
            line(picture[i][j].x, picture[i][j].y, picture[i][j + 1].x, picture[i][j + 1].y);
            line(picture[i][j].x, picture[i][j].y, picture[i][j + 2].x, picture[i][j + 2].y);
        }
    }
}

Array.prototype.drawDigit = function () {
    let a = width / 28;
    let b = height / 28;
    background(rgb(0, 0, 0));
    for (let i = 0; i < 28; i++) {
        for (let j = 0; j < 28; j++) {
            let index = j * 28 + i;
            let c = this[index] * 255;
            fill(rgba(c, c, c, 1));
            rect(i * a, j * b, a, b);
        }
    }
}

Array.prototype.drawNeuron = function () {
    let a = width / 28;
    let b = height / 28;
    background(rgb(0, 0, 0));

    let nnn = 100000;
    let xxx = -100000;

    for (let i = 0; i < this.length; i++) {
        nnn = min(nnn, this[i]);
        xxx = max(xxx, this[i]);
    }

    for (let i = 0; i < this.length; i++) {

        let x = floor(i / 28);
        let y = i % 28;

        let red = 0;
        let green = 0;
        let blue = 0;

        if (this[i] > 0) {
            blue = map(this[i], 0, xxx, 0, 255);
        } else if (this[i] < 0) {
            red = map(this[i], 0, nnn, 0, 255);
        }

        fill(rgba(red, green, blue, 1));
        rect(x * a, y * b, a, b);
    }
}

function download_img(el) {
    el.href = canvas.toDataURL("image/jpg");
};