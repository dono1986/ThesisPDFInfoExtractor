"use strict";

const PDFDataExtract = require('./PDFDataExtractor.js');

const options = {
    "firstpage": 1,
    "lastpage" : 1
}; /* see below */

const dataPromise = PDFDataExtract.extractThesisData('E:/Seafile/Austausch/Abschlussarbeiten/BA_Bold/Annina Bold_869077_Bachelorthesis.pdf',options);

dataPromise.then((data) => {
            
    let frontPageInfo = PDFDataExtract.extractFrontPageData(data.pages[0].content, options);
    console.log(frontPageInfo);
})
.catch((err) => {
    console.error(err);
})
