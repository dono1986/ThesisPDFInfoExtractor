"use strict";

const PDFExtract = require('pdf.js-extract').PDFExtract;
const pdfExtract = new PDFExtract();

const jsonQuery = require('json-query')

const POSS_DEGREE_COURSE = ["Studiengang"];

const THESIS_TYPE = ["Bachelorthesis", "Masterthesis"];

const PRESENTED_BY = ["vorgelegt von"];

const FIRST_READER = ["Erstkorrektor"];

const SECOND_READER = ["Zweitkorrektor"];

const COMBINED = [].concat(POSS_DEGREE_COURSE).concat(THESIS_TYPE).concat(PRESENTED_BY).concat(FIRST_READER).concat(SECOND_READER);

const options = {
    "firstpage": 1,
    "lastpage" : 1
}; /* see below */

extractThesisData('D:/PDF/Annina Bold_869077_Bachelorthesis.pdf', options);

function extractThesisData(filename, options) {
   
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
            
            let frontPageInfo = extractFrontPageData(data.pages[0].content);
            console.log(data.pages[0].content);
            let studiengang = getClosestNeighborTextByName(POSS_DEGREE_COURSE[0], data.pages[0].content);

            console.log(studiengang);



        })
        .catch((err) => {
            console.error(err);
        })

}

function getClosestNeighborTextByName(elementName, tree) {

    let element = tree.find((current) => {
        return (current.str == elementName);
    });

    return getClosestNeighborText(element, tree);   
}

function getClosestNeighborText(element, tree) {

    let minXDelta = Infinity;
    let minYDelta = Infinity;
    let foundStr = "";

    for(let e of tree) {

        // Exclude static text
        let found = COMBINED.find((current) => {
            return (current == element.str);
        });

        if(found != undefined && e.str !== element.str) {

            let x = Math.abs(element.x-e.x);
            let y = Math.abs(element.y-e.y);

            if(x<minXDelta && y<minYDelta) {
                minXDelta = x;
                minYDelta = y;
                foundStr = e.str;
            }
            
        }
    }
    return foundStr;
}

function extractFrontPageData(data) {
    // Detect all data from PDF Front page

    // degree course (dt. Studiengang)

    // examination regulations (dt. Prüfungsordnung)

    // Title

    // Eng. Title

    // Author

    // Hand-in date

    // First reader

    // Second reader



}


