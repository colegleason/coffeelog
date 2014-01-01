// this will be the container we will putting images into
$.fn.partitionGallery = function(images) {
    images = $.makeArray(images);
    var container_width = this.width();
    var ideal_height = parseInt(this.height / 2);
    var summed_width = images.reduce(function(sum, image) {
        return sum + $(image).width();
    }, 0);
    var num_rows = Math.round(summed_width / container_width);

    if (num_rows < 1) {
        // only one row, so fallback to standard size
      images.forEach(function(image) {
       resize(image, parseInt(ideal_height * aspect_ratio(image)), ideal_height);
      });
    } else {
        // more than one row, distribute photos over the rows using aspect ratio as weight
        var weights = images.map(function(image) {
            return parseInt(aspect_ratio(image) * 100);
        });
        var partition = linear_partition(weights, num_rows);
        // Iterate through partition
        var index = 0;
        var row_buffer = [];
        partition.forEach(function(row) {
            row.forEach(function() {
                row_buffer.push(images[index++]);
            });
            var summed_ratios = row_buffer.reduce(function(sum, image) {
                return sum + aspect_ratio(image);
            }, 0);
            row_buffer.forEach(function(image) {
                resize(image, parseInt(container_width / summed_ratios * aspect_ratio(image)),
                             parseInt(container_width / summed_ratios));
            });
        });
        this.append(row_buffer);
    }
    return this;
};

function aspect_ratio(image) {
    return $(image).width() / $(image).height();
}

function resize(image, width, height) {
    $(image).width(width);
    $(image).height(height);
}

// Linear partition
// Partitions a sequence of non-negative integers into k ranges
// Based on Óscar López implementation in Python (http://stackoverflow.com/a/7942946)
// Also see http://www8.cs.umu.se/kurser/TDBAfl/VT06/algorithms/BOOK/BOOK2/NODE45.HTM
// Dependencies: UnderscoreJS (http://www.underscorejs.org)
// Example: linear_partition([9,2,6,3,8,5,8,1,7,3,4], 3) => [[9,2,6,3],[8,5,8],[1,7,3,4]]
function linear_partition(seq, k) {
    var n = seq.length;
    if (k <= 0)
        return [];
    if (k > n)
        return seq.map(function(x) { return [x]; });

    var table = initMatrix(k, n, 0);
    var solution = initMatrix(k-1, n-1, 0);

    for(var i = 0; i < n; i++) {
        table[i][0] = seq[i] + (i ? table[i-1][0] : 0);
    }
    for(var j = 0; j < k; j++) {
        table[0][j] = seq[0];
    }
    for(i = 1; i < n; i++) {
        for(j = 1; j < k; j++) {
            var m = min(Array(i).map(function(_, x) {
                return [max([table[x][j-1], table[i][0]-table[x][0]]), x];
            }), function(i) { return i[0]; });
            table[i][j] = m[0];
            solution[i-1][j-1] = m[1];
        }
    }

  n = n-1;
  k = k-2;
  var ans = [];
  while (k >= 0) {
      ans = [seq.slice(solution[n-1][k] + 1, n+1)].concat(ans);
      n = solution[n-1][k];
      k = k-1;
  }
    return [seq.slice(0, n+1)].concat(ans);
}

function min(items, iterator) {
    var result = {computed: Infinity, value: Infinity};
    items.forEach(function(item) {
        var value = iterator ? iterator(item) : item;
        if (value < result.value) result = {computed: item, value: value};
    });
    return result.value;
}

function max(items, iterator) {
    var result = {computed: -Infinity, value: -Infinity};
    items.forEach(function(item) {
        var value = iterator ? iterator(item) : item;
        if (value > result.value) result = {computed: item, value: value};
    });
    return result.value;
}

function initMatrix(height, width, value) {
    var matrix = Array(width);
    for(var i = 0; i < width; i++) {
        matrix[i] = Array(height);
        for(var j = 0; j < height; j++) {
            matrix[i][j] = value;
        }
    }
    return matrix;
};
