"use strict";

const Filters = {};

////////////////////////////////////////////////////////////////////////////////
// General utility functions
////////////////////////////////////////////////////////////////////////////////

// Hardcoded Pi value
// const pi = 3.14159265359;
const pi = Math.PI;

// Constrain val to the range [min, max]
function clamp(val, min, max) {
    /* Shorthand for:
    * if (val < min) {
    *   return min;
    * } else if (val > max) {
    *   return max;
    * } else {
    *   return val;
    * }
    */
    return val < min ? min : val > max ? max : val;
}

// Extract vertex coordinates from a URL string
function stringToCoords(vertsString) {
    const centers = [];
    const coordStrings = vertsString.split("x");
    for (let i = 0; i < coordStrings.length; i++) {
        const coords = coordStrings[i].split("y");
        const x = parseInt(coords[0]);
        const y = parseInt(coords[1]);
        if (!isNaN(x) && !isNaN(y)) {
            centers.push({ x: x, y: y });
        }
    }

    return centers;
}

// Blend scalar start with scalar end. Note that for image blending,
// end would be the upper layer, and start would be the background
function blend(start, end, alpha) {
    return start * (1 - alpha) + end * alpha;
}

// ----------- STUDENT CODE BEGIN ------------
// ----------- Our reference solution uses 72 lines of code.
// ----------- STUDENT CODE END ------------

////////////////////////////////////////////////////////////////////////////////
// Filters
////////////////////////////////////////////////////////////////////////////////

// You've already implemented this in A0! Feel free to copy your code into here
Filters.fillFilter = function(image, color) {
    for (var x = 0; x < image.width; x++) {
        for (var y = 0; y < image.height; y++) {
          // uncomment this line to enable this function
          image.setPixel(x, y, color);
        }
      }
      return image;
};

// You've already implemented this in A0! Feel free to copy your code into here
Filters.brushFilter = function(image, radius, color, vertsString) {
    // centers is an array of (x, y) coordinates that each defines a circle center
    var centers = stringToCoords(vertsString);

    for (var i = 0; i < centers.length; i++){
      image.setPixel(centers[i]["x"], centers[i]["y"], color);
      for (var x = centers[i]["x"] - radius; x <= centers[i]["x"] + radius; x++) {
        for (var y = centers[i]["y"] - radius; y <= centers[i]["y"] + radius; y++) {
          if(Math.sqrt(Math.pow(x - centers[i]["x"], 2) + Math.pow(y - centers[i]["y"], 2)) <= radius)
            image.setPixel(x, y, color);
        }
      }
    }

    return image;
};

// You've already implemented this in A0! Feel free to copy your code into here
Filters.softBrushFilter = function(image, radius, color, alpha_at_center, vertsString) {
    // centers is an array of (x, y) coordinates that each defines a circle center
    var centers = stringToCoords(vertsString);
    var color_a = color; 
    
    for (var i = 0; i < centers.length; i++){
        for (var x = centers[i]["x"] - radius; x <= centers[i]["x"] + radius; x++) {
          for (var y = centers[i]["y"] - radius; y <= centers[i]["y"] + radius; y++) {
            if(Math.sqrt(Math.pow(x - centers[i]["x"], 2) + Math.pow(y - centers[i]["y"], 2)) <= radius){
                
                // Calculating linear change of alpha
                var distance = Math.sqrt(Math.pow(x - centers[i]["x"], 2) + Math.pow(y - centers[i]["y"], 2));
                console.log("distance: " + distance + " radius: " + radius);
                var change_alpha = alpha_at_center * (1-(distance/radius));  
    
                // get original pixel
                var original_pixel = image.getPixel(x, y);
    
                // formula to calculate color of the new pixel
                var alpha_zero = alpha_at_center + 1 * (1 - alpha_at_center); 
                //console.log("alpha zero: " + alpha_zero);
    
                //console.log("change_alpha " + change_alpha);
    
                // creating color 
                var red = [color_a.data[0] * change_alpha + original_pixel.data[0] * (1 - change_alpha)]/alpha_zero;
                var green = [color_a.data[1] * change_alpha + original_pixel.data[1] * (1 - change_alpha)]/alpha_zero;
                var blue =  [color_a.data[2] * change_alpha + original_pixel.data[2] * (1 - change_alpha)]/alpha_zero;
               // console.log("red " + red);
    
                // setting color of new pixel
                var pixel = new Pixel(red, green, blue, alpha_zero, "rgb");
                image.setPixel(x, y, pixel);
            }
                
          }
        }
      }

    return image;
};

