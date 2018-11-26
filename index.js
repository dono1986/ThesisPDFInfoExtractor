"use strict";

const PDFExtract = require('pdf.js-extract').PDFExtract;
const pdfExtract = new PDFExtract();

const jsonQuery = require('json-query')

const POSS_DEGREE_COURSE = ["Studiengang"];

const THESIS_TYPE = ["Bachelorarbeit", "Masterarbeit"];

const PRESENTED_BY = ["vorgelegt von"];

const FIRST_READER = ["Erstkorrektor"];

const SECOND_READER = ["Zweitkorrektor"];

const COMBINED = [].concat(POSS_DEGREE_COURSE).concat(THESIS_TYPE).concat(PRESENTED_BY).concat(FIRST_READER).concat(SECOND_READER);

const options = {
    "firstpage": 1,
    "lastpage" : 1,
    "searchLeft" : true 
}; /* see below */

//extractThesisData('D:/PDF/Annina Bold_869077_Bachelorthesis.pdf', options);

extractThesisData('E:/Seafile/Austausch/Abschlussarbeiten/BA_Bold/Annina Bold_869077_Bachelorthesis.pdf',options);
function extractThesisData(filename, options) {
   
    console.log("options: " + options.searchLeft);

    const readPDFPromise = new Promise(function(resolve, reject) {
  
        //let filename = 'E:/Seafile/Austausch/Abschlussarbeiten/BA_Bold/Annina Bold_869077_Bachelorthesis.pdf';
        pdfExtract.extract(filename, options, (err, data) => {
            if (err) {
                console.log(err);
                reject();
            } 
            
            resolve(data);
        })
    });
    
    readPDFPromise
        .then((data) => {
            
            let frontPageInfo = extractFrontPageData(data.pages[0].content, options);
            console.log(frontPageInfo);
        })
        .catch((err) => {
            console.error(err);
        })

}

function getClosestNeighborTextByName(elementName, tree, options) {

    let element = tree.find((current) => {
        return (current.str == elementName);
    });

    if(element==undefined) return ""; 

    return getClosestNeighborText(element, tree, options);   
}

function getClosestNeighborText(element, tree, options) {

    console.log(options);

    let foundStr = "";

    let currentMinDistance = Infinity;

    let centerX = element.x + element.width/2;
    let centerY = element.y + element.height/2;

        for(let comperativeObj of tree) {
            // Exclude static text
            let found = COMBINED.find((current) => {
                return (current == comperativeObj.str);
            });
            if(found != undefined) {
                continue;
            }

            // Exclude items which aren't located in the search direction
            if(options.searchLeft && comperativeObj.x > element.x+element.width) {
                continue;
            }
            if(options.searchRight && comperativeObj.x+comperativeObj.width < element.x) {
                continue;
            }
            if(options.searchUp && comperativeObj.y > element.y+element.height) {
                continue;
            }
            if(options.searchDown && comperativeObj.y+comperativeObj.height < element.y) {
                continue;
            }


            if(comperativeObj.str !== element.str) {
    
                // Get center point of each textfield to correctly measure the distance between each element
                let coCenterX = comperativeObj.x + comperativeObj.width/2;
                let coCenterY = comperativeObj.y + comperativeObj.height/2;

                // Calculate new vector between the two points
                let newVectorX = coCenterX-centerX;
                let newVectorY = coCenterY-centerY;

                // Calculate length of vector
                let length = Math.sqrt(newVectorX*newVectorX + newVectorY*newVectorY);

                if(length<currentMinDistance) {
                    currentMinDistance = length;
                    foundStr = comperativeObj.str;
                }
                
            }
        

    }


    
    return foundStr;
}

function extractFrontPageData(data, options) {

    //console.log(data);

    // Detect all data from PDF Front page

    let thesisDocument = {};
    // degree course (dt. Studiengang)
    
    thesisDocument.degreeCourse = getClosestNeighborTextByName(POSS_DEGREE_COURSE[0], data, options);
    console.log("Degree Course found " + thesisDocument.degreeCourse);

    // examination regulations (dt. Prüfungsordnung)
    thesisDocument.exRegulation = getClosestNeighborTextByName(thesisDocument.degreeCourse, data, options);
    console.log("Exmination regulations found " + thesisDocument.exRegulation);


    // Title
    thesisDocument.titleGerman = getClosestNeighborTextByName(THESIS_TYPE[0], data, options);
    console.log("German title found " + thesisDocument.titleGerman);

    // Eng. Title
    thesisDocument.titleEnglish = getClosestNeighborTextByName(thesisDocument.titleGerman, data, options);
    console.log("English title found " + thesisDocument.titleEnglish);

    // Author
    thesisDocument.author = getClosestNeighborTextByName(PRESENTED_BY[0], data, options);
    console.log("Author found " + thesisDocument.author);

    // Hand-in date
    thesisDocument.handInDate = getClosestNeighborTextByName(thesisDocument.author, data, options);
    console.log("Hand-In date found " + thesisDocument.handInDate);

    // First reader

    // Second reader

    return thesisDocument;


}


