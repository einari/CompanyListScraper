let request = require("request");
let cheerio = require("cheerio");
let fs = require("fs");

let baseUrl = "https://purehelp.se";

let getCompanyFrom = (companyUrl) => {
    let promise = new Promise(resolve => {
        request(companyUrl, (error, response, html) => {
            let $ = cheerio.load(html);

            let informationRows = $(".c_1_1");
            let getTextFrom = (index) => {
                if (informationRows[index].children[1].childNodes.length > 0) {
                    return informationRows[index].children[1].childNodes[0].data;
                }
                return "";
            }

            let company = {
                Name: getTextFrom(0),
                OrgNo: getTextFrom(1),
                Revenue: 0,
                Address: getTextFrom(3),
                Phone: getTextFrom(4),
                Web: ""
            };

            resolve(company)
        });
    });

    return promise;
};

let getCompaniesFrom = (code, page, letter) => {

    console.log(`Gettings companies on letter '${letter}' on page '${page}'`);

    let promise = new Promise(resolve => {
        let companies = [];

        let url = `${baseUrl}/lists/company/${encodeURIComponent(letter)}/Alla/${code}/Alla/${page}`;

        console.log(`Requesting : ${url}`)
        request(url, (error, response, html) => {
            let $ = cheerio.load(html);

            console.log(error);

            let buttons = $(".fr");

            let morePages = false;
            for (let i = 0; i < buttons.length; i++) {
                if (morePages == true) break;
                for (let childIndex = 0; childIndex < buttons[i].childNodes.length; childIndex++) {
                    let child = buttons[i].childNodes[childIndex];
                    if (child.type == "tag") {
                        if (child.childNodes.length > 1 && child.childNodes[1].type == "text") {
                            morePages = child.childNodes[1].data.indexOf("Nästa sida") > 0;
                            if (morePages == true) break;
                        }

                    }
                }
            }

            let compayRoutes = {};

            let anchorTags = $("a[title^='Företag']");
            for (let companyIndex = 0; companyIndex < anchorTags.length; companyIndex++) {
                compayRoutes[anchorTags[companyIndex].attribs.href] = anchorTags[companyIndex].attribs.href;
            }



            let companyCount = 0;
            for (let companyRoute in compayRoutes) {
                companyCount++;
            }
            if (companyCount == 0) resolve(companies, false);
            console.log(`Walk through and retrieve ${companyCount} companies`);

            for (let companyRoute in compayRoutes) {
                let companyUrl = `${baseUrl}${companyRoute}`;

                console.log(`Getting company information for ${companyUrl}`);
                getCompanyFrom(companyUrl).then(company => {
                    companies.push(company);
                    if (companies.length == companyCount) {
                        console.log("No more pages")
                        resolve([companies, morePages]);
                    }
                });
            }

        });
    });

    return promise;
}

let getCompaniesFromAllPages = (code, letter) => {
    let allCompanies = [];
    let promise = new Promise(resolve => {
        let recurse = (code, page, letter) => {
            getCompaniesFrom(code, page, letter).then(result => {
                let companies = result[0];
                let morePages = result[1];
                allCompanies = allCompanies.concat(companies);
                if (morePages == false) {
                    console.log("No more pages - resolve")
                    resolve(allCompanies);
                } else {
                    page++;
                    recurse(code, page, letter);
                }
            });
        };
        recurse(code, 1, letter);
    });

    return promise;

};

let getAllCompanies = (code) => {
    let promise = new Promise(resolve => {
        let allCompanies = [];

        let letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZÅÄÖ";

        let recurse = (letterIndex) => {
            if (letterIndex >= letters.length) {
                console.log("All companies retrieved")
                resolve(allCompanies);
            } else {

                let letter = letters[letterIndex++];
                getCompaniesFromAllPages(code, letter).then(companies => {
                    allCompanies = allCompanies.concat(companies);
                    letterIndex++;
                    console.log("Next letter");

                    recurse(letterIndex);
                });
            }
        };

        recurse(0);
    });
    return promise;
};

getAllCompanies("62010_dataprogrammering").then(companies => {
    fs.writeFileSync("result.json", JSON.stringify(companies));
    console.log("File written");
});