// Ratio is a value in the domain [-1, 1]. When ratio is < 0, linearly blend the image
// with black. When ratio is > 0, linearly blend the image with white. At the extremes
// of -1 and 1, the image should be completely black and completely white, respectively.
Filters.brightnessFilter = function(image, ratio) {
    let alpha, dirLuminance;
    if (ratio < 0.0) {
        alpha = 1 + ratio;
        dirLuminance = 0; // blend with black
    } else {
        alpha = 1 - ratio;
        dirLuminance = 1; // blend with white
    }

    for (let x = 0; x < image.width; x++) {
        for (let y = 0; y < image.height; y++) {
            const pixel = image.getPixel(x, y);

            pixel.data[0] = alpha * pixel.data[0] + (1 - alpha) * dirLuminance;
            pixel.data[1] = alpha * pixel.data[1] + (1 - alpha) * dirLuminance;
            pixel.data[2] = alpha * pixel.data[2] + (1 - alpha) * dirLuminance;

            image.setPixel(x, y, pixel);
        }
    }

    return image;
};

// Reference at this:
//      https://en.wikipedia.org/wiki/Image_editing#Contrast_change_and_brightening
// value = (value - 0.5) * (tan ((contrast + 1) * PI/4) ) + 0.5;
// Note that ratio is in the domain [-1, 1]
Filters.contrastFilter = function(image, ratio) {

    // Going through entire image
    for (var x = 0; x < image.width; x++) {
        for (var y = 0; y < image.height; y++) {
            if (ratio !== 0){
                let pixel = image.getPixel(x, y);
                // const pixel = rgb.rgbToHsl(); uncomment this line for art submission
                
                pixel.data[0] = clamp((pixel.data[0] - .5) * (Math.tan((ratio + 1) * Math.PI/4)) + .05, 0, 1);
                pixel.data[1] = clamp((pixel.data[1] - .5) * (Math.tan((ratio + 1) * Math.PI/4)) + .05, 0, 1);
                pixel.data[2] = clamp((pixel.data[2] - .5) * (Math.tan((ratio + 1) * Math.PI/4)) + .05, 0, 1);

                image.setPixel(x, y, pixel);
            }
        }
    }
    return image;
};

// Note that the argument here is log(gamma)
Filters.gammaFilter = function(image, logOfGamma) {
    const gamma = Math.exp(logOfGamma);

    // Going through entire image
    for (var x = 0; x < image.width; x++) {
        for (var y = 0; y < image.height; y++) {

            let pixel = image.getPixel(x, y);

            pixel.data[0] = clamp(Math.pow(pixel.data[0], gamma), 0, 1);
            pixel.data[1] = clamp(Math.pow(pixel.data[1], gamma), 0, 1);
            pixel.data[2] = clamp(Math.pow(pixel.data[2], gamma), 0, 1);

            image.setPixel(x, y, pixel);
            
        }
    }
    
    return image;
};

/*
* The image should be perfectly clear up to innerRadius, perfectly dark
* (black) at outerRadius and beyond, and smoothly increase darkness in the
* circular ring in between. Both are specified as multiples of half the length
* of the image diagonal (so 1.0 is the distance from the image center to the
* corner).
*
* Note that the vignette should still form a perfect circle!
*/
Filters.vignetteFilter = function(image, innerR, outerR) {
    // Let's ensure that innerR is at least 0.1 smaller than outerR
    innerR = clamp(innerR, 0, outerR - 0.1);

    // finding center of circle
    var center_x = image.width/2;
    var center_y = image.height/2;

    // calculating half_diag
    var half_diag = Math.sqrt(Math.pow(image.width, 2) + Math.pow(image.height, 2))/2;

    // going through all the pixels in image 
    for (var x = 0; x < image.width; x++) {
        for (var y = 0; y < image.height; y++) {
            let distance = Math.sqrt(Math.pow(x - center_x, 2) + Math.pow(y - center_y, 2))/half_diag;

            let pixel = image.getPixel(x, y);
            
            // if outside outter fill black
            if(distance >= (outerR)){   
                pixel.data[0] = 0;
                pixel.data[1] = 0;
                pixel.data[2] = 0;
                image.setPixel(x, y, pixel);
                continue;
            }

            if(distance <= (innerR)){
                continue;
            }

            if (distance > (innerR) && distance < (outerR)) {
                
                // constructing multiplier
                let R = Math.sqrt(Math.pow(x-center_x, 2) + Math.pow(y-center_y, 2))/half_diag;
                let multiplier = 1 - (R - innerR) / (outerR - innerR);  
                                              
                pixel.data[0] = pixel.data[0] * multiplier;
                pixel.data[1] = pixel.data[1] * multiplier;
                pixel.data[2] = pixel.data[2] * multiplier;

                image.setPixel(x, y, pixel);
            }
        }
    }
    
    return image;
};

