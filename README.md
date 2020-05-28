<p align="center">
  <a href="" rel="noopener">
 <img width=200px height=200px src="./assets/logo.png" alt="Project logo"></a>
</p>

<h3 align="center">Global Emissions Observer (GEO)</h3>

<div align="center">

[![Status](https://img.shields.io/badge/status-active-success.svg)]()
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](/LICENSE)

</div>

---

<p align="center"> This visualization was created by two students during the Open Data lecture. The project was conducted without a data coach. We use the data from gapminder.com.  a portal that promotes factual education of the population through data. With our visualization we show how countries compare to each other in terms of emissions. 
    <br> 
</p>

## 📝 Table of Contents

- [📝 Table of Contents](#-table-of-contents)
- [🧐 About](#-about)
- [🏁 Extend the project <a name = "extend-the-project"></a>](#-extend-the-project)
  - [Add a new Dataset](#add-a-new-dataset)
  - [Change the ranking system](#change-the-ranking-system)
- [⛏️ Built Using](#️-built-using)
- [✍️ Authors](#️-authors)

## 🧐 About
The project displays data from gapminder.com as an area cartogram. Here you can select a category, out of which all relate in some form to the emissions of a country.
 The most interesting thing is that it always depends on how you look at the data. For greenhouse gases in absolute numbers, the most populous country, China is the worst. But when you look at the figures per inhabitant, the picture looks very different. Rich countries like Switzerland, for example, are no longer in a good position. If you now look at the whole per capita figure in terms of gross domestic product, the rich countries are in a good position again. Our conclusion from this project is that data can always be chosen in a way that serves the purpose or argument that is needed. 

## 🏁 Extend the project <a name = "extend-the-project"></a>

To adapt the project for your needs you need to clone it to a local repository and make the changes there. You then can upload it to a webserver where you can see your new project. 

### Add a new Dataset

1. Add the `.csv` file to the `data` folder. The file should be formatted such that the first row are all the years of the dataset and the first column is the country's name.
1. Then extend the `loadData.js` in the `js` folder.
In the array `datasetsInformation` (<a href="https://github.com/olistaehli/openData/blob/6deac49093d329a35ec5b2aedbe060d4f1cba09c/js/loadData.js#L11-L225">which you find here</a>) all the datasets to be loaded are stored.
    ```js
    let datasetsInformation = [ {
        "src": "../data/co2_emissions_tonnes_per_person.csv",
        "title": "CO2 Emissions in tonnes per person",
        "units": "tonnes per capita",
        "id": "co2-t-per-capita"
    } ..., 
    // Your new Dataset
    {
        "src": "../data/<name-of-the-file>.csv",
        "title": "<The title that should be displayed>",
        "units": "<The units used to describe the data values>",
        "id": "<A unique Id not used by any other Dataset>"
        "isMoreBetter": <true|false> //Indicates if a bigger value is better than a smaller. Defaults to false.
    }
    ```


### Change the ranking system
To calculated the best and worst part of the country, the project calculates a rankingscore for every country and datapoint. The score is made up by a factor of values including the score and how many countries there is data for in this country. The standard formula we used was 
```js
    ((numberOfCountries*0.5)/rank)*10 * Math.log(numberOfCountries)/Math.log(50) * normalizedMean / normalizedValue;
  ```
with the normalized Mean and Value are calculated the following way:
 ```js
 (value - min)/(max-min) * (2 - 0.5) + 0.5
 ```
 If the dataset is a dataset, where a bigger value is better the last part of the formula is inverted.
 This formula can be customized in the `Ranking.js` file, which is located in the `js` folder. The score calculation is made in the method `getRankingScore`, so at best you only customize this. 

## ⛏️ Built Using

- <a href="https://d3js.org/" >D3.js (v4) </a>
- <a href="https://jquery.com/" >jQuery </a>
- <a href="https://getbootstrap.com" >Bootstrap </a>
- <a href="https://unpkg.com/topojson@3" >Topojson (v3) </a> 
- <a href="https://github.com/vasturiano/cartogram-chart"> Cartogram Chart</a>
- <a href="https://unpkg.com/d3-simple-slider"> d3 Simple Slider </a>

## ✍️ Authors

-  Adrian Joerg (<a style="color: black;"
                href="mailto:adrian.joerg@students.unibe.ch">adrian.joerg@students.unibe.ch</a>) 
- Olivier Staehli (<a
                style="color: black;"
                href="mailto:adrian.joerg@students.unibe.ch">olivier.staehli@students.unibe.ch</a>)
