"use strict";

const PDFExtract = require('pdf.js-extract').PDFExtract;
const pdfExtract = new PDFExtract();

const POSS_DEGREE_COURSE = ["Studiengang"];

const THESIS_TYPE = {"german": "Studiengang", "english": ""}

const DEGREE_COURSE = {"german": "Studiengang", "english": ""}

const DEGREE_COURSE = {"german": "Studiengang", "english": ""}



function extractThesisData(filename, options) {
   
    const readPDFPromise = new Promise(function(resolve, reject) {
  
        const options = {
            "firstpage": 1,
            "lastpage" : 4
        }; /* see below */
        
        //let filename = 'E:/Seafile/Austausch/Abschlussarbeiten/BA_Bold/Annina Bold_869077_Bachelorthesis.pdf';
        pdfExtract.extract(filename, options, (err, data) => {
            if (err) {
                console.log(err);
                reject();
            } 
            
            resolve(data);
            
    
            console.log(data.pages[0].content);
        })
    });
    
    readPDFPromise
        .then((data) => {
        

        })
        .catch((err) => {console.error(err);
        })
    

    

}

function getClosestNeighbor(elementName) {

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