/*
* You will want to build a normalized CDF of the L channel in the image.
*/
Filters.histogramEqualizationFilter = function(image) {
    
    // ----------- Our reference solution uses 33 lines of code.
    // creating luminance array
    var luminance_array = new Array(256).fill(0);
    let n = image.width * image.height;

    // going through all the pixels in image to create PDF
    for (var x = 0; x < image.width; x++) {
        for (var y = 0; y < image.height; y++) {
            
            let pixel = image.getPixel(x, y);
            let pixel_hsl = pixel.rgbToHsl();
            let val = Math.round((pixel_hsl.data[2] * 255));
            //console.log("Value: " + val)
            luminance_array[val] += 1;
            //console.log("luminance value: " + luminance_array[val])
                        
        }
    }

    // Normalizing pdf
    for (let index = 0; index < luminance_array.length; index++){
        //console.log("index before: " + index + " " + luminance_array[index]);
        luminance_array[index] = luminance_array[index] / n;
        //console.log("index after: " + index + " " + luminance_array[index]);
    }
    
    // create cdf
    let cdf = new Array(256).fill(0);
    for (let index = 0; index < luminance_array.length; index++){
        if (index !== 0)
            cdf[index] = cdf[(index - 1)] + luminance_array[index];
        else 
            cdf[index] = luminance_array[index];
    }

    // iterating through pixles
    for (var x = 0; x < image.width; x++) {
        for (var y = 0; y < image.height; y++) {

            let pixel = image.getPixel(x, y);
            let pixel_hsl = pixel.rgbToHsl();

            // comment out Math.round to get really cool image 
            let val = Math.round((pixel_hsl.data[2]*255))

            pixel_hsl.data[2] = cdf[val]; 

            let new_pixel = pixel_hsl.hslToRgb();
            image.setPixel(x, y, new_pixel);

        }
    
    }
    
    return image;

    // javascript fill: https://stackoverflow.com/questions/1295584/most-efficient-way-to-create-a-zero-filled-javascript-array 
};

// Set each pixel in the image to its luminance
Filters.grayscaleFilter = function(image) {
    for (let x = 0; x < image.width; x++) {
        for (let y = 0; y < image.height; y++) {
            const pixel = image.getPixel(x, y);
            const luminance = 0.2126 * pixel.data[0] + 0.7152 * pixel.data[1] + 0.0722 * pixel.data[2];
            pixel.data[0] = luminance;
            pixel.data[1] = luminance;
            pixel.data[2] = luminance;

            image.setPixel(x, y, pixel);
        }
    }

    return image;
};

// Adjust each channel in each pixel by a fraction of its distance from the average
// value of the pixel (luminance).
// See: http://www.graficaobscura.com/interp/index.html
Filters.saturationFilter = function(image, ratio) {

    for (let x = 0; x < image.width; x++) {
        for (let y = 0; y < image.height; y++) {
            let pixel = image.getPixel(x, y);

            const luminance = 0.2126 * pixel.data[0] + 0.7152 * pixel.data[1] + 0.0722 * pixel.data[2];
            pixel.data[0] = pixel.data[0] + (pixel.data[0] - luminance) * ratio;
            pixel.data[1] = pixel.data[1] + (pixel.data[1] - luminance) * ratio;
            pixel.data[2] = pixel.data[2] + (pixel.data[2] - luminance) * ratio;

            image.setPixel(x, y, pixel);

        }
    }
    
    return image;
};

// Apply the Von Kries method: convert the image from RGB to LMS, divide by
// the LMS coordinates of the white point color, and convert back to RGB.
Filters.whiteBalanceFilter = function(image, white) {
    
    let white_pixel = new Pixel(white.data[0], white.data[1], white.data[2], "rgb")
    let a = white_pixel.rgbToXyz();
    var pixel_white = a.xyzToLms();

    for (let x = 0; x < image.width; x++) {
        for (let y = 0; y < image.height; y++) {
            let val = image.getPixel(x, y);

            
            let b = val.rgbToXyz();
            let pixel_LMS = b.xyzToLms();
            //console.log("lms: " + pixel_LMS.data[0] + " " + pixel_LMS.data[1] + " " + pixel_LMS.data[2])

            pixel_LMS.data[0] = pixel_LMS.data[0]/pixel_white.data[0]; // L
            pixel_LMS.data[1] = pixel_LMS.data[1]/pixel_white.data[1]; // M
            pixel_LMS.data[2] = pixel_LMS.data[2]/pixel_white.data[2]; // S

            let c = pixel_LMS.lmsToXyz();
            let pixel = c.xyzToRgb();

            image.setPixel(x, y, pixel);

        }
    }


    return image;
};

