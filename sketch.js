function setup(callback) {

    nn = new NeuralNetwork(784, [40, 40], 10);

    for (let i = 0; i < nn.layers[0].weights.data.length; i++) {
        let n_weights = nn.layers[0].weights.data[i];
        for (let j = 0; j < indexes.length; j++) {
            n_weights[indexes[j]] = 0;
        }
    }

    windowResized();

    nn.prepare_draw();

    setState(STATE.VISUALIZATION);

    background(rgb(0, 0, 0));
    callback();
}

function draw() {
    background(rgb(0, 0, 0));

    train(train_n);

    switch (STATE.current) {
        case STATE.VISUALIZATION: {
            nn.draw();
            break;
        }
        case STATE.PICTURE: {
            drawPicture();

            fill("lime");
            font("25px Arial");
            textAlign("center");
            text("Draw your digit", width * 0.5, height * 0.15);
            text("Press SPACE when finished", width * 0.5, height * 0.2);
            break;
        }
        case STATE.DIGIT: {
            digit_to_draw.digit.drawDigit();
            break;
        }
        case STATE.NEURON: {
            neuron_to_draw.drawNeuron();
            break;
        }
        default: {
            console.log("STATE ERROR");
        }
    }

    fill("lime");
    font("25px Arial");
    textAlign("right");
    text(digits_seen, width - 10, 30);

    // DOWNLOAD CANVAS TO JPG
    // document.getElementById('save_img').click();
}

function windowResized() {
    // resizeCanvas(windowWidth, windowHeight);
    let bar_height = windowHeight * 0.08;
    let val = min(windowWidth, windowHeight * 0.92);
    document.getElementById("bar").style.height = bar_height;
    resizeCanvas(val, val);

    nn.prepare_draw();
}

function mousePressed(event) {

    switch (STATE.current) {
        case STATE.VISUALIZATION: {
            break;
        }
        case STATE.PICTURE: {
            if (event.button === 0) {
                STATE.drawing = true;
                picture.push([]);
                picture.last().push(vec(mouseX, mouseY));
                picture.last().push(vec(mouseX, mouseY));
            }
            break;
        }
        case STATE.DIGIT: {
            if (event.button === 0) {
                STATE.drawing = true;
                picture.push([]);
                picture.last().push(vec(mouseX, mouseY));
                picture.last().push(vec(mouseX, mouseY));
                setState(STATE.PICTURE);
            }
            break;
        }
        case STATE.NEURON: {
            neuron_to_draw = nn.layers[0].weights.data.random();
            break;
        }
        default: {
            console.log("STATE ERROR");
        }
    }

    if (event.button === 2) {
        if (digit_to_draw == null) {
            test();
        }
        digit_to_draw = wrong_digits.random();
        for (let i = 0; i < digit_to_draw.output.length; i++) {
            digit_to_draw.output[i] = floor(digit_to_draw.output[i] * 100) / 100;
        }
        console.log(digit_to_draw);
    }
}

function mouseReleased() {
    switch (STATE.current) {
        case STATE.VISUALIZATION: {
            break;
        }
        case STATE.PICTURE: {
            if (event.button === 0) {
                STATE.drawing = false;
            }
            break;
        }
        case STATE.DIGIT: {
            break;
        }
        case STATE.NEURON: {
            break;
        }
        default: {
            console.log("STATE ERROR");
        }
    }
}

function mouseMoved() {
    if (STATE.drawing) {
        picture.last().push(vec(mouseX, mouseY));
    }
}

function keyPressed(keyCode) {
    // console.log(keyCode);

    if (STATE.current == STATE.PICTURE && keyCode == KEY.SPACE) {
        drawPicture();
        picture = [];
        let a = width / 28;
        let b = height / 28;

        var img = ctx.getImageData(0, 0, width, height);

        let digit = [];
        for (let y = 0; y < 28; y++) {
            for (let x = 0; x < 28; x++) {
                let avg = 0;
                let cnt = 0;
                for (let yy = floor(y * b); yy < (y + 1) * b; yy += 4) {
                    for (let xx = floor(x * a); xx < (x + 1) * a; xx += 4) {
                        let index = yy * 4 * width + xx * 4;
                        avg += img.data[index];
                        cnt++;
                    }
                }
                digit.push(avg / cnt / 255);
            }
        }
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
            value: -1,
            prediction: max_index,
            output: output
        };
        console.log(digit_to_draw);
        setState(STATE.DIGIT);
    }

    if (keyCode == KEY.THREE) {
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
    }

    if (keyCode == KEY.FOUR) {
        test();
    }
}