# ReadMe

## Getting started

Download and install [NodeJS](https://nodejs.org/en/). Obviously, you need Git ([Windows](https://git-for-windows.github.io/)) to be able to clone this repo.

Open a command-line and do:

```shell
$ cd /folder/where_you_have_projects
$ git clone https://github.com/einari/CompanyListScraper.git
$ cd CompanyListScraper
$ npm install
```

To run it you simply do:

```shell
$ node .
```

Wait till its finished logging and you should get a `result.json` file in the same folder.
This can then be opened using a [JSON to CSV converter](http://convertcsv.com/json-to-csv.htm) and imported into something like Excel.

### Purehelp.se - change vertical

If you want to get a different list of companies from a different vertical.
Open the `app.js` in your [favorite text editor](https://code.visualstudio.com) and change the input in the line at the bottom:

```javascript
getAllCompanies("62010_dataprogrammering").then(companies => {
    ...
});
```

The `62010_dataprogrammering` should correspond to the particular list found in the URL when browsing Purehelp.se.