// This is similar to the histogram filter, except here you should take the
// the CDF of the L channel in one image and
// map it to another
//
Filters.histogramMatchFilter = function(image, refImg) {


    var luminance_array = new Array(256).fill(0);
    let n = image.width * image.height;

    // going through all the pixels in image to create PDF
    for (var x = 0; x < image.width; x++) {
        for (var y = 0; y < image.height; y++) {      
            let pixel = image.getPixel(x, y);
            let pixel_hsl = pixel.rgbToHsl();
            let val = Math.round((pixel_hsl.data[2] * 255));
            luminance_array[val] += 1;           
        }
    }

    // Normalizing pdf
    for (let index = 0; index < luminance_array.length; index++){
        luminance_array[index] = luminance_array[index] / n;
    }
    
    // create cdf
    let cdf = new Array(256).fill(0);
    for (let index = 0; index < luminance_array.length; index++){
        if (index !== 0)
            cdf[index] = cdf[(index - 1)] + luminance_array[index];
        else 
            cdf[index] = luminance_array[index];
    }
    



    //-----------------------REFERENCE IMAGE-----------------------------------------------//

    var luminance_array_ref = new Array(256).fill(0);
    let n_ref = refImg.width * refImg.height;

    // creating pdf for reference image
    for (var x = 0; x < refImg.width; x++) {
        for (var y = 0; y < refImg.height; y++) {      
            let pixel = refImg.getPixel(x, y);
            let pixel_hsl = pixel.rgbToHsl();
            let val = Math.round((pixel_hsl.data[2] * 255));
            luminance_array_ref[val] += 1;           
        }
    }

    // Normalizing reference pdf
    for (let index = 0; index < luminance_array_ref.length; index++){
        luminance_array_ref[index] = luminance_array_ref[index] / n_ref;
    }
    
    // create reference cdf
    let cdf_ref = new Array(256).fill(0);
    for (let index = 0; index < luminance_array_ref.length; index++){
        if (index !== 0)
            cdf_ref[index] = cdf_ref[(index - 1)] + luminance_array_ref[index];
        else 
            cdf_ref[index] = luminance_array_ref[index];
    }
    

    // ------------------------Combining -------------------------------------------//

    // cdf calculation
    for (var x = 0; x < image.width; x++) {
        for (var y = 0; y < image.height; y++) {

            let pixel = image.getPixel(x, y);
            let pixel_hsl = pixel.rgbToHsl();

            // comment out Math.round to get really cool image 
            let val = Math.round((pixel_hsl.data[2]*255));
            let min = Math.pow(10, 1000);
            let index = 0;

            // finding nearest match
            for(let i = 0; i < cdf_ref.length; i++){
                let diff = Math.abs((cdf[val] - cdf_ref[i]));
                if (diff < min){
                    min = diff;
                    index = i;
                }
            }

            pixel_hsl.data[2] = index/255; 
            let new_pixel = pixel_hsl.hslToRgb();
            image.setPixel(x, y, new_pixel);
        }
    }
    
    return image;
};

// Convolve the image with a gaussian filter.
// NB: Implement this as a seperable gaussian filter
Filters.gaussianFilter = function(image, sigma) {
    // note: this function needs to work in a new copy of the image
    //       to avoid overwriting original pixels values needed later
    // create a new image with the same size as the input image
    let newImg = image.createImg(image.width, image.height);
    // the filter window will be [-winR, winR] for a total diameter of roughly Math.round(3*sigma)*2+1;
    const winR = Math.round(sigma * 3);
    var kernel = [];
    var total = 0;
    //var sum = 0;
    // calculating kernel weights
    for (let i = -winR; i <= winR; i++){
        let value = 1/Math.sqrt(2*Math.PI*Math.pow(sigma, 2)) * Math.exp(-(Math.pow(i, 2)/(2*Math.pow(sigma, 2))));
        total += value;
        kernel.push(value);
    }
    for(let i = 0; i < kernel.length; i++){
       kernel[i] = kernel[i]/total;
       //.log("Kernel value after normalization: " + kernel[i] + " i position: " + i);
       //sum += kernel[i]
    }


    // iterating through pixels in horizontal direction
    for (let x = 0; x < image.width; x++) {
        for (let y = 0; y < image.height; y++) {
            let red_total = 0;
            let green_total = 0;
            let blue_total = 0;
            let counter = 0;

            // convuling horizontally
            for(let i = x - winR; i <= x + winR; i++){
                let temp_pixel = image.getPixel(i, y);
                red_total += kernel[counter] * temp_pixel.data[0]; 
                green_total += kernel[counter] * temp_pixel.data[1]; 
                blue_total += kernel[counter] * temp_pixel.data[2];
                counter++;
            }


            var new_pixel = new Pixel(red_total, green_total, blue_total);

            
            newImg.setPixel(x, y, new_pixel);
        }
    }

    // convulving vertically
    for (let x = 0; x < image.width; x++) {
        for (let y = 0; y < image.height; y++) {
            let red_total = 0;
            let green_total = 0;
            let blue_total = 0;
            let counter = 0;

            // convuling
            for(let i = y + -winR; i <= y + winR; i++){
                let temp_pixel = newImg.getPixel(x, i);

                red_total += kernel[counter] * temp_pixel.data[0]; 
                green_total += kernel[counter] * temp_pixel.data[1]; 
                blue_total += kernel[counter] * temp_pixel.data[2];
                counter++;
            }

            let pixel = newImg.getPixel(x, y);
            var new_pixel = new Pixel(red_total, green_total, blue_total);

            
            newImg.setPixel(x, y, new_pixel);

        }
    }
    

    return newImg;
};

