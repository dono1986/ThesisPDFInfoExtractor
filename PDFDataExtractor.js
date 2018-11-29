"use strict";

const PDFExtract = require('pdf.js-extract').PDFExtract;
const pdfExtract = new PDFExtract();

const jsonQuery = require('json-query')

const POSS_DEGREE_COURSE = ["Studiengang"];

const THESIS_TYPE = ["Bachelorarbeit", "Masterarbeit"];

const PRESENTED_BY = ["vorgelegt von"];

const FIRST_READER = ["Betreuung:"];

const SECOND_READER = ["Zweitkorrektor:"];

const COMBINED = [].concat(POSS_DEGREE_COURSE).concat(THESIS_TYPE).concat(PRESENTED_BY).concat(FIRST_READER).concat(SECOND_READER);

function extractThesisData(filename, options) {

    const readPDFPromise = new Promise(function(resolve, reject) {
  
        pdfExtract.extract(filename, options, (err, data) => {
            if (err) {
                console.log(err);
                reject();
            } 
            
            resolve(data);
        })
    });
    
    return readPDFPromise;
        

}

function getClosestNeighborElementByName(elementName, tree, options) {

    console.log("Searching for closest neighbors of element " + elementName);
    if(typeof options!='undefined' && options!=null) {
        console.log("Options: " + JSON.stringify(options));
    }
    if(typeof elementName==='undefined' || elementName==="") {
        console.log("Aborting ... Elementname '" + elementName + "' is not valid name");
        return "";
    } 

    let element = tree.find((current) => {

        return (current.str === elementName);
    });

    if(typeof element==='undefined') {
        console.log("Element was undefined");
        return "";
    }  

    return getClosestNeighborElement(element, tree, options);   
}

function getClosestNeighborElement(element, tree, options) {

    let foundObj = "";

    let currentMinDistance = Infinity;

    let centerX = element.x + element.width/2;
    let centerY = element.y + element.height/2;

        for(let comperativeObj of tree) {
            // Exclude static text
            let found = COMBINED.find((current) => {
                return (current === comperativeObj.str);
            });
            if(found != undefined) {
                console.log("Found same object -> aborting " + "(" + comperativeObj.str + ")");
                continue;
            }

            let compElementIsAbove = comperativeObj.y+comperativeObj.height<element.y;
            let compElementIsBelow = comperativeObj.y>element.y+element.height;

            let compElementIsRight = comperativeObj.x>element.x+element.width;
            let compElementIsLeft = comperativeObj.x+comperativeObj.width<element.x;

            console.log("options.searchRight: " + options.searchRight);
            console.log("compElementIsRight: " + compElementIsRight);


            // Exclude items which aren't located in the search direction
            if(options.searchLeft===true && !compElementIsLeft) {
                console.log("Searching left, but compare element wasn't left");
                continue;
            }
            if(options.searchRight===true && !compElementIsRight) {
                console.log("Searching right, but compare element wasn't right");
                continue;
            }
            if(options.searchUp==true && !compElementIsAbove) {
                console.log("Searching up, but compare element wasn't above");
                continue;
            }
            if(options.searchDown==true && !compElementIsBelow) {
                console.log("Searching down, but compare element wasn't below");
                continue;
            }

            if(comperativeObj.str !== element.str) {

                let fixPointX = 0;
                let fixPointY = 0;
                let coFixPointX = 0;
                let coFixPointY = 0;

                if(compElementIsLeft) { // Comperative Object is left of element
                    if(compElementIsAbove) {
                        fixPointX = element.x;
                        fixPointY = element.y;
                        coFixPointX = comperativeObj.x + comperativeObj.width;
                        coFixPointY = comperativeObj.y + comperativeObj.height;
                    } else if(compElementIsBelow) {
                        fixPointX = element.x;
                        fixPointY = element.y+element.height;
                        coFixPointX = comperativeObj.x + comperativeObj.width;
                        coFixPointY = comperativeObj.y;
                    } else {
                        fixPointX = element.x;
                        fixPointY = element.y + element.height/2;
                        coFixPointX = comperativeObj.x + comperativeObj.width;
                        coFixPointY = fixPointY;
                    }
                } else if(compElementIsRight) { // Comperative Object is right of element
                    if(compElementIsAbove) {
                        fixPointX = element.x + element.width;
                        fixPointY = element.y;
                        coFixPointX = comperativeObj.x;
                        coFixPointY = comperativeObj.y + comperativeObj.height;
                    } else if(compElementIsBelow) {
                        fixPointX = element.x;
                        fixPointY = element.y+element.height;
                        coFixPointX = comperativeObj.x + comperativeObj.width;
                        coFixPointY = comperativeObj.y;
                    } else {
                        fixPointX = element.x + element.width;
                        fixPointY = element.y + element.height/2;
                        coFixPointX = comperativeObj.x;
                        coFixPointY = fixPointY;
                    }
                } else if(compElementIsAbove) { // Comperative Object is above element
                    fixPointX = element.x + element.width/2;
                    fixPointY = element.y;
                    coFixPointX = fixPointX;
                    coFixPointY = comperativeObj.y + comperativeObj.height;
                } else { // Comperative Object is under element
                    fixPointX = element.x + element.width/2;
                    fixPointY = element.y + element.height;
                    coFixPointX = fixPointX;
                    coFixPointY = comperativeObj.y;
                }

                // Calculate new vector between the two points
                let newVectorX = coFixPointX - fixPointX;//coCenterX-centerX;
                let newVectorY = coFixPointY - fixPointY;//coCenterY-centerY;

                // Calculate length of vector
                let length = Math.sqrt(newVectorX*newVectorX + newVectorY*newVectorY);

                console.log("#########################################");
                console.log("Analysing elements " + element.str + " and " + comperativeObj.str);
                console.log(element.str +  " fixPointX: " + fixPointX + ", " + "fixPointX: " + fixPointY);
                console.log(comperativeObj.str  +  " fixPointX: " +  coFixPointX + ", " + "fixPointY: " + coFixPointY);
                console.log("Distance: "  +  length);
                console.log("#########################################");


                if(length<currentMinDistance) {
                    currentMinDistance = length;
                    foundObj = comperativeObj;
                }
                
            }
    }
    return foundObj;
}

