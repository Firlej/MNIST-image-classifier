function sigmoid(x) {
    return 1 / (1 + Math.exp(-x));
}

function d_sigmoid(y) {
    return y * (1 - y);
}

class Layer {
    constructor(n_input, n_output, activation = sigmoid) {
        this.n_input = n_input;
        this.n_output = n_output;

        this.weights = (new Matrix(n_output, n_input)).randomize(-1, 1);
        this.bias = (new Matrix(n_output, 1)).randomize(-1, 1);
        this.activation = activation;

        this.last_activation = null;
        this.error = null;
        this.delta = null;
    }

    activate(inputs) {

        if (inputs.rows != this.n_input) {
            console.error("WRONG INPUT_ARRAY LENGTH");
        }

        this.last_activation = Matrix.multiply(this.weights, inputs).add(this.bias).each(sigmoid);

        return this.last_activation;
    }
}

class NeuralNetwork {
    constructor(n_input, n_hiddens, n_outputs) {

        this.layers = [];

        this.layers.push(new Layer(n_input, n_hiddens.first()));

        for (let i = 0; i < n_hiddens.length - 1; i++) {
            this.layers.push(new Layer(n_hiddens[i], n_hiddens[i + 1]));
        }

        this.layers.push(new Layer(n_hiddens.last(), n_outputs));

        this.last_input = null;
        this.last_result = null;

        this.learning_rate = 0.1;

        this.accuracy = [];
    }

    test(from = 0, to = 10) {
        wrong_digits = [];
        let all_correct = 0;
        for (let i = from; i < to; i++) {
            let correct = 0;
            for (let j = 0; j < test_data[i].length; j++) {
                let output = nn.feed_forward(test_data[i][j]);
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
                        digit: test_data[i][j],
                        value: i,
                        prediction: max_index,
                        output: output
                    });
                }
            }
            all_correct += correct;
            this.accuracy[i] = floor(correct / test_data[i].length * 1000) / 1000;
        }
        this.accuracy.total = all_correct / test_digits_count;
        this.accuracy.wrong_count = wrong_digits.length;
        console.log(this.accuracy);
    }

    feed_forward(inputs_array) {
        let inputs = Matrix.fromArray(inputs_array);
        this.last_input = inputs.copy();

        for (let i = 0; i < this.layers.length; i++) {
            inputs = this.layers[i].activate(inputs);
            // this.layers[i].weights.log();
        }

        this.last_result = inputs.copy();
        return Matrix.toArray(inputs);
    }

    backpropagation(inputs_array, targets_array) {
        if (inputs_array.length != this.layers.first().n_input) {
            console.error("WRONG INPUT_ARRAY LENGTH");
            return;
        } else if (targets_array.length != this.layers.last().n_output) {
            console.error("WRONG TARGET_ARRAY LENGTH");
            return;
        }

        let outputs = Matrix.fromArray(this.feed_forward(inputs_array));
        let targets = Matrix.fromArray(targets_array);

        for (let i = this.layers.length - 1; i >= 0; i--) {

            let layer = this.layers[i];

            if (i === this.layers.length - 1) {
                layer.error = targets.sub(outputs);
                layer.delta = layer.error.mult(outputs).each(d_sigmoid);
            } else {
                let next_layer = this.layers[i + 1];
                layer.error = Matrix.multiply(next_layer.weights.copy().transpose(), next_layer.delta);
                layer.delta = layer.error.mult(layer.last_activation.copy().each(d_sigmoid));
            }
        }

        for (let i = 0; i < this.layers.length; i++) {

            let layer = this.layers[i];

            if (i === 0) {
                let inputs_T = Matrix.fromArray(inputs_array).transpose();
                layer.weights.add(Matrix.multiply(layer.delta, inputs_T).mult(0.1));
                layer.bias.add(layer.delta.mult(0.1));
            } else {
                let inputs_T = this.layers[i - 1].last_activation.copy().transpose();
                layer.weights.add(Matrix.multiply(layer.delta, inputs_T).mult(0.1));
                layer.bias.add(layer.delta.mult(0.1));
            }
        }
    }
}

NeuralNetwork.prototype.prepare_draw = function () {

    this.neurons = [];

    let input_pos = width / (this.layers.length + 1);

    let arr = [];
    for (let j = 0; j < this.layers[0].weights.cols; j++) {
        arr.push({
            x: input_pos * 0.5,
            y: height / (this.layers[0].weights.cols + 1) * (j + 1),
        });
    }
    this.neurons.push(arr);

    for (let i = 0; i < this.layers.length; i++) {
        let arr = [];
        for (let j = 0; j < this.layers[i].weights.rows; j++) {
            arr.push({
                x: input_pos * (0.5 + 1 + i),
                y: height / (this.layers[i].weights.rows + 1) * (j + 1),
            });
        }
        this.neurons.push(arr);
    }
}

NeuralNetwork.prototype.draw = function () {
    background(rgb(50, 50, 50));

    for (let l = 0; l < this.layers.length; l++) {
        let weights = this.layers[l].weights;
        for (let i = 0; i < this.neurons[l].length; i++) {
            let a = this.neurons[l][i];
            for (let j = 0; j < this.neurons[l + 1].length; j++) {
                let b = this.neurons[l + 1][j];
                if (true || distSq(mouseX, mouseY, a.x, a.y) <= neron_radius_sq || distSq(mouseX, mouseY, b.x, b.y) <= neron_radius_sq) {

                    let weight = weights.data[j][i];

                    minw = min(weight, minw);
                    maxw = max(weight, maxw);

                    let red = 0;
                    let green = 128;
                    let blue = 0;

                    let alpha = 0;
                    if (weight > 0) {
                        alpha = map(weight, 0, maxw, 0, 1);
                        blue = map(weight, 0, maxw, 0, 255);
                    } else if (weight < 0) {
                        alpha = map(weight, 0, minw, 0, 1);
                        red = map(weight, 0, minw, 0, 255);
                    }

                    // red = map(weight,minw,maxw,255,0);
                    // blue = map(weight,minw,maxw,0,255);

                    lineWidth(1 + alpha * 2);
                    stroke(rgba(red, green, blue, pow(alpha, 2)));
                    line(a.x, a.y, b.x, b.y);
                }
            }
        }
    }

    fill(rgba(33, 33, 33, 1));
    for (let i = 0; i < this.neurons.length; i++) {
        for (let j = 0; j < this.neurons[i].length; j++) {
            let n = this.neurons[i][j];
            ellipse(n.x, n.y, neron_radius, neron_radius);
        }
    }
}

function train(n) {
    for (let i = 0; i < n; i++) {
        let index = floor(random(0, 10));
        nn.backpropagation(data[index].random(), target[index]);
    }
    digits_seen += n;
}