/*
* First the image with the edge kernel and then add the result back onto the
* original image.
*/
Filters.sharpenFilter = function(image) {

    let newImg = image.createImg(image.width, image.height);
    var kernel_inside = [-1, -1, -1, -1, 9, -1, -1, -1, -1];

    for (let x = 0; x < image.width; x++) {
        for (let y = 0; y < image.height; y++) {
            let red_total = 0;
            let green_total = 0;
            let blue_total = 0;
            let counter = 0;

            // convuling
            for(let i = x - 1; i <= x + 1; i++){
                for(let j = y - 1; j <= y + 1; j++){
                let temp_pixel = image.getPixel(i, j);

                red_total += kernel_inside[counter] * temp_pixel.data[0]; 
                green_total += kernel_inside[counter] * temp_pixel.data[1]; 
                blue_total += kernel_inside[counter] * temp_pixel.data[2];
                counter++;
            }
        }
            var new_pixel = new Pixel(red_total, green_total, blue_total);
            newImg.setPixel(x, y, new_pixel);

        }

    }

    return newImg;
};

/*
* Convolve the image with the edge kernel from class. You might want to define
* a convolution utility that convolves an image with some arbitrary input kernel
*
* For this filter, we recommend inverting pixel values to enhance edge visualization
*/
Filters.edgeFilter = function(image) {
    // ----------- STUDENT CODE BEGIN ------------
    // ----------- Our reference solution uses 57 lines of code.
    // ----------- STUDENT CODE END ------------
    Gui.alertOnce ('edgeFilter is not implemented yet');
    return image;
};

// Set a pixel to the median value in its local neighbor hood. You might want to
// apply this seperately to each channel.
Filters.medianFilter = function(image, winR) {
    // winR: the window will be  [-winR, winR];
    // ----------- STUDENT CODE BEGIN ------------
    // ----------- Our reference solution uses 36 lines of code.
    // ----------- STUDENT CODE END ------------
    Gui.alertOnce ('medianFilter is not implemented yet');
    return image;
};

// Apply a bilateral filter to the image. You will likely want to reference
// precept slides, lecture slides, and the assignments/examples page for help.
Filters.bilateralFilter = function(image, sigmaR, sigmaS) {
    // reference: https://en.wikipedia.org/wiki/Bilateral_filter
    // we first compute window size and preprocess sigmaR
    const winR = Math.round((sigmaR + sigmaS) * 1.5);
    sigmaR = sigmaR * (Math.sqrt(2) * winR);


    for (let x = 0; x < image.width; x++){
        for(let y = 0; y < image.height; y++){
            let pixel = image.getPixel(x,y);

            let pixel1 = new Pixel(0, 0, 0, 1);

            let total = 0;


            // convuling
            for(let i = x - winR; i <= x + winR; i++){
                for(let j = y - winR; j <= y + winR; j++){
                    let temp_pixel = image.getPixel(i, j);
                    // -----------------------------COMPUTE KERNEL Value------------------------------------//
                    // spatial 
                    let spatial = (Math.pow((x - i), 2) + Math.pow((y - j), 2)) / (2 * Math.pow(sigmaS, 2));

                    // color
                    let val_0 = Math.pow(( (pixel.data[0] - temp_pixel.data[0]) * 255), 2);     //red            
                    let val_1 = Math.pow(( (pixel.data[1] - temp_pixel.data[1]) * 255), 2);     //green
                    let val_2 = Math.pow(( (pixel.data[2] - temp_pixel.data[2]) * 255), 2);     // blue
                    let color =  (val_0 + val_1 + val_2) / (2 * Math.pow(sigmaR, 2));

                    let kernel_val = Math.exp(-spatial - color);

                    
                    pixel1.data[0] += temp_pixel.data[0] * kernel_val;
                    pixel1.data[1] += temp_pixel.data[1] * kernel_val;
                    pixel1.data[2] += temp_pixel.data[2] * kernel_val;
                    total += kernel_val;
                }
            }

            // setting pixel after convultion
            let red =  pixel1.data[0]/total;
            let green =  pixel1.data[1]/total;
            let blue =   pixel1.data[2]/total;

            var new_pixel = new Pixel(red, green, blue);
            image.setPixel(x, y, new_pixel);

        }
    }

    return image;
};

// Conver the image to binary
Filters.quantizeFilter = function(image) {
    // convert to grayscale
    image = Filters.grayscaleFilter(image);

    // use center color
    for (let i = 0; i < image.height; i++) {
        for (let j = 0; j < image.width; j++) {
            const pixel = image.getPixel(j, i);
            for (let c = 0; c < 3; c++) {
                pixel.data[c] = Math.round(pixel.data[c]);
            }
            pixel.clamp();
            image.setPixel(j, i, pixel);
        }
    }
    return image;
};

// To apply random dithering, first convert the image to grayscale, then apply
// random noise, and finally quantize
Filters.randomFilter = function(image) {
    // convert to grayscale
    image = Filters.grayscaleFilter(image);

    for (let i = 0; i < image.height; i++) {
        for (let j = 0; j < image.width; j++) {

            const pixel = image.getPixel(j, i);
            let x = Math.random() - .5;
            for (let c = 0; c < 3; c++) {   
                pixel.data[c] = pixel.data[c] + x;
            }

            for (let c = 0; c < 3; c++) {   
                pixel.data[c] = Math.round(pixel.data[c]);
            }
            pixel.clamp();
            image.setPixel(j, i, pixel);

        }

    }
    
    return image;
};