function mergeConsecutiveCloseObjects(data, tolerance) {
    let dataAggregated = new Array();
    
    for(let i=0; i<data.length;i++) {

        if(i+1>data.length-1) {
            dataAggregated.push(data[i]); 
            continue;
        }

        let firstValue = data[i];
        let secondValue = data[i+1];

        if((secondValue.y > firstValue.y) && 
            (secondValue.y - (firstValue.y+firstValue.height)) <= tolerance) {
            

                dataAggregated.push({   x: Math.min(firstValue.x, secondValue.x),
                                        width: Math.max(firstValue.width, secondValue.width),
                                        str: (firstValue.str + "\n" + secondValue.str), 
                                        y: firstValue.y, 
                                        height: secondValue.y + secondValue.height - firstValue.y});
                if(i+2<=data.length-1) {
                    i++;
                }
        } else {
            dataAggregated.push(data[i]);
        }
    }
    return dataAggregated;
}

function extractDataFromPage(data, options) {
    // Check if blank elements should be filtered out
    if(options.filterOutBlanks) {
        data.filter((el) => {el.str != ""});
    }
    
    // Check if elements should be sorted before processing
    if(options.sort) {
        data.sort((first, second) => {
            //console.log("First " + JSON.stringify(first));
            //console.log("Second" + JSON.stringify(second));
    
               if(first.x == second.x && first.y == second.y) {
                   //console.log("Elements are equal");
                   return 0;
               } 
    
               if(first.y<second.y || first.y==second.y && first.x<=second.x) {
                   //console.log("Element 1 < Element 2");
                   return -1;
               }
    
               //console.log("Element 1 > Element 2");
               return 1;
               
        });
    }
    
    // Check if downwards consecutive elements should be merged before processing
    if(options.mergeConsecutiveCloseObjects) {
        data = mergeConsecutiveCloseObjects(data, options.mergeTolerance);
    }

    
    
}

function extractFrontPageData(data, options) {
    
        // Sort and aggregate data
    data.sort((first, second) => {
        //console.log("First " + JSON.stringify(first));
        //console.log("Second" + JSON.stringify(second));

           if(first.x == second.x && first.y == second.y) {
               //console.log("Elements are equal");
               return 0;
           } 

           if(first.y<second.y || first.y==second.y && first.x<=second.x) {
               //console.log("Element 1 < Element 2");
               return -1;
           }

           //console.log("Element 1 > Element 2");
           return 1;
           
    });

    let dataAggregated = mergeConsecutiveCloseObjects(data, 5);

    dataAggregated.forEach((el) => {
        console.log(JSON.stringify(el));
    });

    // Detect all data from PDF Front page

    let thesisDocument = {};
    // degree course (dt. Studiengang)
    
    let degreeCourseEl = getClosestNeighborElementByName(POSS_DEGREE_COURSE[0], dataAggregated, {searchDown: true});
    thesisDocument.degreeCourse = degreeCourseEl.str;
    console.log("Degree Course found " + thesisDocument.degreeCourse);

    // examination regulations (dt. Prüfungsordnung)
    let exRegulationEl = getClosestNeighborElement(degreeCourseEl, dataAggregated,  {searchDown: true});
    thesisDocument.exRegulation = exRegulationEl.str;
    console.log("Exmination regulations found " + thesisDocument.exRegulation);

    // Title
    let titleGermanEl = getClosestNeighborElementByName(THESIS_TYPE[0], dataAggregated,  {searchDown: true});
    thesisDocument.titleGerman = titleGermanEl.str;
    console.log("German title found " + thesisDocument.titleGerman);

    // Eng. Title
    let titleEnglishEl = getClosestNeighborElement(titleGermanEl, dataAggregated,  {searchDown: true});
    thesisDocument.titleEnglish = titleEnglishEl.str;
    console.log("English title found " + thesisDocument.titleEnglish);

    // Author
    let authorEl = getClosestNeighborElementByName(PRESENTED_BY[0], dataAggregated, {searchDown: true});
    thesisDocument.author = authorEl.str;
    console.log("Author found " + thesisDocument.author);

    // Hand-in date
    let handInDateEl = getClosestNeighborElement(authorEl, dataAggregated, {searchDown: true});
    thesisDocument.handInDate = handInDateEl.str;
    console.log("Hand-In date found " + thesisDocument.handInDate);

    // First reader
    let firstReaderEl = getClosestNeighborElementByName(FIRST_READER[0], dataAggregated, {searchRight: true});
    thesisDocument.firstReader = firstReaderEl.str;
    console.log("First reader found " + thesisDocument.handInDate);

    // Second reader
    let secondReaderEl = getClosestNeighborElementByName(SECOND_READER[0], dataAggregated, {});
    thesisDocument.secondReader = secondReaderEl.str;
    console.log("Second reader found " + thesisDocument.handInDate);


    return thesisDocument;
}

module.exports = {extractFrontPageData, extractDataFromPage, extractThesisData };