// Apply the Floyd-Steinberg dither with error diffusion
Filters.floydFilter = function(image) {
    // convert to grayscale
    image = Filters.grayscaleFilter(image);

    for (let i = 0; i < image.height; i++) {
        for (let j = 0; j < image.width; j++) {

            const pixel = image.getPixel(j, i);
            const original = [pixel.data[0], pixel.data[1], pixel.data[2]];

            for (let c = 0; c < 3; c++) {
                pixel.data[c] = Math.round(pixel.data[c]);
            }

            pixel.clamp();
            image.setPixel(j, i, pixel);

            // computer error & storing
            let error = [];
            for (let x = 0; x < 3; x++){
                let value = original[x] - pixel.data[x];
                error.push(value);
            }
            //console.log(error[0] + " " + error[1] + " " + error[2]);

            // distributing error
            let right = image.getPixel(j+1, i);
            let bottom_left = image.getPixel(j-1, i+1);
            let below = image.getPixel(j, i+1);
            let bottom_right = image.getPixel(j+1, i+1);

            for(let y = 0; y < 3; y++){
                right.data[y] = right.data[y] + (7/16 * error[y]);
                bottom_left.data[y] = bottom_left.data[y] + (3/16 * error[y]);
                below.data[y] = below.data[y] + (5/16 * error[y]);
                bottom_right.data[y] = bottom_right.data[y] + (1/16 * error[y]);
            }

            image.setPixel(j+1, i, right);
            image.setPixel(j-1, i+1, bottom_left);
            image.setPixel(j, i+1, below);
            image.setPixel(j+1, i+1, bottom_right);

        }

    }


    return image;
};

// Apply ordered dithering to the image. We recommend using the pattern from the
// examples page and precept slides.
Filters.orderedFilter = function(image) {
    // convert to gray scale
    image = Filters.grayscaleFilter(image);

    var matrix = [
        [15, 7, 13, 5], 
        [3, 11, 1, 9], 
        [12, 4, 14, 6], 
        [0, 8, 2, 10]
    
    ];
    var m = 4;

    for (let x = 0; x < image.width; x++) {
        for (let y = 0; y < image.height; y++) {
            let pixel = image.getPixel(x, y);
            let i = x % m;
            let j = y % m;
             

            let err =  pixel.data[0] - Math.floor(pixel.data[0]);
            let threshold = (matrix[i][j] + 1) / (Math.pow(m, 2) + 1);
            if (err > threshold){
                console.log("first if");
                let val = Math.ceil(pixel.data[0]);
                pixel.data[0] = val;
                pixel.data[1] = val;
                pixel.data[2] = val;

            }
            else{
                console.log("second if")
                let val = Math.floor(pixel.data[0]);
                pixel.data[0] = val;
                pixel.data[1] = val;
                pixel.data[2] = val;

            }

            image.setPixel(x, y, pixel);
        }
    }

 
    return image;
};

// Implement bilinear and Gaussian sampling (in addition to the basic point sampling).
// This operation doesn't appear on GUI and should be used as a utility function.
// Call this function from filters that require sampling (e.g. scale, rotate)
Filters.samplePixel = function(image, x, y, mode) {
    if (mode === "bilinear") {
        // ----------- Our reference solution uses 21 lines of code.


        // calculating bounds
        let x1 = Math.floor(x);
        let x2 = Math.floor(x) + 1;
        let y2 = Math.floor(y) + 1;
        let y1 = Math.floor(y);   

        // linear interpolation
        let val = 1 / ((x2 - x1) * (y2 - y1));

                        
        let Q11 = image.getPixel(x1, y1);     
        let Q12 = image.getPixel(x1, y2);
        let Q21 = image.getPixel(x2, y1);
        let Q22 = image.getPixel(x2, y2);

        let p1 = Q11.multipliedBy((x2-x)).multipliedBy((y2-y));
        let p2 = Q21.multipliedBy((x - x1)).multipliedBy((y2-y));
        let p3 = Q12.multipliedBy((x2 - x)).multipliedBy((y-y1));
        let p4 = Q22.multipliedBy((x - x1)).multipliedBy((y - y1));

        let p = p1.plus(p2).plus(p3).plus(p4);

        let new_pixel = p.multipliedBy(val);

        return new_pixel;


    } else if (mode === "gaussian") {

        let winR = 3;
        let sigma = 1;
 

        let kernel = [];
        let x_point = [];
        let y_point = [];
        let total = 0;

        // Compute kernel and save corresponding coordinates
        for(let i = - winR; i <= winR; i++){
            for(let j = - winR; j <= winR; j++){
                
                let value = Math.exp(-(Math.pow((i), 2) + Math.pow((j), 2)) / (2 * Math.pow(sigma, 2)));
                total += value;
                kernel.push(value);
                x_point.push((x + i));
                y_point.push((y + j));
            }
        }

        // normalizing weight
        for(let i = 0; i < kernel.length; i++){
            kernel[i] = kernel[i] / total;
        }

        let red = 0;
        let green = 0;
        let blue = 0;

        // return weighted average
        for (let i = 0; i < kernel.length; i++){
            let temp_pixel = image.getPixel(x_point[i], y_point[i]);
            red += kernel[i] * temp_pixel.data[0];
            green += kernel[i] * temp_pixel.data[1];
            blue += kernel[i] * temp_pixel.data[2];
        }

        var new_pixel = new Pixel(red, green, blue);

        return new_pixel;



    } else {
        // point sampling
        y = Math.max(0, Math.min(Math.round(y), image.height - 1));
        x = Math.max(0, Math.min(Math.round(x), image.width - 1));
        return image.getPixel(x, y);
    }
};

// Translate the image by some x, y and using a requested method of sampling/resampling
Filters.translateFilter = function(image, x, y, sampleMode) {
    
    let newImg = image.createImg(image.width, image.height);

    // iterating through image
    for (let i = 0; i < newImg.width; i++) {
        for (let j = 0; j < newImg.height; j++) {

        
            // pixel location in old image
            let old_x = i - x;
            let old_y = j - y;

            if(old_x < 0 || old_x > image.width){
                let pixel = new Pixel(0, 0, 0, 0);
                newImg.setPixel(i, j, pixel)
                continue;
            }

            if(old_y < 0 || old_y > image.height){
                let pixel = new Pixel(0, 0, 0, 0);
                newImg.setPixel(i, j, pixel)
                continue;
            }

            let new_pixel = Filters.samplePixel(image, old_x, old_y, sampleMode);  // how do I use sample pixel?
            
            // setting pixel in new image
            newImg.setPixel(i, j, new_pixel);

            
        }
    }


    return newImg;
};

// Scale the image by some ratio and using a requested method of sampling/resampling
Filters.scaleFilter = function(image, ratio, sampleMode) {

    let newImg = image.createImg(Math.round(image.width * ratio), Math.round(image.height * ratio));

    // iterating through image
    for (let i = 0; i < newImg.width; i++) {
        for (let j = 0; j < newImg.height; j++) {


            // pixel location in old image
           
            let old_x = i / ratio;
            let old_y = j / ratio;

            if(old_x < 0 || old_x > image.width){
                let pixel = new Pixel(0, 0, 0, 0);
                newImg.setPixel(i, j, pixel)
                continue;
            }

            if(old_y < 0 || old_y > image.height){
                let pixel = new Pixel(0, 0, 0, 0);
                newImg.setPixel(i, j, pixel)
                continue;
            }
            
            
            let new_pixel = Filters.samplePixel(image, old_x, old_y, sampleMode);  // how do I use sample pixel?
    
           

            newImg.setPixel(i, j, new_pixel);
        }
    }

    // ----------- Our reference solution uses 19 lines of code.
    return newImg;
};

// Rotate the image by some angle and using a requested method of sampling/resampling
Filters.rotateFilter = function(image, radians, sampleMode) {


    let width = image.width;
    let height = image.height;

    // rotation in the four quadrants

    // 90 degrees 
    if(radians < Math.PI/2){
        height = image.width* Math.sin(radians) + image.height * Math.cos(radians);
        width = image.width* Math.cos(radians) + image.height * Math.sin(radians);
    }

    // 180 degreees

    // 270 degrees

    // 360 degrees 

    let newImg = image.createImg(width, height);
    let center = [(image.width/2), (image.heigh/2)]

    // iterating through image
    for (let i = 0; i < newImg.width; i++) {
        for (let j = 0; j < newImg.height; j++) {

            // pixel location in old image

            //new x = ucos(theta) - vsin(theta)
            //new y = usin(theta) + vsin(theta)

            var x = i - center[0];
            var y = center[1] - j;

            let old_x = (i - x) * Math.cos(radians) + (j - y) * Math.sin(radians);
            let old_y = (i - x) * Math.cos(radians) + (j - y) * Math.sin(radians);

            //var old_x = x * Math.cos(-radians) - y * Math.sin(-radians);
            //var old_y = x * Math.sin(-radians) + y * Math.cos(-radians);


            if(old_x < 0 || old_x > image.width){
                let pixel = new Pixel(0, 0, 0, 0);
                newImg.setPixel(i, j, pixel)
                continue;
            }

            if(old_y < 0 || old_y > image.height){
                let pixel = new Pixel(0, 0, 0, 0);
                newImg.setPixel(i, j, pixel)
                continue;
            }

            let new_pixel = Filters.samplePixel(image, old_x, old_y, sampleMode);  // how do I use sample pixel?
    
           

            newImg.setPixel(i, j, new_pixel);

        }
    }


    return image;
};

// Swirl the filter about its center. The rotation of the swirl should be in linear increase
// along the radial axis up to radians
Filters.swirlFilter = function(image, radians, sampleMode) {
    // ----------- STUDENT CODE BEGIN ------------
    // ----------- Our reference solution uses 26 lines of code.
    // ----------- STUDENT CODE END ------------
    Gui.alertOnce ('swirlFilter is not implemented yet');
    return image;
};

// Set alpha from luminance
Filters.getAlphaFilter = function(backgroundImg, foregroundImg) {
    for (let i = 0; i < backgroundImg.height; i++) {
        for (let j = 0; j < backgroundImg.width; j++) {
            const pixelBg = backgroundImg.getPixel(j, i);
            const pixelFg = foregroundImg.getPixel(j, i);
            const luminance =
            0.2126 * pixelFg.data[0] + 0.7152 * pixelFg.data[1] + 0.0722 * pixelFg.data[2];
            pixelBg.a = luminance;
            backgroundImg.setPixel(j, i, pixelBg);
        }
    }

    return backgroundImg;
};

// Composites the foreground image over the background image, using the alpha
// channel of the foreground image to blend two images.
Filters.compositeFilter = function(backgroundImg, foregroundImg) {
    

    for(let x = 0; x < backgroundImg.width; x++){
        for(let y = 0; y < backgroundImg.height; y++){
            
            let pixel_back = backgroundImg.getPixel(x, y);
            let pixel_front = foregroundImg.getPixel(x, y);

            let alpha = pixel_front.a;
            //console.log(pixel_front.a)

            let red = alpha * pixel_front.data[0] + (1-alpha) * pixel_back.data[0];
            let green = alpha * pixel_front.data[1] + (1-alpha) * pixel_back.data[1];
            let blue = alpha * pixel_front.data[2] + (1-alpha) * pixel_back.data[2];
            
            let new_pixel = new Pixel(red, green, blue, 1, "rgb");
            backgroundImg.setPixel(x, y, new_pixel);

        }
    }
 
    return backgroundImg;
};

// Morph two images according to a set of correspondance lines
Filters.morphFilter = function(initialImg, finalImg, alpha, sampleMode, linesFile) {
    const lines = Parser.parseJson("images/" + linesFile);

    // The provided linesFile represents lines in a flipped x, y coordinate system
    //  (i.e. x for vertical direction, y for horizontal direction).
    // Therefore we first fix the flipped x, y coordinates here.
    for (let i = 0; i < lines.initial.length; i++) {
        [lines.initial[i].x0, lines.initial[i].y0] = [lines.initial[i].y0, lines.initial[i].x0];
        [lines.initial[i].x1, lines.initial[i].y1] = [lines.initial[i].y1, lines.initial[i].x1];
        [lines.final[i].x0, lines.final[i].y0] = [lines.final[i].y0, lines.final[i].x0];
        [lines.final[i].x1, lines.final[i].y1] = [lines.final[i].y1, lines.final[i].x1];
    }

    // ----------- STUDENT CODE BEGIN ------------
    // ----------- Our reference solution uses 114 lines of code.
    // ----------- STUDENT CODE END ------------
    Gui.alertOnce ('morphFilter is not implemented yet');
    return image;
};

// Use k-means to extract a pallete from an image
Filters.paletteFilter = function(image, colorNum) {
    // ----------- STUDENT CODE BEGIN ------------
    // ----------- Our reference solution uses 89 lines of code.
    // ----------- STUDENT CODE END ------------
    Gui.alertOnce ('paletteFilter is not implemented yet');
    return image;
};

// Read the following paper and implement your own "painter":
//      http://mrl.nyu.edu/publications/painterly98/hertzmann-siggraph98.pdf
Filters.paintFilter = function(image, value) {
    // ----------- STUDENT CODE BEGIN ------------
    // ----------- Our reference solution uses 59 lines of code.
    // ----------- STUDENT CODE END ------------
    Gui.alertOnce ('paintFilter is not implemented yet');
    return image;
};

/*
* Read this paper for background on eXtended Difference-of-Gaussians:
*      http://www.cs.princeton.edu/courses/archive/spring19/cos426/papers/Winnemoeller12.pdf
* Read this paper for an approach that develops a flow field based on a bilateral filter
*      http://www.cs.princeton.edu/courses/archive/spring19/cos426/papers/Kang09.pdf
*/
Filters.xDoGFilter = function(image, value) {
    // ----------- STUDENT CODE BEGIN ------------
    // ----------- Our reference solution uses 70 lines of code.
    // ----------- STUDENT CODE END ------------
    Gui.alertOnce ('xDoGFilter is not implemented yet');
    return image;
};

// You can use this filter to do whatever you want, for example
// trying out some new idea or implementing something for the
// art contest.
// Currently the 'value' argument will be 1 or whatever else you set
// it to in the URL. You could use this value to switch between
// a bunch of different versions of your code if you want to
// code up a bunch of different things for the art contest.
Filters.customFilter = function(image, value) {
    // ----------- STUDENT CODE BEGIN ------------
    // ----------- Our reference solution uses 0 lines of code.
    // ----------- STUDENT CODE END ------------
    Gui.alertOnce ('customFilter is not implemented yet');
    return image;
};
